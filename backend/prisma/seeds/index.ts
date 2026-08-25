import { hashSync } from "bcrypt";
import { roles } from "../../src/utils/roles";
import { prisma } from "../../src/utils/client";
import { ProductService } from "../../src/services/ProductService";
import { TUser } from "../../src/utils/interfaces/common";

// Car-dealership demo catalog — matches the frontend mock data's shape
// (see architecture-context.md "Notable divergences" #5) so the admin
// panel and shop pages aren't empty on a freshly seeded database.
const DEMO_PRODUCTS = [
  {
    name: "Tesla Model 3",
    description: "Electric sedan with autopilot and long-range battery.",
    teaser: "Fully electric, zero emissions, top-tier tech.",
    category: "SEDANS",
    price: 42000,
    brand: "Tesla",
    model: "Model 3",
    thumbnail: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    stockQuantity: 5,
  },
  {
    name: "Toyota RAV4",
    description: "Reliable compact SUV with all-wheel drive.",
    teaser: "Spacious, efficient, built for any terrain.",
    category: "SUVS",
    price: 28000,
    brand: "Toyota",
    model: "RAV4",
    thumbnail: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    stockQuantity: 8,
  },
  {
    name: "Porsche 911",
    description: "Iconic sports car with track-ready performance.",
    teaser: "Precision engineering meets pure driving thrill.",
    category: "SPORTS_CARS",
    price: 115000,
    brand: "Porsche",
    model: "911",
    thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    stockQuantity: 2,
  },
  {
    name: "Range Rover Vogue",
    description: "Flagship luxury SUV with premium interior finishing.",
    teaser: "Refined comfort for every journey.",
    category: "LUXURY",
    price: 98000,
    brand: "Land Rover",
    model: "Range Rover Vogue",
    thumbnail: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
    stockQuantity: 3,
  },
] as const;

// Re-runnable: an admin already existing (email collision) or already
// having its ADMIN role shouldn't abort the rest of the seed, since this
// script may be re-run against a database that's already partially seeded.
async function ensureAdmin(email: string, firstName: string, lastName: string) {
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, firstName, lastName, password: hashSync("Password123!", 10) },
  });
  const hasAdminRole = await prisma.userRoles.findFirst({
    where: { userId: user.id, role: roles.ADMIN },
  });
  if (!hasAdminRole) {
    await prisma.userRoles.create({ data: { userId: user.id, role: roles.ADMIN } });
  }
  return user;
}

async function main() {
  try {
    console.log("SEEDING");
    const admin = await ensureAdmin("admin@gmail.com", "GCV", "Admin");
    await ensureAdmin("admin@khm.com", "Alliance", "Admin");

    const adminAsUser = {
      id: admin.id,
      email: admin.email,
      roles: [{ id: "seed", role: "ADMIN", userId: admin.id }],
    } as TUser;

    const existingSlugs = new Set(
      (await prisma.product.findMany({ select: { name: true } })).map((p) => p.name),
    );
    for (const product of DEMO_PRODUCTS) {
      if (existingSlugs.has(product.name)) continue; // already seeded
      await ProductService.createProduct(
        { ...product, galleryImages: [] },
        adminAsUser,
      );
    }

    console.log("SEEDING COMPLETE");
  } catch (error) {
    console.log("SEEDING FAILED", error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
