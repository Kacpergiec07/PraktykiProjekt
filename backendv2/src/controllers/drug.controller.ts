import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { drugService } from "../services/drug.service";

/**
 * Drug controller class
 */
export class DrugController {
  /**
   * Create a new drug
   */
  static async createDrug(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, dose, price, type, companyName, amount } = req.body;

      const drug = await drugService.createDrug({
        name,
        dose,
        price,
        type,
        companyName,
        amount,
      });

      res.status(StatusCodes.CREATED).json({
        status: "success",
        data: drug,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get drug by ID
   */
  static async getDrugById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const drug = await drugService.getDrugById(id);

      res.status(StatusCodes.OK).json({
        status: "success",
        data: drug,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all drugs with pagination and filtering
   */
  static async getDrugs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page,
        limit,
        name,
        companyName,
        type,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await drugService.getDrugs({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        name: name as string,
        companyName: companyName as string,
        type: type as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as "asc" | "desc",
      });

      res.status(StatusCodes.OK).json({
        status: "success",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a drug
   */
  static async updateDrug(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { name, dose, price, type, companyName, amount } = req.body;

      const drug = await drugService.updateDrug(id, {
        name,
        dose,
        price,
        type,
        companyName,
        amount,
      });

      res.status(StatusCodes.OK).json({
        status: "success",
        data: drug,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a drug
   */
  static async deleteDrug(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      await drugService.deleteDrug(id);

      res.status(StatusCodes.NO_CONTENT).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
