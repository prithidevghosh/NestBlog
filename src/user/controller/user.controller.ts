import { Body, Controller, Get, Param, Post, Put,Delete, UseGuards, Query, DefaultValuePipe, ParseIntPipe, UploadedFile, UseInterceptors,Request, Req,Res } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { catchError,map,of, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '../models/user.entity';
import { User } from '../models/user.interface';
import { UserService } from '../service/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { userIsUser } from 'src/auth/guards/userIsUser.guard';

export const storage={
   storage: diskStorage({
      destination: './uploads/profileimages', 
      filename: (req, file, cb) => {
        const uniqueSuffix: string =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      // const fileName : string = path.parse(file.originalname).normalize.replace(/\s/g, '') + id
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      cb(null, filename);
    }
    })
}

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
   index(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
      @Query('username')username:string
    ): Observable<Pagination<User>> {
      limit = limit > 100 ? 100 : limit;

      if(username === null || username===undefined){
         return this.userservice.paginate({
            page,
            limit,
            route: ' http://localhost:3000/users/',
          });
      }

      return this.userservice.paginateFilterbyUsername({
         page,
         limit,
         route: ' http://localhost:3000/users/',
       },{username});

    
    }
   @Delete(':id')
   deleteOne(@Param('id')id:string):Observable<any>{
         return this.userservice.deleteOne(Number(id));
   }
    
   @UseGuards(JwtAuthGuard,userIsUser)
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

   @UseGuards(JwtAuthGuard)
   @Post('upload')
   @UseInterceptors(FileInterceptor('file',storage)
 )
   uploadFile(@UploadedFile()file: Express.Multer.File,@Request()req):Observable<Object>{
      const user:User=req.user.user;
      
      return this.userservice.updateOne(user.id,{profileImage:file.filename}).pipe(
         tap((user:User)=>console.log(user)
         ),
         map((user:User)=>({profileImage:user.profileImage}))
      )
      
     
   }

   @Get('profileimage/:imagename')
   findProfileImage(@Param('imagename')imagename,@Res()res):Observable<Object>{
         return of(res.sendFile(join(process.cwd(),'uploads/profileimages/'+imagename)))
   }
}