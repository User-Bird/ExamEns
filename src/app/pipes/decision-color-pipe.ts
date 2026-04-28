import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decisionColor',
})
export class DecisionColorPipe implements PipeTransform {
  transform(value: unknown): string {
    const map: Record<string, string> = {
      'valide': '#16a34a', 'rattrapage': '#d97706',
      'ajourne': '#dc2626', 'exclu': '#6b7280'
    };
    return map[value as string] ?? '#000';
  }
}
