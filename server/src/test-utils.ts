import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Address } from './entities/Address';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const tokenSecretKey = process.env.SESSION_SECRET || 'superlongstring';

let testDataSource: DataSource;

export async function setupTestDB(): Promise<DataSource> {
  testDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'my_favorite_places',
    entities: [User, Address],
    synchronize: true,
    dropSchema: true,
    logging: false,
  });
  await testDataSource.initialize();
  return testDataSource;
}

export async function teardownTestDB(): Promise<void> {
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy();
  }
}

export async function createTestUser(
  email: string = 'test@test.com',
  password: string = 'password123',
): Promise<{ user: User; token: string }> {
  const user = new User();
  user.email = email;
  user.hashedPassword = await argon2.hash(password);
  await user.save();
  const token = jwt.sign({ userId: user.id }, tokenSecretKey);
  return { user, token };
}
