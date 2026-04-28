import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noteFormat',
})
export class NoteFormatPipe implements PipeTransform {
  transform(value: unknown): string {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(2) + '/20';
}
}
