import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type DictionaryType = 'typy-wydarzen' | 'statusy-wydarzenia' | 'statusy-magazynowe' | 'statusy-ksiegowe';

@Injectable()
export class SlownikiService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================
  // ISTNIEJĄCE ZAPYTANIA DLA INNYCH MODUŁÓW
  // =========================================================

  async getKontrahenci(id_organizacji: number) {
    return this.prisma.extendedClient.kontrahent.findMany({
      where: { id_organizacji, aktywny: true },
      select: { id: true, nazwa: true },
      orderBy: { nazwa: 'asc' },
    });
  }

  async getMiejsca(id_organizacji: number) {
    return this.prisma.extendedClient.miejsce.findMany({
      where: { id_organizacji, aktywny: true },
      select: { id: true, nazwa: true },
      orderBy: { nazwa: 'asc' },
    });
  }

  async getUzytkownicy(id_organizacji: number) {
    return this.prisma.extendedClient.uzytkownik.findMany({
      where: { id_organizacji, aktywny: true },
      select: { id: true, imie: true, nazwisko: true, email: true },
      orderBy: { nazwisko: 'asc' },
    });
  }

  // =========================================================
  // NOWY GENERYCZNY CRUD DLA STATUSÓW OPERACYJNYCH I TYPÓW
  // =========================================================

  private getModel(type: DictionaryType) {
    switch (type) {
      case 'typy-wydarzen': return this.prisma.extendedClient.typWydarzenia;
      case 'statusy-wydarzenia': return this.prisma.extendedClient.statusWydarzenia;
      case 'statusy-magazynowe': return this.prisma.extendedClient.statusMagazynowy;
      case 'statusy-ksiegowe': return this.prisma.extendedClient.statusKsiegowy;
      default: throw new BadRequestException(`Nieprawidłowy typ słownika: ${type}`);
    }
  }

  async findAll(type: DictionaryType, id_organizacji: number) {
    const model = this.getModel(type);
    return (model as any).findMany({
      where: { id_organizacji, aktywny: true },
      orderBy: { kolejnosc: 'asc' },
    });
  }

  async findOne(type: DictionaryType, id: number, id_organizacji: number) {
    const model = this.getModel(type);
    const item = await (model as any).findFirst({
      where: { id, id_organizacji, aktywny: true },
    });
    if (!item) throw new NotFoundException('Nie znaleziono rekordu');
    return item;
  }

  async create(type: DictionaryType, dto: any, id_organizacji: number) {
    const model = this.getModel(type);
    
    // Ustawiamy nowy element na samym dole listy (najwyższa kolejność)
    const lastItem = await (model as any).findFirst({
      where: { id_organizacji, aktywny: true },
      orderBy: { kolejnosc: 'desc' }
    });
    const nowaKolejnosc = lastItem ? lastItem.kolejnosc + 1 : 1;

    // Podstawowy obiekt danych dla każdego rodzaju słownika
    const data: any = {
      id_organizacji,
      nazwa: dto.nazwa,
      kolor: dto.kolor || '#94a3b8',
      kolejnosc: nowaKolejnosc,
    };

    // Warunkowo dodajemy pole ikony - tylko jeśli to nie jest typ wydarzenia
    if (type !== 'typy-wydarzen') {
      data.ikona = dto.ikona || 'circle';
    }

    return (model as any).create({ data });
  }

  async update(type: DictionaryType, id: number, dto: any, id_organizacji: number) {
    const model = this.getModel(type);
    
    const data: any = {
      nazwa: dto.nazwa,
      kolor: dto.kolor,
    };

    if (type !== 'typy-wydarzen') {
      data.ikona = dto.ikona;
    }

    return (model as any).update({
      where: { id, id_organizacji },
      data,
    });
  }

  async removeSoft(type: DictionaryType, id: number, id_organizacji: number) {
    const model = this.getModel(type);
    return (model as any).update({
      where: { id, id_organizacji },
      data: { 
        aktywny: false,
        data_usuniecia: new Date()
      },
    });
  }

  async reorder(type: DictionaryType, updates: { id: number, kolejnosc: number }[], id_organizacji: number) {
    const model = this.getModel(type);
    return this.prisma.extendedClient.$transaction(async (tx) => {
      for (const update of updates) {
        await (tx as any)[model.name].update({
          where: { id: update.id, id_organizacji },
          data: { kolejnosc: update.kolejnosc }
        });
      }
      return { success: true };
    });
  }
}