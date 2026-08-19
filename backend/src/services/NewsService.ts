import { prisma } from "../utils/client";
import {
  CreateNewsDto,
  IResponse,
  TNews,
  NewsCategory,
  IPaged,
} from "../utils/interfaces/common";
import AppError from "../utils/error";
import { QueryOptions, Paginations } from "../utils/DBHelpers";

export class NewsService {
  public static async createNews(
    newsData: CreateNewsDto,
  ): Promise<IResponse<TNews>> {
    const news = await prisma.news.create({
      data: {
        ...newsData,
        featuredImage: newsData.featuredImage as string,
        category: newsData.category as NewsCategory,
      },
    });
    return {
      statusCode: 201,
      message: "News article created successfully",
      data: news,
    };
  }

  public static async updateNews(
    id: string,
    newsData: Partial<CreateNewsDto>,
  ): Promise<IResponse<TNews>> {
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) throw new AppError("News article not found", 404);

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...newsData,
        featuredImage: newsData.featuredImage as string | undefined,
        category: newsData.category
          ? (newsData.category as NewsCategory)
          : undefined,
      },
    });
    return {
      statusCode: 200,
      message: "News article updated successfully",
      data: news,
    };
  }

  public static async deleteNews(id: string): Promise<IResponse<null>> {
    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) throw new AppError("News article not found", 404);

    await prisma.news.delete({ where: { id } });
    return {
      statusCode: 200,
      message: "News article deleted successfully",
      data: null,
    };
  }

  public static async getNews(id: string): Promise<IResponse<TNews>> {
    const news = await prisma.news.findUnique({ where: { id } });
    if (!news) throw new AppError("News article not found", 404);
    return {
      statusCode: 200,
      message: "News article fetched successfully",
      data: news,
    };
  }

  public static async getNewsBySlug(slug: string): Promise<IResponse<TNews>> {
    const news = await prisma.news.findUnique({ where: { slug } });
    if (!news) throw new AppError("News article not found", 404);

    await prisma.news.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return {
      statusCode: 200,
      message: "News article fetched successfully",
      data: news,
    };
  }

  public static async getAllNews(
    searchq?: string,
    country?: string,
    category?: string,
    limit?: number,
    currentPage?: number,
  ): Promise<IPaged<TNews[]>> {
    const queryOptions = {
      ...QueryOptions(["title", "excerpt", "content", "author"], searchq),
      ...(country ? { country } : {}),
      ...(category ? { category: category as NewsCategory } : {}),
    };

    const pagination = Paginations(currentPage, limit);
    const news = await prisma.news.findMany({
      where: queryOptions,
      ...pagination,
      orderBy: {
        publishedAt: "desc",
      },
    });

    const totalItems = await prisma.news.count({
      where: queryOptions,
    });

    return {
      statusCode: 200,
      message: "News articles fetched successfully",
      data: news,
      totalItems,
      currentPage: currentPage || 1,
      itemsPerPage: limit || 15,
    };
  }
}
