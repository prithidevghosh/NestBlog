import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<h1>This a Blogging website made using Nest<h1>, run the apis given in postman file here / in postman app to see features';
  }
}
