import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // <--- DODAJ IMPORT
import type { Request } from 'express';
import { WydarzeniaService } from './wydarzenia.service';
import { CreateWydarzenieDto } from './dto/create-wydarzenie.dto';

@Controller('events')
@UseGuards(AuthGuard('jwt')) // <--- ZABEZPIECZAMY CAŁY KONTROLER
export class WydarzeniaController {
  constructor(private readonly wydarzeniaService: WydarzeniaService) {}

  @Get()
  findAll() {
    return this.wydarzeniaService.findAll();
  }

  @Post()
  create(@Req() req: Request, @Body() createWydarzenieDto: CreateWydarzenieDto) {
    // Teraz mamy absolutną pewność, że req.user istnieje!
    const id_organizacji = (req.user as any).id_organizacji;
    
    return this.wydarzeniaService.create(createWydarzenieDto, id_organizacji);
  }
}