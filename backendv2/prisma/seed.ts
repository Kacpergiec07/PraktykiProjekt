import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.refreshToken.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.drug.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating users...");

  // Create default admin user
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@pharmacy.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
    },
  });

  // Create default pharmacist user
  const pharmacistPassword = await bcrypt.hash("Pharmacist123!", 10);
  const pharmacistUser = await prisma.user.create({
    data: {
      email: "pharmacist@pharmacy.com",
      password: pharmacistPassword,
      firstName: "Pharmacy",
      lastName: "Manager",
      role: UserRole.PHARMACIST,
    },
  });

  // Create default employee user
  const employeePassword = await bcrypt.hash("Employee123!", 10);
  const employeeUser = await prisma.user.create({
    data: {
      email: "employee@pharmacy.com",
      password: employeePassword,
      firstName: "Employee",
      lastName: "Worker",
      role: UserRole.EMPLOYEE,
    },
  });

  // Create default customer user
  const customerPassword = await bcrypt.hash("Customer123!", 10);
  const customerUser = await prisma.user.create({
    data: {
      email: "customer@example.com",
      password: customerPassword,
      firstName: "John",
      lastName: "Doe",
      role: UserRole.CUSTOMER,
    },
  });

  console.log("Creating drugs...");

  // Create sample drugs
  const drugs = await Promise.all([
    prisma.drug.create({
      data: {
        name: "Paracetamol",
        dose: 500,
        price: 5.99,
        type: "tablet",
        companyName: "Pharma Co.",
        amount: 100,
      },
    }),
    prisma.drug.create({
      data: {
        name: "Ibuprofen",
        dose: 400,
        price: 7.99,
        type: "tablet",
        companyName: "MediCorp",
        amount: 50,
      },
    }),
    prisma.drug.create({
      data: {
        name: "Amoxicillin",
        dose: 250,
        price: 12.99,
        type: "capsule",
        companyName: "BioMed",
        amount: 30,
      },
    }),
    prisma.drug.create({
      data: {
        name: "Loratadine",
        dose: 10,
        price: 8.5,
        type: "tablet",
        companyName: "AllerCure",
        amount: 20,
      },
    }),
    prisma.drug.create({
      data: {
        name: "Vitamin C",
        dose: 1000,
        price: 14.99,
        type: "tablet",
        companyName: "VitaHealth",
        amount: 60,
      },
    }),
  ]);

  console.log("Creating sample orders...");

  // Create a sample order for the customer
  const order = await prisma.order.create({
    data: {
      userId: customerUser.id,
      status: "PENDING",
      orderItems: {
        create: [
          {
            drugId: drugs[0].id,
            quantity: 2,
            price: drugs[0].price,
          },
          {
            drugId: drugs[3].id,
            quantity: 1,
            price: drugs[3].price,
          },
        ],
      },
    },
  });

  // Update drug amounts
  await prisma.drug.update({
    where: { id: drugs[0].id },
    data: { amount: drugs[0].amount - 2 },
  });

  await prisma.drug.update({
    where: { id: drugs[3].id },
    data: { amount: drugs[3].amount - 1 },
  });

  console.log("Seed completed successfully!");
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.drug.count()} drugs`);
  console.log(`Created ${await prisma.order.count()} orders`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
