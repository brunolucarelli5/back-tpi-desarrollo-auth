import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "./users/users.module";
import { JwtModule } from "./jwt/jwt.module";
import { AuthGuard } from "./middlewares/auth.middleware";
import { PermissionEntity } from "./entities/permission.entity"; // Import PermissionEntity
import { UserEntity } from "./entities/user.entity";
import { RoleEntity } from "./entities/role.entity";
import { RolesModule } from "./roles/roles.module";
import { PermissionsModule } from "./permissions/permissions.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({ // modulo de base de datos
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'bruno',
      password: 'elnombredelviento',
      database: 'users',
      synchronize: true,
      entities: [PermissionEntity, UserEntity, RoleEntity],
      }),
    TypeOrmModule.forFeature([UserEntity]),
    // modulos de dominio
    UsersModule,
    JwtModule,
    RolesModule,
    PermissionsModule
  ],
  controllers: [AppController],
  providers: [AuthGuard]
})
export class AppModule {}
