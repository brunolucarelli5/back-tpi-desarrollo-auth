import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from './../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  create(createPermissionDto: CreatePermissionDto): Promise<PermissionEntity> {
    const permission = this.permissionRepository.create(createPermissionDto);
    return this.permissionRepository.save(permission);
  }

  findAll(): Promise<PermissionEntity[]> {
    return this.permissionRepository.find({ relations: ['users', 'roles'] });
  }

  findOne(id: number): Promise<PermissionEntity> {
    return this.permissionRepository.findOne({
      where: { id },
      relations: ['users', 'roles'],
    });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<PermissionEntity> {
    await this.permissionRepository.update(id, updatePermissionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.permissionRepository.delete(id);
  }
}
