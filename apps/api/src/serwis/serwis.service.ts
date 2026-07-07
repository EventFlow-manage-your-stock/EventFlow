import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SerwisService {
  constructor(private readonly prisma: PrismaService) {}

  async getWszystkieZgloszenia(id_organizacji: number) {
    return this.prisma.extendedClient.serwisSprzetu.findMany({
      where: { id_organizacji, aktywny: true },
      include: {
        egzemplarz: {
          include: { model: true }
        },
        zglosil: {
          select: { imie: true, nazwisko: true }
        },
        rozwiazal: {
          select: { imie: true, nazwisko: true }
        },
        status: true
      },
      orderBy: { data_zgloszenia: 'desc' }
    });
  }

  async getZgloszenieById(id: number, id_organizacji: number) {
    const zgloszenie = await this.prisma.extendedClient.serwisSprzetu.findFirst({
      where: { id, id_organizacji, aktywny: true },
      include: {
        egzemplarz: {
          include: { model: true }
        },
        zglosil: {
          select: { id: true, imie: true, nazwisko: true }
        },
        rozwiazal: {
          select: { id: true, imie: true, nazwisko: true }
        },
        status: true
      }
    });

    if (!zgloszenie) throw new NotFoundException('Nie znaleziono zgłoszenia');
    return zgloszenie;
  }

  async getStatusy(id_organizacji: number) {
    return this.prisma.extendedClient.statusSerwisu.findMany({
      where: { id_organizacji, aktywny: true },
      orderBy: { kolejnosc: 'asc' }
    });
  }

  async updateZgloszenie(id: number, dto: any, id_organizacji: number, id_uzytkownika: number) {
    const cleanNumber = (val: any) => (val === "" || val === undefined || val === null || isNaN(Number(val))) ? null : Number(val);
    const cleanString = (val: any) => (val === null || val === undefined || String(val).trim() === '') ? null : String(val).trim();

    return this.prisma.extendedClient.$transaction(async (tx) => {
      const existing = await tx.serwisSprzetu.findFirst({
        where: { id, id_organizacji }
      });

      if (!existing) throw new NotFoundException('Zgłoszenie nie istnieje');

      // Jeśli status sugeruje rozwiązanie, a nie ma daty, ustawiamy obecną
      let dataRozwiazania = existing.data_rozwiazania;
      let rozwiazal = existing.id_uzytkownika_rozwiazal;

      // Zakładamy, że frontend wyśle np. status "Naprawiony"
      if (dto.czy_rozwiazane && !dataRozwiazania) {
        dataRozwiazania = new Date();
        rozwiazal = id_uzytkownika;
      } else if (!dto.czy_rozwiazane) {
        dataRozwiazania = null;
        rozwiazal = null;
      }

      const updated = await tx.serwisSprzetu.update({
        where: { id },
        data: {
          tytul: cleanString(dto.tytul) || existing.tytul,
          opis: cleanString(dto.opis),
          rozwiazanie: cleanString(dto.rozwiazanie),
          id_statusu_serwisu: cleanNumber(dto.id_statusu_serwisu) || existing.id_statusu_serwisu,
          data_rozwiazania: dataRozwiazania,
          id_uzytkownika_rozwiazal: rozwiazal
        }
      });

      // Zapisujemy zmianę w logach
      await tx.logZmian.create({
        data: {
          id_organizacji,
          id_uzytkownika,
          typ_obiektu: 'SerwisSprzetu',
          id_obiektu: id,
          akcja: 'EDYCJA_ZGLOSZENIA',
          nowa_wartosc: JSON.stringify({ status: updated.id_statusu_serwisu, rozwiazanie: updated.rozwiazanie })
        }
      });

      return updated;
    });
  }

  async getZgloszeniaDlaModelu(id_modelu: number, id_organizacji: number) {
    return this.prisma.extendedClient.serwisSprzetu.findMany({
      where: {
        id_organizacji,
        aktywny: true,
        egzemplarz: { id_modelu }
      },
      include: {
        egzemplarz: true,
        status: true,
        zglosil: { select: { imie: true, nazwisko: true } },
        rozwiazal: { select: { imie: true, nazwisko: true } }
      },
      orderBy: { data_zgloszenia: 'desc' }
    });
  }
}