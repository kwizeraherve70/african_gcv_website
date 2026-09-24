import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Tags,
  Request,
  Middlewares,
  Security,
} from "tsoa";
import { FaqService } from "../services/FaqService";
import { CreateFaqDto, IResponse, TFaq } from "../utils/interfaces/common";
import { Request as Req } from "express";
import upload from "../utils/cloudinary";
import { appendPhotoAttachments } from "../middlewares/company.middlewares";

@Tags("Faq")
@Route("/api/faq")
export class FaqController {
  @Get("/")
  public async getContacts(): Promise<IResponse<TFaq[]>> {
    return FaqService.getAllFaq();
  }

  @Get("/{id}")
  public async getContact(@Path() id: string): Promise<IResponse<TFaq | null>> {
    return FaqService.getFaq(id);
  }

  @Post("/")
  @Security("jwt", ["ADMIN"])
  @Middlewares(upload.any(), appendPhotoAttachments)
  public async createFaq(
    @Body() faqData: CreateFaqDto,
    @Request() request: Req,
  ): Promise<IResponse<TFaq>> {
    return new FaqService(request).createFaq(faqData);
  }

  @Put("/{id}")
  @Security("jwt", ["ADMIN"])
  public async updateContact(
    @Path() id: string,
    @Body() faqData: Partial<CreateFaqDto>,
  ): Promise<IResponse<TFaq | null>> {
    return FaqService.updateFaq(id, faqData);
  }

  @Delete("/{id}")
  @Security("jwt", ["ADMIN"])
  public async deleteContact(@Path() id: string): Promise<IResponse<null>> {
    await FaqService.deleteFaq(id);
    return {
      statusCode: 200,
      message: "Contacts post deleted successfully",
    };
  }
}
