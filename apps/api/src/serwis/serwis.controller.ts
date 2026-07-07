import { Controller, Get, Put, Body, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { SerwisService } from './serwis.service';

@Controller('api/serwis')
@UseGuards(AuthGuard('jwt'))
export class SerwisController {
  constructor(private readonly serwisService: SerwisService) {}

  @Get()
  async getZgloszenia(@Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.serwisService.getWszystkieZgloszenia(id_organizacji);
  }

  @Get('statusy')
  async getStatusy(@Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.serwisService.getStatusy(id_organizacji);
  }

  @Get(':id')
  async getZgloszenieById(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.serwisService.getZgloszenieById(id, id_organizacji);
  }

  @Put(':id')
  async updateZgloszenie(@Param('id', ParseIntPipe) id: number, @Body() dto: any, @Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    const rawUserId = (req.user as any).id || (req.user as any).sub;
    const id_uzytkownika = rawUserId ? Number(rawUserId) : 0;
    
    return this.serwisService.updateZgloszenie(id, dto, id_organizacji, id_uzytkownika);
  }

  @Get('model/:modelId')
  async getZgloszeniaDlaModelu(@Param('modelId', ParseIntPipe) modelId: number, @Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.serwisService.getZgloszeniaDlaModelu(modelId, id_organizacji);
  }
}