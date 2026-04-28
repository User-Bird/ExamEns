import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mention',
})
export class MentionPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
