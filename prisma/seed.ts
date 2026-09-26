import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_USERS = [
  {
    username: "owner",
    name: "Owner",
    role: "OWNER" as const,
    password: process.env.SEED_OWNER_PASSWORD,
  },
  {
    username: "waiter",
    name: "Waiter",
    role: "WAITER" as const,
    password: process.env.SEED_WAITER_PASSWORD,
  },
  {
    username: "chef",
    name: "Chef",
    role: "CHEF" as const,
    password: process.env.SEED_CHEF_PASSWORD,
  },
];

const FALLBACK_PASSWORD = "ChangeMe123!";

async function main() {
  for (const user of SEED_USERS) {
    const password = user.password ?? FALLBACK_PASSWORD;
    if (!user.password) {
      console.warn(
        `No SEED_${user.role}_PASSWORD set for "${user.username}" - using fallback default. Change it after seeding.`
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
      where: { username: user.username },
      update: { passwordHash, name: user.name, role: user.role },
      create: {
        username: user.username,
        passwordHash,
        name: user.name,
        role: user.role,
      },
    });

    console.log(`Seeded user "${user.username}" (${user.role})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
