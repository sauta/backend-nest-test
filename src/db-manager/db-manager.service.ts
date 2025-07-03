import { Injectable } from '@nestjs/common';

@Injectable()
export class DbManagerService {
  getUser(id: number) {
    return { id, nombre: 'Josefa' };
  }
}
