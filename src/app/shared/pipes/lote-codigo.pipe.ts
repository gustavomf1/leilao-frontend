import { Pipe, PipeTransform } from '@angular/core';

export function formatarCodigoLote(valor: string | null | undefined): string {
  if (!valor) return '—';
  return `LOTE-${valor}`;
}

export function compararCodigoLote(a: { codigo?: string | null }, b: { codigo?: string | null }): number {
  return (a.codigo ?? '').localeCompare(b.codigo ?? '', undefined, { numeric: true, sensitivity: 'base' });
}

@Pipe({ name: 'loteCodigo', standalone: true })
export class LoteCodigoPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatarCodigoLote(valor);
  }
}
