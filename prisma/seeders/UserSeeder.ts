import { prisma } from '@/common/prisma/prisma.client';
import bcrypt from 'bcrypt';

export default async function UserSeeder() {
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
