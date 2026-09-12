import app from './app';
import { config } from './config';
import { prisma } from './lib/prisma';

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✓ Successfully connected to database.');

    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🚀 MaanakVerify Backend Server Running`);
      console.log(`📡 Port:        ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API Base:    http://localhost:${config.port}/api`);
      console.log(`====================================================`);
    });

    const shutdown = async () => {
      console.log('\nShutting down server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Prisma disconnected. Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
