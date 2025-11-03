import { Controller, Get, Param } from '@nestjs/common';
import { EdtService } from './edt.service.js';

@Controller('edt')
export class EdtController {
  constructor(private readonly edtService: EdtService) {}

  @Get(':annee/:group')
  findAll(@Param('annee') annee: number, @Param('group') group: string): void {
    const desk: string = `./pdf/A${annee}_S9.pdf`;
    this.edtService.GetEdt(annee, desk);
  }

  @Get()
  help(): string {
    return this.edtService.BonneUrl();
  }
}
