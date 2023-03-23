import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { BlogEntry } from '../model/blog-entry.interface';
const slugify=require('slugify');
@Injectable()
export class BlogService {

 constructor(
    @InjectRepository(BlogEntryEntity) private readonly blogRepository:Repository<BlogEntryEntity>,
    private userservice:UserService 
 ){}

 create(user:User,blogentry:BlogEntry):Observable<BlogEntry>{
     blogentry.author=user;
     return this.generateSlug(blogentry.title).pipe(
        switchMap((slug:string)=>{
            blogentry.slug=slug;
            return from(this.blogRepository.save(blogentry));
        })
     )
 }

 generateSlug(title:string):Observable<string>{
    return of(slugify(title));
 }

 findAll():Observable<BlogEntry[]>{
     return from(this.blogRepository.find({relations:['author']}))
 }

 findByUser(userId: number): Observable<BlogEntry[]> {
    return from(this.blogRepository.find({
        where:{
            author:userId
        },
         
        relations: ['author']
    })).pipe(map((blogEntries: BlogEntry[]) => blogEntries))
}

}