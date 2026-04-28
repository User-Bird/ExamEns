import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/services/session';
import { Session } from '../../../models/index';

@Component({
  selector: 'app-session-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './session-form.html',
  styleUrl: './session-form.scss'
})
export class SessionForm implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(SessionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = signal(false);
  sessionId = signal<number | null>(null);
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    semestreId: [1, [Validators.required, Validators.min(1)]],
    type: ['normale' as Session['type'], Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required],
    statut: ['planifiee' as Session['statut'], Validators.required]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.sessionId.set(+id);
      this.svc.getById(+id).subscribe(session => this.form.patchValue(session));
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const value = this.form.value as Omit<Session, 'id'>;

    const req = this.isEdit()
      ? this.svc.update(this.sessionId()!, value)
      : this.svc.create(value);

    req.subscribe({
      next: () => this.router.navigate(['/admin/sessions']),
      error: () => { this.error.set('Erreur lors de la sauvegarde'); this.loading.set(false); }
    });
  }
}
