
import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, map, Observable, switchMap } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogService } from '../service/blog.service';

@Injectable()
export class userIsAuthor implements CanActivate {
  constructor(
    private userservice:UserService,private blogservice:BlogService
  ){}

  canActivate(
    context: ExecutionContext,
  ):  Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    
    const params=request.params;

    const blogentryID:number=Number(params.id);

    const user:User=request.user.user;
    
    return this.userservice.findOne(user.id).pipe(
       switchMap((user:User)=>this.blogservice.findOne(blogentryID).pipe(
        map((blogentry:BlogEntry)=>{
            let haspermission=false;

            if(user.id===Number(blogentry.author.id)){
                haspermission=true;
            }

            return user&& haspermission;
        })
       ))


       
    )
    // return true;
    
   
    
    
    
  }
}