
import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { from, map, Observable } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class userIsUser implements CanActivate {
  constructor(
    
    @Inject(forwardRef(() => UserService))
    private userservice:UserService
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    
    const params=request.params;

    const user:User=request.user.user;
    
    return this.userservice.findOne(user.id).pipe(
        map((user:User)=>{
            let haspermission=false;

            if(user.id===Number(params.id)){
                haspermission=true;
            }

            return user&& haspermission;
        })
    )
    // return true;
    
   
    
    
    
  }
}