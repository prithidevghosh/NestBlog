import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { userIsAuthor } from '../guard/user-is-author.guard';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogService } from '../service/blog.service';

@Controller('blogs')
export class BlogController {
    constructor (private blogservice:BlogService){};

    @UseGuards(JwtAuthGuard)
     @Post()
     create(@Body()blogentry:BlogEntry,@Request()req):Observable<BlogEntry>{
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
     
     @Get(':id')
     findOne(@Param('id')id:number):Observable<BlogEntry>{
        return from(this.blogservice.findOne(id));
     }

     @UseGuards(JwtAuthGuard,userIsAuthor)
     @Put(':id')
     updateOne(@Param('id')id:number,@Body()blogentry:BlogEntry):Observable<BlogEntry>{
        return from(this.blogservice.updateOne(id,blogentry));
     }
     @UseGuards(JwtAuthGuard,userIsAuthor)
     @Delete(':id')
     deleteOne(@Param('id')id:number):Observable<any>{
        return from(this.blogservice.deleteOne(id));
     }
}
