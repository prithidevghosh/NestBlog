import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { User } from 'src/user/models/user.interface';
import { UserService } from 'src/user/service/user.service';
import { Repository } from 'typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { BlogEntry } from '../model/blog-entry.interface';
const slugify = require('slugify');
@Injectable()
export class BlogService {

    constructor(
        @InjectRepository(BlogEntryEntity) private readonly blogRepository: Repository<BlogEntryEntity>,
        private userservice: UserService
    ) {}

    create(user: User, blogentry: BlogEntry): Observable<BlogEntry> {
        blogentry.author = user;
        return this.generateSlug(blogentry.title).pipe(
            switchMap((slug: string) => {
                blogentry.slug = slug;
                return from(this.blogRepository.save(blogentry));
            })
        )
    }

    generateSlug(title: string): Observable<string> {
        return of(slugify(title));
    }

    findAll(): Observable<BlogEntry[]> {
        return from(this.blogRepository.find({ relations: ['author'] }))
    }

    findByUser(userId: number): Observable<BlogEntry[]> {
        return this.userservice.findOne(userId).pipe(
            switchMap(user => {
                return from(this.blogRepository.find({
                    where: {
                        author: user
                    },
                    relations: ['author']
                }));
            }),
            map((blogEntries: BlogEntry[]) => blogEntries)
        );
    }

    findOne(id: number): Observable<BlogEntry> {
        return from(this.blogRepository.findOne({ where: { id }, relations: ['author'] }));
    }

    updateOne(id: number, blogentry: BlogEntry): Observable<BlogEntry> {
        return from(this.blogRepository.update(id, blogentry)).pipe(
            switchMap(() => this.findOne(id))
        )
    }


    deleteOne(id: number): Observable<any> {
        return from(this.blogRepository.delete(id));
    }

    paginateAll(options: IPaginationOptions): Observable<Pagination<BlogEntry>> {
        return from(paginate<BlogEntryEntity>(
            this.blogRepository, // pass the repository instance here
            options,
            { relations: ['author'] }
        )).pipe(
            map((blogentries: Pagination<BlogEntry>) => blogentries)
        );
    }

    paginateAllByUser(options: IPaginationOptions, userID: number): Observable<Pagination<BlogEntry>> {
        return this.userservice.findOne(userID).pipe(
          switchMap(user => {
            return from(paginate<BlogEntryEntity>(
              this.blogRepository, // pass the repository instance here
              options,
              {
                relations: ['author'],
                where: [
                  { author: user }
                ]
              }
            )).pipe(
              map((blogentries: Pagination<BlogEntry>) => blogentries)
            );
          })
        );
      }
      


}

