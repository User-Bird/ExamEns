// sidebar.ts
import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import {TitleCasePipe} from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  auth = inject(AuthService);

  adminLinks = [
    { path: '/admin/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/admin/sessions', label: '📅 Sessions' },
    { path: '/admin/examens', label: '📝 Examens' },
    { path: '/admin/deliberations', label: '⚖️ Délibérations' },
  ];

  enseignantLinks = [
    { path: '/enseignant/dashboard', label: '📊 Dashboard' },
    { path: '/enseignant/saisie-notes', label: '✏️ Saisie Notes' },
    { path: '/enseignant/notes-module', label: '📋 Notes Module' },
  ];

  etudiantLinks = [
    { path: '/etudiant/mes-notes', label: '📚 Mes Notes' },
    { path: '/etudiant/releve-notes', label: '🖨️ Relevé' },
  ];

  links = computed(() => {
    const role = this.auth.userRole();
    if (role === 'admin') return this.adminLinks;
    if (role === 'enseignant') return this.enseignantLinks;
    return this.etudiantLinks;
  });
}
