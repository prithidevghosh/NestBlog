import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs/internal/Observable';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User } from '../models/user.interface';
import { from } from 'rxjs/internal/observable/from';
import { AuthService } from 'src/auth/services/auth.service';
import { catchError,map, switchMap, throwError } from 'rxjs';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Pagination } from 'nestjs-typeorm-paginate/dist/pagination';


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
            newuser.role=user.role;
            
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

    paginate(options: IPaginationOptions): Observable<Pagination<User>>{
          return from(paginate<User>(this.userRepository,options)).pipe(
            map((userspageable:Pagination<User>)=>{
                userspageable.items.forEach(function (v) {delete v.password});
                return userspageable;
            })
          )
      }

    paginateFilterbyUsername(options:IPaginationOptions,user:User):Observable<Pagination<User>>{
        return from(this.userRepository.findAndCount({
            skip:0,
            take:Number(options.limit)||10,
            order:{
                id:"ASC"
            },
            select:["id","email","name","username","role"],
            where:[
                {username:Like(`${user.username}`)}
            ]
        })).pipe(
            map(([user,totaluser])=>{
                console.log(user);
                const userspageable:Pagination<User>={
                 
                    
                    items:user,

                    links:{
                      first:options.route+`?limit=${options.limit}`,
                      previous:options.route+``,
                      next:options.route+`?limit=${options.limit}&page=${Number(options.page)+1}`,
                      last:options.route+`?limit=${options.limit}&page=${Math.ceil(totaluser/Number(options.limit))}`

                    },

                   meta:{
                    currentPage:Number(options.page),
                    totalItems: totaluser,
                    itemCount: user.length,
                    itemsPerPage: Number(options.limit),
                    totalPages: Math.ceil(totaluser/Number(options.limit)),
                    
                   }
                }

               

                return userspageable;
            })
        )
    }

    deleteOne(id:number):Observable<any>{
        
        return from(this.userRepository.delete(id));
    }

    updateOne(id:number,user:User):Observable<any>{
        delete user.email;
        delete user.password;
        return from(this.userRepository.update(id,user)).pipe(
            switchMap(()=>(this.findOne(id)))
        );
    }

    updateRoleofUser(id:number,user:User):Observable<any>{
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
