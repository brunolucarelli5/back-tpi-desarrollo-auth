import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionEntity } from 'src/entities/permission.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>
  ) {}

  create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  findAll(): Promise<RoleEntity[]> {
    return this.roleRepository.find({ relations: ['permissions', 'roles'] });
  }

  findOne(id: number): Promise<RoleEntity> {
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'roles'],
    });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    await this.roleRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async assignPermission(
    idRole: number,
    permissionId: number
  ): Promise<HttpException> {
    const permission = await this.permissionRepository.findOneBy({
      id: permissionId,
    });
    if (!permission) {
      throw new HttpException("Permission not found", 404);
    } else {
      const role = await this.roleRepository.findOneBy({ id: idRole });
      if (!role) {
        throw new HttpException("Role not found", 404);
      } else {
        if (!role.permissions) {
          role.permissions = [];
        }
        // Add the new permission
        role.permissions = [...role.permissions, permission];
        await this.roleRepository.save(role);
        throw new HttpException("Permission assigned", 200);
      }
    }
  }
}
