import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controller/user.controller';
import { UserEntity } from './models/user.entity';
import { UserService } from './service/user.service';
import { AuthModule } from 'src/auth/auth.module';
import { BlogEntryEntity } from 'src/blog/model/blog-entry.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([UserEntity]),
    AuthModule,
   
    
  ],
  providers: [UserService],
  controllers:[UserController],
  exports:[UserService]
})
export class UserModule {}
