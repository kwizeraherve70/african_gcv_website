import { hashSync } from "bcrypt";
import { roles } from "../../src/utils/roles";
import { prisma } from "../../src/utils/client";

async function main() {
  try {
    console.log("SEEDING");
    const admin = await prisma.user.create({
      data: {
        email: "admin@gmail.com",
        firstName: "GCV",
        lastName: "Admin",
        password: hashSync("Password123!", 10),
      },
    });
    await prisma.userRoles.create({
      data: { userId: admin.id, role: roles.ADMIN },
    });

    const admin2 = await prisma.user.create({
      data: {
        email: "admin@khm.com",
        firstName: "Alliance",
        lastName: "Admin",
        password: hashSync("Password123!", 10),
      },
    });
    await prisma.userRoles.create({
      data: { userId: admin2.id, role: roles.ADMIN },
    });

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
