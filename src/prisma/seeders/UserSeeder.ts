import { PrismaService } from '@/prisma/prisma.service';
import bcrypt from 'bcrypt';

export default async function UserSeeder(prisma: PrismaService) {
  const hashedPassword = await bcrypt.hash('password', 10);

  await prisma.user.createMany({
    data: [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      },
    ],
    skipDuplicates: true, // Prevent errors if users already exist
  });

  console.log('UserSeeder executed');
}
