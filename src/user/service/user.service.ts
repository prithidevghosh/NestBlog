import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs/internal/Observable';
import { Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.interface';
import { from } from 'rxjs/internal/observable/from';
import { AuthService } from 'src/auth/services/auth.service';
import { catchError,map, switchMap, throwError } from 'rxjs';


@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)private readonly userRepository:Repository<UserEntity>,
        private authservice:AuthService
    ){}

    create(user:User):Observable<User>{
       return this.authservice.hashPassword(user.password).pipe(
        switchMap((passwordHash:string)=>{
            
            const newuser=new UserEntity;
            newuser.name=user.name;
            newuser.username=user.username;
            newuser.email=user.email;
            newuser.password=passwordHash;
            
            return from(this.userRepository.save(newuser)).pipe(
                map((user:User)=>{
                    const {password,...result}=user;
                    return result;
                }),
                catchError(err=>throwError(err))
            );
        })
       )
    }

    findOne(id:number):Observable<User>{
        return from(this.userRepository.findOneBy({id})).pipe(
            map((user:User)=>{
                const {password,...result}=user;
                return result;
            })
        );
    }

    findAll(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users: User[]) => {
                users.forEach(function (v) {delete v.password});
                return users;
            })
        );
    }

    deleteOne(id:number):Observable<any>{
        
        return from(this.userRepository.delete(id));
    }

    updateOne(id:number,user:User):Observable<any>{
        delete user.email;
        delete user.password;
        return from(this.userRepository.update(id,user));
    }

    login(user:User):Observable<String>{
        return this.validateUser(user.email,user.password).pipe(
           switchMap((user:User)=>{
            if(user){
            return this.authservice.generateJwt(user).pipe(map((jwt:string)=>jwt));
            }
            else{
                return 'wrong credentials'
            }
           })
        )
    }

    validateUser(email:string,password:string):Observable<User>{
        return this.findByMail(email).pipe(
            switchMap((user:User)=>this.authservice.comparePassword(password,user.password).pipe(
                map((match:boolean)=>{
                      if(match){
                        const {password,...result}=user;
                        return result;
                      }else{
                        throw Error;
                      }
                })
            ))
        )
    }

    findByMail(email:string):Observable<User>{
        return from(this.userRepository.findOneBy({email}));
    }
}
