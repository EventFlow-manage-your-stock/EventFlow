import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Tworzymy pole dla naszego rozszerzonego klienta
  public extendedClient;

  constructor(private tenantContextService: TenantContextService) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });

    // Inicjalizacja rozszerzenia Prisma 7
    this.extendedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // Pomijamy tabele globalne (np. samych Tenantów podczas rejestracji)
            if (model === 'Tenant') {
              return query(args);
            }

            // Pobieramy ID tenanta z izolowanego kontekstu żądania HTTP
            const tenantId = tenantContextService.getTenantId();

            if (tenantId) {
              // Rzutujemy na 'any', aby ominąć restrykcje TypeScriptu dla dynamicznych zapytań
              const queryArgs = args as any;

              // Zabezpieczamy odczyty i operacje masowe
              if (['findMany', 'findFirst', 'count', 'updateMany', 'deleteMany'].includes(operation)) {
                queryArgs.where = queryArgs.where || {};
                queryArgs.where.tenantId = tenantId;
              }
              
              // Wstrzykujemy tenantId przy tworzeniu nowych rekordów
              if (operation === 'create') {
                queryArgs.data = queryArgs.data || {};
                queryArgs.data.tenantId = tenantId;
              }
            }

            return query(args);
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('📦 Pomyślnie połączono z bazą danych PostgreSQL (Zaimplementowano izolację Tenantów)!');
  }
}