import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './../entities/role.entity';
import { RoleService } from './roles.service';
import { RoleController } from './roles.controller';
import { PermissionEntity } from 'src/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, PermissionEntity])],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RolesModule {}
