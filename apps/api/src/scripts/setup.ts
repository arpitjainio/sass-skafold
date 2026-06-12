import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { RoleService } from '../role/role.service';

async function setup() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const roleService = app.get(RoleService);

    console.log('🔧 Setting up database...');

    // Seed roles
    console.log('📝 Seeding default roles...');
    await roleService.seedRoles();
    console.log('✅ Roles seeded successfully');

    console.log('👤 Seeding development admin user...');
    const adminUser = await roleService.ensureDevelopmentAdminUser({
      email: process.env.DEV_ADMIN_EMAIL,
      password: process.env.DEV_ADMIN_PASSWORD,
      name: process.env.DEV_ADMIN_NAME,
    });
    console.log('✅ Development admin user is ready');
    console.log(`   email: ${adminUser.email}`);
    console.log(`   password: ${adminUser.password}`);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

setup()
  .then(() => {
    console.log('🎉 Setup completed successfully!');
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
