import { Body, Controller, Get, Param, Post, Put,Delete, UseGuards } from '@nestjs/common';
import { catchError,map,of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '../models/user.entity';
import { User } from '../models/user.interface';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {

   constructor (private userservice:UserService){};

   @Post()
   create(@Body()user:User):Observable<User|Object>{
      return this.userservice.create(user).pipe(
         map((user:User)=>user),
         catchError(err=>of({Error:err.message}))
      );
   }

   @Post('login')
   login(@Body()user:User):Observable<Object>{
         return this.userservice.login(user).pipe(
            map((jwt:string)=>{
                return {access_token:jwt};
            })
         )
   }

   @Get(':id')
   findOne(@Param()params):Observable<User>{
       return this.userservice.findOne(params.id);
   }

   @hasRoles(UserRole.ADMIN)
   @UseGuards(JwtAuthGuard,RolesGuard)
   @Get()
   findAll():Observable<User[]>{
        return this.userservice.findAll();
   }

   @Delete(':id')
   deleteOne(@Param('id')id:string):Observable<any>{
         return this.userservice.deleteOne(Number(id));
   }

   @Put(':id')
   updateOne(@Param('id')id:string  , @Body()user:User):Observable<any>{
        return this.userservice.updateOne(Number(id),user);
   }
   
   @hasRoles(UserRole.ADMIN)
   @UseGuards(JwtAuthGuard,RolesGuard)
   @Put(':id/role')
   updateRoleofUser(@Param('id')id:string  , @Body()user:User):Observable<User>{
        return this.userservice.updateRoleofUser(Number(id),user);
   }

}