import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { HttpModule } from '@nestjs/axios';
import { JTWController } from './jwt.controller';

@Module({
  imports: [HttpModule],
  providers: [JwtService],
  controllers:[JTWController],
  exports: [JwtService],
})
export class JwtModule {}
