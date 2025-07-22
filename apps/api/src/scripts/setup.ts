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
