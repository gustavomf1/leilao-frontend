import { Pipe, PipeTransform } from '@angular/core';

export function formatarCodigoLote(valor: string | null | undefined): string {
  if (!valor) return '—';
  return `LOTE-${valor}`;
}

@Pipe({ name: 'loteCodigo', standalone: true })
export class LoteCodigoPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatarCodigoLote(valor);
  }
}
