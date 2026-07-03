import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; 
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, passwordRaw: string) {
    console.log(`\n--- PRÓBA LOGOWANIA ---`);
    console.log(`Email z frontendu: '${email}'`);
    // 1. Szukamy użytkownika po emailu i pobieramy powiązaną organizację
    const uzytkownik = await this.prisma.uzytkownik.findFirst({
      where: { email },
      include: { 
        organizacja: true,
        role: {
          include: { rola: true }
        }
      },
    });

    if (!uzytkownik) {
      console.log('❌ BŁĄD: Nie znaleziono użytkownika z takim mailem w bazie!');
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }
    console.log(`Znaleziono użytkownika: ID ${uzytkownik.id}`);
    
    const isPasswordValid = await bcrypt.compare(passwordRaw, uzytkownik.haslo);

    if (!isPasswordValid) {
      console.log('❌ BŁĄD: Podane hasło nie pasuje do hasha bcrypt!');
      // Wypiszmy hash, żeby sprawdzić czy nie ma na końcu np. spacji z kopiowania
      console.log(`Hash w bazie: '${uzytkownik.haslo}'`);
      throw new UnauthorizedException('Nieprawidłowe dane logowania');
    }

    // 3. Sprawdzenie, czy konto i organizacja są aktywne
    if (!uzytkownik.aktywny || !uzytkownik.organizacja.aktywny) {
      console.log('❌ BŁĄD: Konto użytkownika lub organizacja są oznaczone jako nieaktywne!');
      throw new UnauthorizedException('Konto lub organizacja są nieaktywne');
    }

    console.log('✅ Logowanie udane, generuję token...');

    // 4. Budowa payloadu dla tokena JWT
    const payload = { 
      sub: uzytkownik.id, 
      email: uzytkownik.email,
      orgId: uzytkownik.id_organizacji,
      // Wyciągamy najwyższą rolę użytkownika (lub ustawiamy domyślną)
      role: uzytkownik.role[0]?.rola.nazwa || 'Użytkownik'
    };

    // 5. Zwracamy obiekt w formacie, którego oczekuje nasz kod we frontendzie
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: uzytkownik.id,
        email: uzytkownik.email,
        imie: uzytkownik.imie,
        nazwisko: uzytkownik.nazwisko,
        organizacja: uzytkownik.organizacja.nazwa,
        role: payload.role
      }
    };
  }
}