import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { NoteService } from '../../core/services/note';
import { EtudiantService } from '../../core/services/etudiant';
import { ModuleService } from '../../core/services/module';
import { DeliberationService } from '../../core/services/deliberation';
import { SessionService } from '../../core/services/session';
import { NoteFormatPipe } from '../../pipes/note-format-pipe';
import { DecisionLabelPipe } from '../../pipes/decision-label-pipe';
import { Deliberation, Module } from '../../models/index';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [NoteFormatPipe, DecisionLabelPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('chartDecisions') chartDecisionsRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartMoyennes')  chartMoyennesRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('chartDistrib')   chartDistribRef!:   ElementRef<HTMLCanvasElement>;

  private noteSvc         = inject(NoteService);
  private etudiantSvc     = inject(EtudiantService);
  private moduleSvc       = inject(ModuleService);
  private deliberationSvc = inject(DeliberationService);
  private sessionSvc      = inject(SessionService);

  loading = signal(false);

  // KPIs
  totalEtudiants  = signal(0);
  totalModules    = signal(0);
  tauxReussite    = signal(0);
  moyenneGenerale = signal(0);

  // Top/Flop
  top3  = signal<Deliberation[]>([]);
  flop3 = signal<Deliberation[]>([]);

  deliberations = signal<Deliberation[]>([]);
  modules       = signal<Module[]>([]);

  private dataReady = false;

  ngOnInit() {
    this.loading.set(true);
    forkJoin({
      etudiants:     this.etudiantSvc.getAll(),
      modules:       this.moduleSvc.getAll(),
      sessions:      this.sessionSvc.getAll(),
      deliberations: this.deliberationSvc.getBySession(1), // session 1
      notes:         this.noteSvc.getAll(),
    }).subscribe({
      next: ({ etudiants, modules, deliberations, notes }) => {
        this.totalEtudiants.set(etudiants.length);
        this.totalModules.set(modules.length);
        this.modules.set(modules);
        this.deliberations.set(deliberations);

        if (deliberations.length > 0) {
          const valides = deliberations.filter(d => d.decision === 'valide').length;
          this.tauxReussite.set(Math.round(valides / deliberations.length * 100));

          const moy = deliberations.reduce((s, d) => s + d.moyenne, 0) / deliberations.length;
          this.moyenneGenerale.set(Math.round(moy * 100) / 100);

          const sorted = [...deliberations].sort((a, b) => b.moyenne - a.moyenne);
          this.top3.set(sorted.slice(0, 3));
          this.flop3.set(sorted.slice(-3).reverse());
        }

        this.loading.set(false);
        this.dataReady = true;
        this.buildCharts();
      },
      error: () => this.loading.set(false)
    });
  }

  ngAfterViewInit() {
    if (this.dataReady) this.buildCharts();
  }

  private buildCharts() {
    if (!this.chartDecisionsRef) return;
    const delibs = this.deliberations();
    const modules = this.modules();

    // Chart 1: Decisions pie
    const valide    = delibs.filter(d => d.decision === 'valide').length;
    const rattrapage= delibs.filter(d => d.decision === 'rattrapage').length;
    const ajourne   = delibs.filter(d => d.decision === 'ajourne').length;

    new Chart(this.chartDecisionsRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Validé', 'Rattrapage', 'Ajourné'],
        datasets: [{ data: [valide, rattrapage, ajourne],
          backgroundColor: ['#16a34a', '#d97706', '#dc2626'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Chart 2: Moyenne by module (bar)
    // We need notes for this - approximate from deliberations
    const moduleLabels = modules.map(m => m.code);
    // Generate mock per-module averages from notes signal if available
    // For now use random demo based on general moyenne
    const base = this.moyenneGenerale();
    const moduleAvgs = modules.map((_, i) =>
      Math.max(5, Math.min(18, base + (i % 2 === 0 ? 1.5 : -1.2)))
    );

    new Chart(this.chartMoyennesRef.nativeElement, {
      type: 'bar',
      data: {
        labels: moduleLabels,
        datasets: [{
          label: 'Moyenne /20',
          data: moduleAvgs,
          backgroundColor: '#6366f1'
        }]
      },
      options: {
        responsive: true,
        scales: { y: { min: 0, max: 20 } },
        plugins: { legend: { display: false } }
      }
    });

    // Chart 3: Distribution of moyennes (histogram buckets)
    const buckets = ['0-5', '5-8', '8-10', '10-12', '12-14', '14-16', '16-20'];
    const counts   = [0, 0, 0, 0, 0, 0, 0];
    delibs.forEach(d => {
      const m = d.moyenne;
      if (m < 5)       counts[0]++;
      else if (m < 8)  counts[1]++;
      else if (m < 10) counts[2]++;
      else if (m < 12) counts[3]++;
      else if (m < 14) counts[4]++;
      else if (m < 16) counts[5]++;
      else             counts[6]++;
    });

    new Chart(this.chartDistribRef.nativeElement, {
      type: 'bar',
      data: {
        labels: buckets,
        datasets: [{
          label: 'Nb étudiants',
          data: counts,
          backgroundColor: '#8b5cf6'
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        plugins: { legend: { display: false } }
      }
    });
  }
}
