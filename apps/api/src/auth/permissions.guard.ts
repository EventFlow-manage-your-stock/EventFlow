import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from './permissions.enum';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { ROLE_PERMISSIONS } from './permissions-map';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Wyciągamy wymagane uprawnienia z dekoratora na endpoincie
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jeśli endpoint nie ma dekoratora, jest dostępny dla każdego zalogowanego
    if (!requiredPermissions) {
      return true;
    }

    // 2. Pobieramy użytkownika wstrzykniętego przez JwtAuthGuard
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
      throw new ForbiddenException('Brak wymaganych uprawnień.');
    }

    // 3. Pobieramy listę uprawnień przypisanych do roli użytkownika
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];

    // 4. Sprawdzamy, czy użytkownik ma WSZYSTKIE wymagane uprawnienia dla tego endpointu
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Twoja rola nie posiada wystarczających uprawnień do wykonania tej akcji.');
    }

    return true;
  }
}