import { BaseService } from "./Service";
import { prisma } from "../utils/client";
import {
  CreateProductDto,
  IResponse,
  TProduct,
  TUser,
  ProductCategory,
  IPaged,
} from "../utils/interfaces/common";
import AppError from "../utils/error";
import { QueryOptions, Paginations, uniqueSlug } from "../utils/DBHelpers";

const isAdmin = (user: TUser) =>
  (user.roles ?? []).some((r) => r.role === "ADMIN");

// Throws unless `user` is an admin or the product's owning merchant.
// Admins can manage any product; merchants can only manage their own.
const assertCanMutate = (user: TUser, product: { merchantId: string | null }) => {
  if (isAdmin(user)) return;
  if (product.merchantId && product.merchantId === user.id) return;
  throw new AppError("You can only manage your own products", 403);
};

export class ProductService extends BaseService {
  public static async createProduct(
    productData: CreateProductDto,
    user: TUser,
  ): Promise<IResponse<TProduct>> {
    // A merchant can only ever create products under their own account —
    // any merchantId they send is ignored. Admins may set an explicit
    // merchantId (or omit it for an unowned/admin-managed listing).
    const merchantId = isAdmin(user) ? productData.merchantId : user.id;

    // Auto-generated from the name, not client-supplied: merchants
    // shouldn't need to hand-craft a URL slug to list a car, unlike News
    // where an admin author picks one deliberately. Stable once assigned —
    // updateProduct never regenerates it, even if `name` changes, so
    // shared/bookmarked product links don't silently break on a rename.
    const slug = await uniqueSlug(
      productData.name,
      async (candidate) =>
        (await prisma.product.count({ where: { slug: candidate } })) > 0,
    );

    const product = await prisma.product.create({
      data: {
        ...productData,
        merchantId,
        slug,
        category: productData.category as ProductCategory,
        galleryImages: productData.galleryImages,
      },
    });
    return {
      statusCode: 201,
      message: "Product created successfully",
      data: product,
    };
  }

  public static async updateProduct(
    id: string,
    productData: Partial<CreateProductDto>,
    user: TUser,
  ): Promise<IResponse<TProduct>> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new AppError("Product not found", 404);
    assertCanMutate(user, existing);

    // Ownership is not reassignable through a normal update, by either
    // role — merchantId is only ever set at creation time.
    const { merchantId: _ignored, ...updateData } = productData;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        category: productData.category
          ? (productData.category as ProductCategory)
          : undefined,
      },
    });
    return {
      statusCode: 200,
      message: "Product updated successfully",
      data: product,
    };
  }

  public static async deleteProduct(
    id: string,
    user: TUser,
  ): Promise<IResponse<null>> {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new AppError("Product not found", 404);
    assertCanMutate(user, existing);

    await prisma.$transaction(async (prisma) => {
      await prisma.orderItem.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });
    });

    return {
      statusCode: 200,
      message: "Product and related order items deleted successfully",
      data: null,
    };
  }

  public static async getProduct(id: string): Promise<IResponse<TProduct>> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError("Product not found", 404);
    return {
      statusCode: 200,
      message: "Product fetched successfully",
      data: product,
    };
  }

  public static async getProductBySlug(
    slug: string,
  ): Promise<IResponse<TProduct>> {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) throw new AppError("Product not found", 404);
    return {
      statusCode: 200,
      message: "Product fetched successfully",
      data: product,
    };
  }

  public static async getAllProducts(
    searchq?: string,
    limit?: number,
    currentPage?: number,
  ): Promise<IPaged<TProduct[]>> {
    const queryOptions = QueryOptions(
      ["name", "description", "teaser", "brand", "model"],
      searchq,
    );

    const pagination = Paginations(currentPage, limit);
    const products = await prisma.product.findMany({
      where: queryOptions,
      ...pagination,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalItems = await prisma.product.count({
      where: queryOptions,
    });

    return {
      statusCode: 200,
      message: "Products fetched successfully",
      data: products,
      totalItems,
      currentPage: currentPage || 1,
      itemsPerPage: limit || 15,
    };
  }

  public static async getFeaturedProducts(): Promise<IPaged<TProduct[]>> {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalItems = await prisma.product.count({
      where: { isFeatured: true },
    });

    return {
      statusCode: 200,
      message: "Featured products fetched successfully",
      data: products,
      totalItems,
      currentPage: 1,
      itemsPerPage: totalItems,
    };
  }
}
