import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decisionLabel',
})
export class DecisionLabelPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
