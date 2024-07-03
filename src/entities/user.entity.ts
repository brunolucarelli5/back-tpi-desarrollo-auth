import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @ManyToMany(() => PermissionEntity, permission => permission.users)
  @JoinTable()
  permissions: PermissionEntity[];

  @ManyToMany(() => RoleEntity, role => role.users)
  @JoinTable()
  roles: RoleEntity[];

  get permissionCodes(): string[] {
    const permissions: string[] = this.permissions
      ? this.permissions.map(permission => permission.name)
      : [];
    const permissionsFromRoles: string[] = this.roles
      ? this.roles.flatMap(role =>
          role.permissions.map(permission => permission.name)
        )
      : [];
    return Array.from(new Set([...permissions, ...permissionsFromRoles]));
  }
}
