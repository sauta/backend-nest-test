import { Controller, Get, Query, Res } from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { Response } from 'express';

@Controller('operaciones') // localhost:3000/operaciones
export class OperacionesController {
  constructor(private readonly operService: OperacionesService) {}

  @Get() // localhost:3000/operaciones?operacion=suma&a=10&b=40
  operar(
    @Res() res: Response,
    @Query('operacion') operacion: string,
    @Query('a') a: number,
    @Query('b') b: number,
  ) {
    const calculo = this.operService.operar(operacion, +a, +b);

    if (calculo) {
      return res
        .status(200)
        .json({ resultado: calculo, mensaje: 'operacion exitosa' });
    }

    return res
      .status(502)
      .json({ resultado: NaN, mensaje: 'operacion no pudo ser calculada' });
  }
}
