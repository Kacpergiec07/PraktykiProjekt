import { Order, OrderItem, OrderStatus, Prisma } from ".prisma/client";
import { drugService } from "./drug.service";
import { prisma } from "../uttils/prisma";
import { AppError } from "../uttils/app-error";

interface CreateOrderItem {
  drugId: string;
  quantity: number;
}

interface CreateOrderInput {
  userId: string;
  items: CreateOrderItem[];
}

interface OrderQueryOptions {
  userId?: string;
  page?: number;
  limit?: number;
  status?: OrderStatus;
  fromDate?: Date;
  toDate?: Date;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface OrderWithItems extends Order {
  orderItems: (OrderItem & {
    drug: {
      id: string;
      name: string;
      companyName: string;
      price: number;
    };
  })[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface PaginatedOrdersResult {
  data: OrderWithItems[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class OrderService {
  async createOrder(data: CreateOrderInput): Promise<OrderWithItems> {
    // Stwórz zamówienie
    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        status: OrderStatus.PENDING,
      },
    });

    // Dla każdego produktu
    for (const item of data.items) {
      const drug = await drugService.getDrugById(item.drugId);

      if (drug.amount < item.quantity) {
        throw AppError.badRequest(
          `Not enough stock available for ${drug.name}. Available: ${drug.amount}, Requested: ${item.quantity}`
        );
      }

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          drugId: item.drugId,
          quantity: item.quantity,
          price: drug.price,
        },
      });

      await prisma.drug.update({
        where: { id: item.drugId },
        data: {
          amount: drug.amount - item.quantity,
        },
      });
    }

    return this.getOrderById(order.id);
  }

  async getOrderById(id: string): Promise<OrderWithItems> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            drug: {
              select: {
                id: true,
                name: true,
                companyName: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw AppError.notFound("Order not found");
    }

    return order;
  }

  async getOrders(options: OrderQueryOptions): Promise<PaginatedOrdersResult> {
    const {
      userId,
      page = 0,
      limit = 15,
      status,
      fromDate,
      toDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const where: Prisma.OrderWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.orderDate = {};
      if (fromDate) where.orderDate.gte = fromDate;
      if (toDate) where.orderDate.lte = toDate;
    }

    const total = await prisma.order.count({ where });

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    orderBy[sortBy as keyof Prisma.OrderOrderByWithRelationInput] = sortOrder;

    const orders = await prisma.order.findMany({
      where,
      orderBy,
      skip: page * limit,
      take: limit,
      include: {
        orderItems: {
          include: {
            drug: {
              select: {
                id: true,
                name: true,
                companyName: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.getOrderById(id);

    return prisma.order.update({
      where: { id },
      data: {
        status,
      },
    });
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.getOrderById(id);

    if (order.status !== OrderStatus.PENDING) {
      throw AppError.badRequest("Only pending orders can be cancelled");
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });

    for (const item of order.orderItems) {
      await prisma.drug.update({
        where: { id: item.drugId },
        data: {
          amount: {
            increment: item.quantity,
          },
        },
      });
    }

    return updatedOrder;
  }

  async getTotalRevenue(fromDate?: Date, toDate?: Date): Promise<number> {
    const where: Prisma.OrderItemWhereInput = {
      order: {
        status: OrderStatus.COMPLETED,
      },
    };

    if (fromDate || toDate) {
      if (!where.order) return 0;

      where.order.orderDate = {};
      if (fromDate) where.order.orderDate.gte = fromDate;
      if (toDate) where.order.orderDate.lte = toDate;
    }

    const result = await prisma.orderItem.aggregate({
      where,
      _sum: {
        price: true,
        quantity: true,
      },
    });

    const totalPrice = result._sum.price || 0;
    const totalQuantity = result._sum.quantity || 0;

    if (!totalPrice || !totalQuantity) {
      return 0;
    }

    return parseFloat((totalPrice * totalQuantity).toFixed(2));
  }
}

export const orderService = new OrderService();
