import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RequestWithUser } from 'src/interfaces/request-user';
import { Request } from 'express';
import { UserEntity } from 'src/entities/user.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { LoginDTO } from '../interfaces/login.dto';
import { RegisterDTO } from '../interfaces/register.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() request: Request & {user: UserEntity}){
    return {
      firstName: request.user.firstName
    };
  }
  
  @Post('login')
  login(@Body() body: LoginDTO) {
    return this.userService.login(body);
  }

  @Post('register')
  register(@Body() body: RegisterDTO) {
    return this.userService.register(body);
  }

  @UseGuards(AuthGuard)
  @Get('can-do/:permission')
  canDo(
    @Req() request: RequestWithUser, // le mandamos la request y el usuario gracias a la interfaz
    @Param('permission') permissionCode: string,
  ) {
    return this.userService.canDo(request.user, permissionCode);
  }

  @Get('refresh-token')
  refreshToken(@Req() request: Request) {
    return this.userService.refreshToken(
      request.headers['refresh-token'] as string,
    );
  }
  
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.create(createUserDto);
  }
  
  @Get()
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Get('emails')
  findAllEmails(): Promise<string[]> {
    return this.userService.findAllEmails();
  }

  @Get(':email')
  findUserByEmail(@Param('email') email: string): Promise<UserEntity> {
    return this.userService.findUserByEmail(email);
  }

  @Get('email/:email')
  isEmailTaken(@Param('email') email: string): Promise<boolean> {
    return this.userService.isEmailTaken(email);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<UserEntity> {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.userService.remove(id);
  }
  
  @Post(':email/permissions/:permissionId')
  assignPermission(@Param('email') emailUser: string, @Param('permissionId') permissionId: number): Promise<HttpException> {
    console.log(emailUser, permissionId)
    return this.userService.assignPermission(emailUser, permissionId);
  }
  
  @Post(':email/roles/:roleId')
  assignRole(@Param('email') emailUser: string, @Param('roleId') roleId: number ): Promise<HttpException> {
    return this.userService.assignRole(emailUser, roleId);
  }
}
