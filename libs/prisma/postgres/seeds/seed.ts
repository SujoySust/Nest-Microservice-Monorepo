import { PostgresService } from '../../src/postgres.service';

const prisma = new PostgresService();

async function main() {
  await prisma.user.create({
    data: {
      usercode: 'sujoy',
      email: 'sujoy@yopmail.com',
    },
  });
}

main()
  .catch((e) => {
    console.error(e.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
