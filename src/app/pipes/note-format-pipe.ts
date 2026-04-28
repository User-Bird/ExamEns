import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noteFormat',
})
export class NoteFormatPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
