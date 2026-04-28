import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExamenService } from '../../../core/services/examen';
import { Examen } from '../../../models/index';

@Component({
  selector: 'app-examen-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './examen-list.html'
})
export class ExamenList implements OnInit {
  private svc = inject(ExamenService);
  examens = signal<Examen[]>([]);

  ngOnInit() {
    this.svc.getAll().subscribe(data => this.examens.set(data));
  }

  onDelete(id: number) {
    if (confirm('Supprimer cet examen ?')) {
      this.svc.delete(id).subscribe(() => {
        this.examens.update(list => list.filter(e => e.id !== id));
      });
    }
  }
}
