import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { SlownikiService, DictionaryType } from './slowniki.service';

@Controller('api/slowniki')
@UseGuards(AuthGuard('jwt'))
export class SlownikiController {
  constructor(private readonly slownikiService: SlownikiService) {}

  // =========================================================
  // STATYCZNE TRASY DLA INNYCH MODUŁÓW (Zawsze na górze!)
  // =========================================================

  @Get('kontrahenci')
  async getKontrahenci(@Req() req: Request) {
    return this.slownikiService.getKontrahenci(Number((req.user as any).id_organizacji));
  }

  @Get('miejsca')
  async getMiejsca(@Req() req: Request) {
    return this.slownikiService.getMiejsca(Number((req.user as any).id_organizacji));
  }

  @Get('uzytkownicy')
  async getUzytkownicy(@Req() req: Request) {
    return this.slownikiService.getUzytkownicy(Number((req.user as any).id_organizacji));
  }

  // =========================================================
  // DYNAMICZNE TRASY DLA STATUSÓW I TYPÓW (V9, V11)
  // =========================================================
  
  // Bezpieczny walidator chroniący przed wstrzykiwaniem nazw innych tabel
  private validateType(type: string): DictionaryType {
    // Wsparcie dla starego nazewnictwa "wydarzen" z V11
    const safeType = type === 'statusy-wydarzen' ? 'statusy-wydarzenia' : type;
    const validTypes = ['typy-wydarzen', 'statusy-wydarzenia', 'statusy-magazynowe', 'statusy-ksiegowe'];
    
    if (!validTypes.includes(safeType)) {
      throw new BadRequestException(`Nieobsługiwany typ słownika: ${safeType}`);
    }
    return safeType as DictionaryType;
  }

  @Get(':type')
  findAll(@Param('type') type: string, @Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.slownikiService.findAll(this.validateType(type), id_organizacji);
  }

  @Post(':type')
  create(@Param('type') type: string, @Body() dto: any, @Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.slownikiService.create(this.validateType(type), dto, id_organizacji);
  }

  @Put(':type/kolejnosc')
  reorder(@Param('type') type: string, @Body() body: { items: { id: number, kolejnosc: number }[] }, @Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.slownikiService.reorder(this.validateType(type), body.items, id_organizacji);
  }

  @Get(':type/:id')
  findOne(@Param('type') type: string, @Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.slownikiService.findOne(this.validateType(type), id, id_organizacji);
  }

  @Put(':type/:id')
  update(@Param('type') type: string, @Param('id', ParseIntPipe) id: number, @Body() dto: any, @Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.slownikiService.update(this.validateType(type), id, dto, id_organizacji);
  }

  @Delete(':type/:id')
  removeSoft(@Param('type') type: string, @Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const id_organizacji = Number((req.user as any).id_organizacji);
    return this.slownikiService.removeSoft(this.validateType(type), id, id_organizacji);
  }
}