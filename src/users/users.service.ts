import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import { LoginDTO } from "src/interfaces/login.dto";
import { RegisterDTO } from "src/interfaces/register.dto";
import { UserI } from "src/interfaces/user.interface";
import { UserEntity } from "../entities/user.entity";
import { hashSync, compareSync } from "bcrypt";
import { JwtService } from "src/jwt/jwt.service";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { PermissionEntity } from "src/entities/permission.entity";
import { RoleEntity } from "src/entities/role.entity";
import * as moment from 'moment';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(PermissionEntity)
    private permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>
  ) {}

  async refreshToken(refreshToken: string) {
    return this.jwtService.refreshToken(refreshToken);
  }

  async canDo(user: UserEntity, permission: string): Promise<boolean> {
    const userPermissions = user.permissions ? user.permissions.map((p: PermissionEntity) => p.name) : [];
    const rolePermissions = user.roles ? user.roles.flatMap(role => role.permissions ? role.permissions.map((p: PermissionEntity) => p.name) : []) : [];
    const allPermissions = [...userPermissions, ...rolePermissions];
    console.log(allPermissions);
    const result: boolean = allPermissions.includes(permission);
    console.log(result);
    if (!result) {
      throw new UnauthorizedException();
    } else {
      return result;
    }
  }

  async register(body: RegisterDTO) {
    try {
      console.log("Se recibió el siguiente body: ", body)
      const user = new UserEntity();
      console.log("Se creó el siguiente usuario: ", user)
      Object.assign(user, body);
      console.log("Se asignaron los valores al usuario: ", user)
      user.password = hashSync(user.password, 10);
      console.log("Se hasheó la contraseña: ", user)
      await this.userRepository.save(user);
      console.log("Se guardó el usuario: ", user)
      return { status: "User registered with success." };
    } catch (e) {
      console.error("Error saving user:", e);
      throw new HttpException("Failed to register user. Please try again later.", 500);
    }
  }

  async login(body: LoginDTO) {
    const user = await this.findByEmail(body.email);
    if (user == null) {
      throw new UnauthorizedException();
    }
    const compareResult = compareSync(body.password, user.password);
    if (!compareResult) {
      throw new UnauthorizedException();
    }
    return {
      accessToken: this.jwtService.generateToken({ email: user.email }, 'auth'),
      refreshToken: this.jwtService.generateToken(
        { email: user.email },
        'refresh',
      ),
      expirationTime: moment().add(10, 'minutes').toDate(),
    };
  }


  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { email }, relations: ["permissions", "roles"]});
  }

  create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll(): Promise<UserEntity[]> {
    return this.userRepository.find({ relations: ["permissions", "roles"] });
  }

  findOne(id: number): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { id },
      relations: ["permissions", "roles"],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async assignPermission(
    emailUser: string,
    permissionId: number
  ): Promise<HttpException> {
    const permission = await this.permissionRepository.findOneBy({
      id: permissionId,
    });
    if (!permission) {
      throw new HttpException("Permission not found", 404);
    } else {
      const user = await this.userRepository.findOneBy({ email: emailUser });
      if (!user) {
        throw new HttpException("User not found", 404);
      } else {
        if (!user.permissions) {
          user.permissions = [];
        }
        // Add the new permission
        user.permissions = [...user.permissions, permission];
        await this.userRepository.save(user);
        throw new HttpException("Permission assigned", 200);
      }
    }
  }

  async assignRole(email: string, roleId: number): Promise<HttpException> {
    const role = await this.roleRepository.findOneBy({ id: roleId });
    if (!role) {
      throw new HttpException("Role not found", 404);
    } else {
      const user = await this.userRepository.findOneBy({ email: email });
      if (!user) {
        throw new HttpException("User not found", 404);
      } else {
        if (!user.roles) {
          user.roles = [];
        }
        // Add the new role
        user.roles = [...user.roles, role];
        await this.userRepository.save(user);
        throw new HttpException("Role assigned", 200);
      }
    }
  }

  async verifyPermission(
    userId: number,
    permissionCode: string
  ): Promise<HttpException> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["permissions", "roles", "roles.permissions"],
    });
    const permission = await this.permissionRepository.findOneBy({
      name: permissionCode,
    });
    if (!user || !permission) {
      throw new HttpException("User or permission not found", 404);
    } else {
      const userPermissions = user.permissions.map((p: PermissionEntity) => p.name);
      const rolePermissions = user.roles.flatMap(role => role.permissions.map((p: PermissionEntity) => p.name));
      const allPermissions = [...userPermissions, ...rolePermissions];
      if (!allPermissions.includes(permissionCode)) {
        throw new HttpException("Permission not found", 404);
      } else {
        throw new HttpException("Permission found", 200);
      }
    }
  }

  async findAllEmails(): Promise<string[]> {
    const users = await this.userRepository.find();
    return users.map((user: UserEntity) => user.email);
  }

  async isEmailTaken(email: string): Promise<boolean> {
    return (await this.userRepository.find()).map((user: UserEntity) => user.email).includes(email);
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { email }, select: ['firstName', 'lastName'] });
  }
}
