import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/service/user.service';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/models/user.interface';
import { map } from 'rxjs/internal/operators/map';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector:Reflector,
    @Inject(forwardRef(() => UserService))
    private userservice:UserService
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // console.log(request);
    
    const user:User = request.user.user;
    
    return this.userservice.findOne(user.id).pipe(
      map((user:User)=>{
        const hasRole=()=>roles.indexOf(user.role)>-1;
        let hasPermission:boolean=false;

        if(hasRole()){hasPermission=true;}

        return user&&hasPermission;
      })
    )
    
    
  }
}