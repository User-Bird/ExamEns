import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ExamenService } from '../../../core/services/examen';
import { SessionService } from '../../../core/services/session';
import { ModuleService } from '../../../core/services/module';
import { Session, Module } from '../../../models/index';

@Component({
  selector: 'app-examen-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './examen-form.html',
  styleUrl: './examen-form.scss'
})
export class ExamenForm implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ExamenService);
  private sessionSvc = inject(SessionService);
  private moduleSvc = inject(ModuleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  examenId = signal<number | null>(null);
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  sessions = signal<Session[]>([]);
  modules = signal<Module[]>([]);

  form = this.fb.group({
    moduleId:  [null as number | null, Validators.required],
    sessionId: [null as number | null, Validators.required],
    date:      ['', Validators.required],
    duree:     [120, [Validators.required, Validators.min(30), Validators.max(300)]],
    salle:     ['', Validators.required]
  });

  ngOnInit() {
    this.loading.set(true);
    forkJoin({
      sessions: this.sessionSvc.getAll(),
      modules: this.moduleSvc.getAll()
    }).subscribe(({ sessions, modules }) => {
      this.sessions.set(sessions);
      this.modules.set(modules);
      this.loading.set(false);

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.isEdit.set(true);
        this.examenId.set(+id);
        this.svc.getById(+id).subscribe(examen => this.form.patchValue(examen));
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const value = this.form.value as any;

    const req = this.isEdit()
      ? this.svc.update(this.examenId()!, value)
      : this.svc.create(value);

    req.subscribe({
      next: () => this.router.navigate(['/admin/examens']),
      error: () => { this.error.set('Erreur lors de la sauvegarde'); this.saving.set(false); }
    });
  }
}
