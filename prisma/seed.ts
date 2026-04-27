import { prisma } from '../src/lib/db';

async function main() {
  console.log('Seeding default todo categories...');

  // Create default "General" category for each user that doesn't have one
  const users = await prisma.user.findMany({
    select: { id: true }
  });

  for (const user of users) {
    const existingGeneral = await prisma.todoCategory.findFirst({
      where: {
        userId: user.id,
        name: 'General'
      }
    });

    if (!existingGeneral) {
      await prisma.todoCategory.create({
        data: {
          name: 'General',
          color: '#6b7280',
          icon: 'folder',
          description: 'Default category for uncategorized tasks',
          userId: user.id
        }
      });
      console.log(`Created General category for user ${user.id}`);
    }
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
