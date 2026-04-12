import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Bloqueia usuários de manejo de acessarem rotas que não sejam lotes */
export const manejoGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isManejo()) {
    return router.createUrlTree(['/lotes/cadastrar']);
  }
  return true;
};
