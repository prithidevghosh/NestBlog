import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogService } from '../service/blog.service';

@Controller('blogs')
export class BlogController {
    constructor (private blogservice:BlogService){};

    @UseGuards(JwtAuthGuard)
     @Post()
     create(@Body()blogentry:BlogEntry,@Req()req):Observable<BlogEntry>{
        const user=req.user.user;
        return this.blogservice.create(user,blogentry);
     }

     @Get()
     findBlogEntries(
        @Query('userid')userid:number
     ):Observable<BlogEntry[]>{
        
        if(userid==null){
         return this.blogservice.findAll();
        }else{
          return from(this.blogservice.findByUser(userid));
        }
     }
}
