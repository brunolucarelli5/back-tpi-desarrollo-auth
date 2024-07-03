import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { PermissionService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from '../entities/permission.entity';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionEntity> {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  findAll(): Promise<PermissionEntity[]> {
    return this.permissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<PermissionEntity> {
    return this.permissionService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updatePermissionDto: UpdatePermissionDto): Promise<PermissionEntity> {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.permissionService.remove(id);
  }
}
