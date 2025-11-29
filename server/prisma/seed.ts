import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create temporary user for development
    const tempUser = await prisma.user.upsert({
        where: { id: 'temp-user-id' },
        update: {},
        create: {
            id: 'temp-user-id',
            pushToken: null,
        },
    });

    console.log('✅ Seed completed');
    console.log('Created/verified temp user:', tempUser.id);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
