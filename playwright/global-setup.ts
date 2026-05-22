import { execSync } from 'child_process';
import path from 'path';

async function globalSetup() {
  console.log('Running global setup: starting Postgres container...');

  try {
    const composeFile = path.resolve(__dirname, '../docker-compose.test.yml');
    execSync(`docker compose -f "${composeFile}" up -d --wait`, { stdio: 'inherit' });
    console.log('Postgres container started successfully.');
  } catch (error) {
    console.error('Failed to start Docker container. Ensure Docker is running.', error);
  }

  // Set the connection string for the test DB
  const testDbUrl = 'postgresql://postgres:password@localhost:5432/testdb';
  process.env.DATABASE_URL = testDbUrl;

  try {
    console.log('Running prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('Running prisma db push...');
    execSync('npx prisma db push --accept-data-loss', {
      env: {
        ...process.env,
        DATABASE_URL: testDbUrl,
      },
      stdio: 'inherit',
    });
    console.log('Database pushed successfully');
  } catch (error) {
    console.error('Failed to run Prisma commands:', error);
  }
}

export default globalSetup;
