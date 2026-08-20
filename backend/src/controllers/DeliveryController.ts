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
} from "tsoa";
import {
  CreateDeliveryDto,
  IResponse,
  TDelivery,
  UpdateDeliveryDto,
} from "../utils/interfaces/common";
import { DeliveryService } from "../services/DeliveryService";

@Tags("Delivery")
@Route("/api/delivery")
export class DeliveryController {
  @Get("/")
  @Security("jwt", ["ADMIN"])
  public async getAllDeliveries(): Promise<IResponse<TDelivery[]>> {
    return DeliveryService.getAllDeliveries();
  }

  /**
   * No @Security guard by design — created as part of guest checkout
   * immediately after POST /api/order (see architecture-context.md "Guest
   * checkout"), so it must be callable without a token.
   */
  @Post("/")
  public async createDelivery(
    @Body() deliveryData: CreateDeliveryDto,
  ): Promise<IResponse<TDelivery>> {
    return DeliveryService.createDelivery(deliveryData);
  }

  @Put("/{id}")
  @Security("jwt", ["ADMIN"])
  public async updateDelivery(
    @Path() id: string,
    @Body() deliveryData: Partial<UpdateDeliveryDto>,
  ): Promise<IResponse<TDelivery>> {
    return DeliveryService.updateDelivery(id, deliveryData);
  }

  @Delete("/{id}")
  @Security("jwt", ["ADMIN"])
  public async deleteDelivery(@Path() id: string): Promise<IResponse<null>> {
    return DeliveryService.deleteDelivery(id);
  }

  @Get("/{id}")
  @Security("jwt", ["ADMIN"])
  public async getDelivery(@Path() id: string): Promise<IResponse<TDelivery>> {
    return DeliveryService.getDelivery(id);
  }
}
