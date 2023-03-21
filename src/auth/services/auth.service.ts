import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, of } from 'rxjs';
import { from } from 'rxjs';
import { User } from 'src/user/models/user.interface';
const bcrypt = require('bcrypt');
@Injectable()
export class AuthService {

    constructor (private readonly jwtservice:JwtService){}

    generateJwt(user:User):Observable<string>{
          return from(this.jwtservice.signAsync(user));
    }

    hashPassword(password:string):Observable<string>{
          return from<string>(bcrypt.hash(password,12));
    }

    comparePassword(password:string , hashPassword:string):Observable<any|boolean>{
        return  from<any|boolean>(bcrypt.compare(password,hashPassword));
    }
  
}
