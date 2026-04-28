import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decisionLabel',
})
export class DecisionLabelPipe implements PipeTransform {
  transform(value: unknown): string {
    const map: Record<string, string> = {
      'valide': '✅ Validé', 'rattrapage': '🔁 Rattrapage',
      'ajourne': '❌ Ajourné', 'exclu': '🚫 Exclu'
    };
    return map[value as string] ?? String(value);
  }
}
