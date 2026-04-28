import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { ModuleService } from '../../core/services/module';
import { NoteService } from '../../core/services/note';
import { ExamenService } from '../../core/services/examen';
import { EtudiantService } from '../../core/services/etudiant';
import { NoteFormatPipe } from '../../pipes/note-format-pipe';
import { Module, Note, Examen } from '../../models/index';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ModuleStat {
  module: Module;
  moyenneClasse: number;
  tauxReussite: number;
  nbEtudiants: number;
  notes: number[];
}

@Component({
  selector: 'app-dashboard',
  imports: [NoteFormatPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  @ViewChild('chartModules') chartModulesRef!: ElementRef<HTMLCanvasElement>;

  private auth       = inject(AuthService);
  private moduleSvc  = inject(ModuleService);
  private noteSvc    = inject(NoteService);
  private examenSvc  = inject(ExamenService);
  private etudiantSvc = inject(EtudiantService);

  loading     = signal(false);
  moduleStats = signal<ModuleStat[]>([]);
  enseignantNom = signal('');

  ngOnInit() {
    const user = this.auth.currentUser();
    if (!user) return;
    this.enseignantNom.set(`${user.prenom} ${user.nom}`);

    this.loading.set(true);
    forkJoin({
      modules:  this.moduleSvc.getByEnseignant(user.id),
      examens:  this.examenSvc.getAll(),
      notes:    this.noteSvc.getAll(),
    }).subscribe({
      next: ({ modules, examens, notes }) => {
        const stats: ModuleStat[] = modules.map(module => {
          const modExamens = examens.filter(e => Number(e.moduleId) === Number(module.id));
          const modNotes: Note[] = [];
          modExamens.forEach(ex => {
            notes.filter(n => Number(n.examenId) === Number(ex.id)).forEach(n => modNotes.push(n));
          });

          const noteFinales = modNotes.map(n => n.noteFinale);
          const moy = noteFinales.length > 0
            ? Math.round(noteFinales.reduce((s, n) => s + n, 0) / noteFinales.length * 100) / 100
            : 0;
          const taux = noteFinales.length > 0
            ? Math.round(noteFinales.filter(n => n >= 10).length / noteFinales.length * 100)
            : 0;

          return {
            module,
            moyenneClasse: moy,
            tauxReussite: taux,
            nbEtudiants: noteFinales.length,
            notes: noteFinales,
          };
        });

        this.moduleStats.set(stats);
        this.loading.set(false);
        setTimeout(() => this.buildChart(), 100);
      },
      error: () => this.loading.set(false)
    });
  }

  private buildChart() {
    if (!this.chartModulesRef) return;
    const stats = this.moduleStats();
    if (!stats.length) return;

    new Chart(this.chartModulesRef.nativeElement, {
      type: 'bar',
      data: {
        labels: stats.map(s => s.module.code),
        datasets: [
          {
            label: 'Moyenne classe',
            data: stats.map(s => s.moyenneClasse),
            backgroundColor: '#6366f1',
            yAxisID: 'y'
          },
          {
            label: 'Taux réussite %',
            data: stats.map(s => s.tauxReussite),
            backgroundColor: '#16a34a',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y:  { min: 0, max: 20, position: 'left',  title: { display: true, text: 'Moyenne /20' } },
          y1: { min: 0, max: 100, position: 'right', title: { display: true, text: 'Taux %' },
            grid: { drawOnChartArea: false } }
        }
      }
    });
  }
}
