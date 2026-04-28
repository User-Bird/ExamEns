import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mention',
})
export class MentionPipe implements PipeTransform {
  transform(value: unknown): string {
    const map: Record<string, string> = {
      'passable': 'Passable', 'assez-bien': 'Assez Bien',
      'bien': 'Bien', 'tres-bien': 'Très Bien', 'aucune': '—'
    };
    return map[value as string] ?? '—';
  }
}
