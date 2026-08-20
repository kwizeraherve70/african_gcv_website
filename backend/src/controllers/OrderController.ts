import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Tags,
  Security,
  Request,
} from "tsoa";
import {
  CreateOrderDto,
  IPaged,
  IResponse,
  TOrder,
} from "../utils/interfaces/common";
import { OrderService } from "../services/OrderService";
import { Request as ExpressRequest } from "express";

@Tags("Order")
@Route("/api/order")
export class OrderController {
  @Get("/")
  @Security("jwt", ["ADMIN"])
  public async getAllOrders(
    @Request() req: ExpressRequest,
  ): Promise<IPaged<TOrder[]>> {
    const { searchq, limit, page } = req.query;
    const currentPage = page ? parseInt(page as string) : undefined;
    return OrderService.getAllOrders(
      searchq as string | undefined,
      limit ? parseInt(limit as string) : undefined,
      currentPage,
    );
  }

  /**
   * No @Security guard by design — guest checkout depends on this being
   * callable without a token (see architecture-context.md "Guest checkout").
   */
  @Post("/")
  public async createOrder(
    @Body() orderData: CreateOrderDto,
  ): Promise<IResponse<TOrder>> {
    return OrderService.createOrder(orderData);
  }

  @Put("/{id}")
  @Security("jwt", ["ADMIN"])
  public async updateOrder(
    @Path() id: string,
    @Body() orderData: Partial<CreateOrderDto>,
  ): Promise<IResponse<TOrder>> {
    return OrderService.updateOrder(id, orderData);
  }

  @Delete("/{id}")
  @Security("jwt", ["ADMIN"])
  public async deleteOrder(@Path() id: string): Promise<IResponse<null>> {
    return OrderService.deleteOrder(id);
  }

  @Get("/{id}")
  @Security("jwt", ["ADMIN"])
  public async getOrder(@Path() id: string): Promise<IResponse<TOrder>> {
    return OrderService.getOrder(id);
  }
}
