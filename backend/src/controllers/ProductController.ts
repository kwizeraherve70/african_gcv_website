import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Tags,
  Middlewares,
  Security,
  Request,
} from "tsoa";
import {
  CreateProductDto,
  IResponse,
  TProduct,
  TUser,
  IPaged,
} from "../utils/interfaces/common";
import upload from "../utils/cloudinary";
import { appendPhotoAttachments } from "../middlewares/company.middlewares";
import { ProductService } from "../services/ProductService";
import { Request as ExpressRequest } from "express";

@Tags("Product")
@Route("/api/product")
export class productController {
  @Get("/")
  public async getAllProducts(
    @Request() req: ExpressRequest,
  ): Promise<IPaged<TProduct[]>> {
    const { searchq, limit, page } = req.query;
    const currentPage = page ? parseInt(page as string) : undefined;
    return ProductService.getAllProducts(
      searchq as string | undefined,
      limit ? parseInt(limit as string) : undefined,
      currentPage,
    );
  }

  @Get("/featured")
  public async getFeaturedProducts(): Promise<IPaged<TProduct[]>> {
    return ProductService.getFeaturedProducts();
  }

  @Post("/")
  @Security("jwt", ["ADMIN", "MERCHANT"])
  @Middlewares(upload.any(), appendPhotoAttachments)
  public async createProduct(
    @Body() productData: CreateProductDto,
    @Request() req: ExpressRequest,
  ): Promise<IResponse<TProduct>> {
    return ProductService.createProduct(productData, req.user as TUser);
  }

  @Put("/{id}")
  @Security("jwt", ["ADMIN", "MERCHANT"])
  @Middlewares(upload.any(), appendPhotoAttachments)
  public async updateProduct(
    @Path() id: string,
    @Body() productData: Partial<CreateProductDto>,
    @Request() req: ExpressRequest,
  ): Promise<IResponse<TProduct>> {
    return ProductService.updateProduct(id, productData, req.user as TUser);
  }

  @Delete("/{id}")
  @Security("jwt", ["ADMIN", "MERCHANT"])
  public async deleteProduct(
    @Path() id: string,
    @Request() req: ExpressRequest,
  ): Promise<IResponse<null>> {
    return ProductService.deleteProduct(id, req.user as TUser);
  }

  @Get("/slug/{slug}")
  public async getProductBySlug(
    @Path() slug: string,
  ): Promise<IResponse<TProduct>> {
    return ProductService.getProductBySlug(slug);
  }

  @Get("/{id}")
  public async getProduct(@Path() id: string): Promise<IResponse<TProduct>> {
    return ProductService.getProduct(id);
  }
}
