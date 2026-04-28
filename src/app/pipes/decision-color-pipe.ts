import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decisionColor',
})
export class DecisionColorPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
