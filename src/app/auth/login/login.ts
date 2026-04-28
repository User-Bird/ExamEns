import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthService);
  private router  = inject(Router);

  loading  = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      error: (err) => {
        this.errorMsg.set(err.message ?? 'Erreur de connexion');
        this.loading.set(false);
      }
    });
  }

  // Quick-fill helpers for demo
  fillAdmin()      { this.form.setValue({ email: 'admin@ens.ma',           password: 'admin123' }); }
  fillEnseignant() { this.form.setValue({ email: 'm.alaoui@ens.ma',        password: 'prof123'  }); }
  fillEtudiant()   { this.form.setValue({ email: 'youssef.idrissi@ens.ma', password: 'etud123'  }); }
}
