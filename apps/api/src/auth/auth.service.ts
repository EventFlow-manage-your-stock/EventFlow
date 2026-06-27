import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, passwordRaw: string, companyName: string) {
    // 1. Sprawdź, czy użytkownik o takim emailu już istnieje
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Użytkownik o tym adresie email już istnieje.');
    }

    // 2. Haszowanie hasła przy użyciu bezpiecznego współczynnika (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordRaw, salt);

    // 3. Transakcja DB: Tworzymy firmę i użytkownika jako jedną operację
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          companyName,
          subscriptionStatus: 'ACTIVE',
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          password: passwordHash,
          role: 'ADMIN',
          tenantId: tenant.id, // Ścisłe powiązanie z tenantem
        },
      });

      // Zwracamy bezpieczne dane (bez hasła)
      return {
        userId: user.id,
        email: user.email,
        tenantId: tenant.id,
        companyName: tenant.companyName,
      };
    });
  }

  async login(email: string, passwordRaw: string) {
    // 1. Wyszukaj użytkownika w bazie danych
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło.');
    }

    // 2. Porównaj surowe hasło z hashem z bazy danych
    const isPasswordValid = await bcrypt.compare(passwordRaw, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło.');
    }

    // 3. Przygotuj ładunek (Payload) dla JWT - to te dane będą zaszyfrowane w tokenie
    const payload = { 
      sub: user.id, 
      email: user.email, 
      tenantId: user.tenantId, 
      role: user.role 
    };

    // 4. Wygeneruj i zwróć token sklejony z podstawowymi informacjami
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      }
    };
  }
}