import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import { AppError } from "../uttils/app-error";
import { config } from "../config";
// We need to extend the config type to include Mistral AI
declare module "../config" {
  interface Config {
    mistralAi: {
      apiKey: string;
    };
  }
}
import { drugService } from "../services/drug.service";
import { orderService } from "../services/order.service";

/**
 * Controller for handling AI requests with Mistral AI
 */
export class AiController {
  /**
   * Handle chat completion requests to Mistral AI
   */
  static async chatCompletion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { messages, options = {} } = req.body;

      if (!messages || !Array.isArray(messages)) {
        throw AppError.badRequest("Messages must be an array");
      }

      // Prepare system context
      const systemContext = {
        role: "system",
        content: `You are a helpful pharmacy assistant for API Apteka. 
        You can help users find medications, place orders, and check order history. 
        You have access to tools that can retrieve real-time data from the pharmacy system.
        Always respond in Polish unless specifically asked to use another language.`,
      };

      // Add system context at the beginning if not present
      if (messages.length === 0 || messages[0].role !== "system") {
        messages.unshift(systemContext);
      }

      // Make request to Mistral AI
      const response = await axios.post(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: options.model || "mistral-medium",
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2048,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.mistralAi.apiKey}`,
          },
        }
      );

      res.status(StatusCodes.OK).json({
        status: "success",
        data: response.data.choices[0].message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Execute a tool based on AI request
   */
  static async executeTool(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { toolName, parameters, messages } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw AppError.unauthorized("Not authenticated");
      }

      if (!toolName) {
        throw AppError.badRequest("Tool name is required");
      }

      let result;

      // Execute the appropriate tool
      switch (toolName) {
        case "getDrugs":
          result = await drugService.getDrugs({
            page: parameters?.page || 0,
            limit: parameters?.limit || 10,
            name: parameters?.name,
            companyName: parameters?.companyName,
            type: parameters?.type,
            minPrice: parameters?.minPrice,
            maxPrice: parameters?.maxPrice,
          });
          break;

        case "getDrugById":
          if (!parameters?.id) {
            throw AppError.badRequest("Drug ID is required");
          }
          result = await drugService.getDrugById(parameters.id);
          break;

        case "getUserOrders":
          result = await orderService.getOrders({
            userId,
            page: parameters?.page || 0,
            limit: parameters?.limit || 10,
            status: parameters?.status,
            fromDate: parameters?.fromDate
              ? new Date(parameters.fromDate)
              : undefined,
            toDate: parameters?.toDate
              ? new Date(parameters.toDate)
              : undefined,
          });
          break;

        case "getOrderById":
          if (!parameters?.id) {
            throw AppError.badRequest("Order ID is required");
          }

          const order = await orderService.getOrderById(parameters.id);

          // Ensure user has access to this order
          if (order.userId !== userId && req.user?.role === "CUSTOMER") {
            throw AppError.forbidden(
              "You don't have permission to access this order"
            );
          }

          result = order;
          break;

        case "placeOrder":
          if (!parameters?.items || !Array.isArray(parameters.items)) {
            throw AppError.badRequest("Order items are required");
          }

          result = await orderService.createOrder({
            userId,
            items: parameters.items,
          });
          break;

        default:
          throw AppError.badRequest(`Unknown tool: ${toolName}`);
      }

      // Use Mistral AI to interpret the result
      const response = await axios.post(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: "mistral-medium",
          messages: [
            {
              role: "system",
              content: `You are a helpful pharmacy assistant. 
              Interpret the following data and provide a helpful response in Polish.
              Data: ${JSON.stringify(result)}
              
              If this is a list of drugs, summarize the most important ones.
              If this is order information, provide a clear summary of the order details.
              If this is an error, explain it in user-friendly terms.`,
            },
            ...messages,
          ],
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.mistralAi.apiKey}`,
          },
        }
      );

      res.status(StatusCodes.OK).json({
        status: "success",
        data: {
          toolResult: result,
          interpretation: response.data.choices[0].message,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available tools
   */
  static async getTools(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Define available tools for the current user
      const tools = [
        {
          name: "getDrugs",
          description: "Get a list of available drugs",
          parameters: {
            page: "Page number (optional)",
            limit: "Number of results per page (optional)",
            name: "Filter by drug name (optional)",
            companyName: "Filter by manufacturer (optional)",
            type: "Filter by drug type (optional)",
            minPrice: "Minimum price (optional)",
            maxPrice: "Maximum price (optional)",
          },
        },
        {
          name: "getDrugById",
          description: "Get details about a specific drug",
          parameters: {
            id: "Drug ID (required)",
          },
        },
        {
          name: "getUserOrders",
          description: "Get orders for the current user",
          parameters: {
            page: "Page number (optional)",
            limit: "Number of results per page (optional)",
            status: "Filter by order status (optional)",
            fromDate: "Start date (optional)",
            toDate: "End date (optional)",
          },
        },
        {
          name: "getOrderById",
          description: "Get details about a specific order",
          parameters: {
            id: "Order ID (required)",
          },
        },
        {
          name: "placeOrder",
          description: "Place a new order",
          parameters: {
            items:
              "Array of items to order (required). Each item must have drugId and quantity.",
          },
        },
      ];

      res.status(StatusCodes.OK).json({
        status: "success",
        data: tools,
      });
    } catch (error) {
      next(error);
    }
  }
}
