import { Drug, Prisma } from ".prisma/client";
import { prisma } from "../uttils/prisma";
import { AppError } from "../uttils/app-error";

// Define service interfaces
interface CreateDrugInput {
  name: string;
  dose: number;
  price: number;
  type: string;
  companyName: string;
  amount: number;
}

interface UpdateDrugInput {
  name?: string;
  dose?: number;
  price?: number;
  type?: string;
  companyName?: string;
  amount?: number;
}

interface DrugQueryOptions {
  page?: number;
  limit?: number;
  name?: string;
  companyName?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface PaginatedDrugsResult {
  data: Drug[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Drug service class
 */
class DrugService {
  /**
   * Create a new drug
   */
  async createDrug(data: CreateDrugInput): Promise<Drug> {
    return prisma.drug.create({
      data,
    });
  }

  /**
   * Get drug by ID
   */
  async getDrugById(id: string): Promise<Drug> {
    const drug = await prisma.drug.findUnique({
      where: { id },
    });
    if (!drug) {
      throw AppError.notFound("Drug not found");
    }

    return drug;
  }

  /**
   * Get all drugs with pagination and filtering
   */
  async getDrugs(options: DrugQueryOptions): Promise<PaginatedDrugsResult> {
    const {
      page = 0,
      limit = 15,
      name,
      companyName,
      type,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    // Build where clause
    const where: Prisma.DrugWhereInput = {};

    if (name) {
      where.name = {
        contains: name,
        mode: "insensitive",
      } as Prisma.StringFilter;
    }

    if (companyName) {
      where.companyName = {
        contains: companyName,
        mode: "insensitive",
      } as Prisma.StringFilter;
    }

    if (type) {
      where.type = {
        contains: type,
        mode: "insensitive",
      } as Prisma.StringFilter;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};

      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }

      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Get total count
    const total = await prisma.drug.count({ where });

    // Build sort object
    const orderBy: Prisma.DrugOrderByWithRelationInput = {};
    orderBy[sortBy as keyof Prisma.DrugOrderByWithRelationInput] = sortOrder;

    // Get drugs
    const drugs = await prisma.drug.findMany({
      where,
      orderBy,
      skip: page * limit,
      take: limit,
    });

    return {
      data: drugs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a drug
   */
  async updateDrug(id: string, data: UpdateDrugInput): Promise<Drug> {
    // Check if drug exists
    await this.getDrugById(id);

    // Update drug
    return prisma.drug.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a drug
   */
  async deleteDrug(id: string): Promise<void> {
    // Check if drug exists
    await this.getDrugById(id);

    // Check if drug is referenced in any order
    const orderItem = await prisma.orderItem.findFirst({
      where: { drugId: id },
    });

    if (orderItem) {
      throw AppError.conflict(
        "Cannot delete drug as it is referenced in one or more orders"
      );
    }

    // Delete drug
    await prisma.drug.delete({
      where: { id },
    });
  }

  /**
   * Reduce drug amount (used when creating orders)
   */
  async reduceDrugAmount(id: string, amount: number): Promise<Drug> {
    // Get drug
    const drug = await this.getDrugById(id);

    // Check if enough amount available
    if (drug.amount < amount) {
      throw AppError.badRequest(
        `Not enough stock available for ${drug.name}. Available: ${drug.amount}, Requested: ${amount}`
      );
    }

    // Update drug amount
    return prisma.drug.update({
      where: { id },
      data: {
        amount: drug.amount - amount,
      },
    });
  }
}

export const drugService = new DrugService();
