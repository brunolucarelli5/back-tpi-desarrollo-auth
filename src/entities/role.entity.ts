import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  JoinTable,
} from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { UserEntity } from './user.entity';

@Entity('roles')
export class RoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  description: string;

  @ManyToMany(() => PermissionEntity, permission => permission.roles)
  @JoinTable()
  permissions: PermissionEntity[];

  @ManyToMany(() => UserEntity, user => user.roles)
  users: UserEntity[];
}
