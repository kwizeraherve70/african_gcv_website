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
  CreateNewsDto,
  IResponse,
  TNews,
  IPaged,
} from "../utils/interfaces/common";
import upload from "../utils/cloudinary";
import { appendFeaturedImage } from "../middlewares/company.middlewares";
import { NewsService } from "../services/NewsService";
import { Request as ExpressRequest } from "express";

@Tags("News")
@Route("/api/news")
export class NewsController {
  @Get("/")
  public async getAllNews(
    @Request() req: ExpressRequest,
  ): Promise<IPaged<TNews[]>> {
    const { searchq, country, category, limit, page } = req.query;
    const currentPage = page ? parseInt(page as string) : undefined;
    return NewsService.getAllNews(
      searchq as string | undefined,
      country as string | undefined,
      category as string | undefined,
      limit ? parseInt(limit as string) : undefined,
      currentPage,
    );
  }

  @Get("/slug/{slug}")
  public async getNewsBySlug(
    @Path() slug: string,
  ): Promise<IResponse<TNews>> {
    return NewsService.getNewsBySlug(slug);
  }

  @Get("/{id}")
  public async getNews(@Path() id: string): Promise<IResponse<TNews>> {
    return NewsService.getNews(id);
  }

  @Post("/")
  @Security("jwt", ["ADMIN"])
  @Middlewares(upload.any(), appendFeaturedImage)
  public async createNews(
    @Body() newsData: CreateNewsDto,
  ): Promise<IResponse<TNews>> {
    return NewsService.createNews(newsData);
  }

  @Put("/{id}")
  @Security("jwt", ["ADMIN"])
  @Middlewares(upload.any(), appendFeaturedImage)
  public async updateNews(
    @Path() id: string,
    @Body() newsData: Partial<CreateNewsDto>,
  ): Promise<IResponse<TNews>> {
    return NewsService.updateNews(id, newsData);
  }

  @Delete("/{id}")
  @Security("jwt", ["ADMIN"])
  public async deleteNews(@Path() id: string): Promise<IResponse<null>> {
    return NewsService.deleteNews(id);
  }
}
