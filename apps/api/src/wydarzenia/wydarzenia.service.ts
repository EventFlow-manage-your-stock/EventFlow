import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWydarzenieDto } from './dto/create-wydarzenie.dto';

@Injectable()
export class WydarzeniaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Używamy extendedClient, więc zapytanie automatycznie filtruje po id_organizacji
    const wydarzenia = await this.prisma.extendedClient.wydarzenie.findMany({
      where: {
        data_start: { not: null },
        data_koniec: { not: null },
      },
      include: {
        status: true,
        ekipa: true,
        pojazdy: true,
      },
    });

    // Mapujemy dane z bazy na format, którego oczekuje nasz frontendowy kalendarz
    return wydarzenia.map((w) => {
      const flags: string[] = [];
      
      if (w.ekipa && w.ekipa.length > 0) flags.push('users');
      if (w.pojazdy && w.pojazdy.length > 0) flags.push('vehicle');
      if (w.status?.nazwa === 'Nowe' || w.status?.nazwa === 'W przygotowaniu') flags.push('unconfirmed');
      if (w.status?.nazwa === 'Zaakceptowane' || w.status?.nazwa === 'Zakończone') flags.push('checked');

      return {
        id: w.id.toString(),
        title: w.nazwa,
        startDate: w.data_start,
        endDate: w.data_koniec,
        // Pobieramy kolor ze statusu (w bazie zdefiniowaliśmy HEXy, np. '#3b82f6')
        colorHex: w.status?.kolor || '#3b82f6', 
        flags,
      };
    });
  }

  async create(createWydarzenieDto: CreateWydarzenieDto, id_organizacji: number) {
    return this.prisma.extendedClient.wydarzenie.create({
      data: {
        nazwa: createWydarzenieDto.nazwa,
        data_start: new Date(createWydarzenieDto.data_start),
        data_koniec: new Date(createWydarzenieDto.data_koniec),
        id_statusu_wydarzenia: createWydarzenieDto.id_statusu_wydarzenia,
        
        organizacja: {
          connect: {
            id: id_organizacji
          }
        }
      },
    });
  }
}