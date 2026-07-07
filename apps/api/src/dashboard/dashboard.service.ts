import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(id_organizacji: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // 1. KPI: Wydarzenia w tym tygodniu
    const wydarzeniaTygodnia = await this.prisma.extendedClient.wydarzenie.count({
      where: {
        id_organizacji,
        aktywny: true,
        data_start: { gte: startOfWeek, lte: endOfWeek },
      },
    });

    // 2. KPI: Sprzęt dostępny
    const totalSprzet = await this.prisma.extendedClient.egzemplarz.count({
      where: { id_organizacji, aktywny: true },
    });
    const dzialajacySprzet = await this.prisma.extendedClient.egzemplarz.count({
      where: {
        id_organizacji,
        aktywny: true,
        status_serwisowy: { in: ['Działa', 'Naprawiony'] },
      },
    });
    const procentDostepnosci = totalSprzet > 0 ? Math.round((dzialajacySprzet / totalSprzet) * 100) : 0;

    // 3. KPI: Oferty otwarte
    const aktywneOferty = await this.prisma.extendedClient.oferta.count({
      where: { id_organizacji, aktywny: true },
    });

    // 4. KPI: Przychód (suma_netto z zaakceptowanych/aktywnych ofert)
    const ofertyPrzychodu = await this.prisma.extendedClient.oferta.findMany({
      where: { id_organizacji, aktywny: true },
      select: { suma_netto: true },
    });
    const planowanyPrzychod = ofertyPrzychodu.reduce((acc, curr) => acc + Number(curr.suma_netto || 0), 0);

    // 5. WYDARZENIA DZISIAJ
    const dzisiejszeWydarzeniaRaw = await this.prisma.extendedClient.wydarzenie.findMany({
      where: {
        id_organizacji,
        aktywny: true,
        data_start: { lte: today },
        data_koniec: { gte: today },
      },
      include: {
        miejsce: true,
        kontrahent: true,
        status: true,
        manager: true,
      },
    });

    const todaysEvents = dzisiejszeWydarzeniaRaw.map((event) => {
      // Obliczanie postępu wydarzenia w ciągu dnia (w uproszczeniu dla UI)
      const startHour = event.data_start ? event.data_start.getHours() : 8;
      const currentHour = new Date().getHours();
      let progress = ((currentHour - startHour) / 12) * 100;
      if (progress < 0) progress = 0;
      if (progress > 100) progress = 100;

      return {
        id: event.id,
        title: event.nazwa,
        location: event.miejsce ? event.miejsce.nazwa : event.kontrahent?.nazwa || 'Lokalizacja nieznana',
        status: event.status?.nazwa || 'W trakcie',
        time: event.data_start && event.data_koniec 
          ? `${event.data_start.toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})} - ${event.data_koniec.toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})}`
          : 'Cały dzień',
        revenue: event.budzet_netto ? `${Number(event.budzet_netto).toLocaleString('pl-PL')} zł` : 'Brak danych',
        progress,
        manager: event.manager ? `${event.manager.imie.charAt(0)}${event.manager.nazwisko.charAt(0)}` : 'SYS'
      };
    });

    // 6. ALERTY / SMART FLOW
    // NAPRAWA: Zdefiniowanie typu tablicy (likwidacja błędu TS2345 / never[])
    const alerts: Array<{ id: string; type: string; message: string; actionText?: string }> = [];
    
    // Alert budżetowy
    const overBudgetOffers = await this.prisma.extendedClient.oferta.findMany({
      where: { id_organizacji, aktywny: true, budzet_netto: { gt: 0 } },
      select: { id: true, numer: true, nazwa: true, suma_netto: true, budzet_netto: true }
    });
    
    for (const o of overBudgetOffers) {
      if (Number(o.suma_netto) > Number(o.budzet_netto)) {
        const roznica = Number(o.suma_netto) - Number(o.budzet_netto);
        alerts.push({
          id: `oferta-${o.id}`,
          type: 'smart-flow',
          message: `Oferta ${o.numer || o.nazwa} przekracza budżet o ${roznica.toLocaleString('pl-PL')} zł. Możesz obniżyć ceny proporcjonalnie lub tylko w wybranych sekcjach.`,
          actionText: 'Dopasuj do budżetu'
        });
      }
    }

    // Alerty serwisowe
    const serwisy = await this.prisma.extendedClient.serwisSprzetu.findMany({
      where: { id_organizacji, aktywny: true, data_rozwiazania: null },
      include: { egzemplarz: true },
      take: 5
    });

    for (const s of serwisy) {
      alerts.push({
        id: `serwis-${s.id}`,
        type: 'warning',
        message: `${s.egzemplarz?.nazwa || 'Nieznany sprzęt'} (${s.egzemplarz?.numer_urzadzenia || s.egzemplarz?.sn || '-'}) zgłoszony do serwisu: ${s.tytul}`
      });
    }

    return {
      kpis: {
        eventsThisWeek: wydarzeniaTygodnia,
        availableEquipmentPercent: procentDostepnosci,
        openOffers: aktywneOferty,
        plannedRevenue: planowanyPrzychod >= 1000 ? `${(planowanyPrzychod / 1000).toFixed(1)}k` : planowanyPrzychod
      },
      todaysEvents,
      alerts
    };
  }
}