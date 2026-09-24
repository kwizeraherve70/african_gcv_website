import { Body, Delete, Get, Path, Post, Put, Route, Tags, Request, Security } from "tsoa";
import { ServiceService } from "../services/serviceService";
import {
  CreateServiceDto,
  IResponse,
  TService,
} from "../utils/interfaces/common";
import { Request as Req } from "express";

@Tags("Service")
@Route("/api/service")
export class ServiceController {
  @Get("/")
  public async getServices(): Promise<IResponse<TService[]>> {
    return ServiceService.getAllService();
  }

  @Get("/{id}")
  public async getService(
    @Path() id: string,
  ): Promise<IResponse<TService | null>> {
    return ServiceService.getService(id);
  }

  @Post("/")
  @Security("jwt", ["ADMIN"])
  public async createService(
    @Body() serviceData: CreateServiceDto,
    @Request() request: Req,
  ): Promise<IResponse<TService>> {
    return new ServiceService(request).createService(serviceData);
  }

  @Put("/{id}")
  @Security("jwt", ["ADMIN"])
  public async updateService(
    @Path() id: string,
    @Body() serviceData: CreateServiceDto,
  ): Promise<IResponse<TService | null>> {
    return ServiceService.updateService(id, serviceData);
  }

  @Delete("/{id}")
  @Security("jwt", ["ADMIN"])
  public async deleteService(@Path() id: string): Promise<IResponse<null>> {
    await ServiceService.deleteService(id);
    return {
      statusCode: 200,
      message: "Service post deleted successfully",
    };
  }
}
