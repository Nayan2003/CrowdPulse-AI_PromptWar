// src/app/components/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="login-overlay">
  <div class="login-card">
    <div class="logo-mark">C</div>
    <h2>CrowdPulse-AI</h2>
    <p class="sub">Wankhede Stadium · Admin Control Room</p>

    <form (ngSubmit)="onLogin()">
      <div class="input-group">
        <label>Email</label>
        <input type="email" [(ngModel)]="email" name="email" placeholder="admin@crowdpulse.ai" required />
      </div>
      <div class="input-group">
        <label>Password</label>
        <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
      </div>
      <div class="error-msg" *ngIf="error()">{{ error() }}</div>
      <button type="submit" [disabled]="loading()">
        {{ loading() ? 'Signing in...' : 'Secure Login' }}
      </button>
    </form>

    <p class="hint">
      First run? Create an admin user in Firebase Console → Authentication → Add user.
    </p>
  </div>
</div>
  `,
  styles: [`
    .login-overlay {
      position: fixed; inset: 0;
      background: #0a0c0f;
      background-image: radial-gradient(circle at 50% 50%, rgba(59,130,246,.15) 0%, transparent 60%);
      display: flex; align-items: center; justify-content: center;
    }
    .login-card {
      background: rgba(26,33,56,.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px;
      padding: 40px;
      width: 100%; max-width: 420px;
      text-align: center;
    }
    .logo-mark {
      width: 52px; height: 52px; border-radius: 12px;
      background: #3b82f6; color: #fff;
      font-size: 26px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    h2 { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .sub { font-size: 13px; color: #64748b; margin-bottom: 28px; }
    .input-group { margin-bottom: 16px; text-align: left; }
    label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
    input {
      width: 100%; background: rgba(0,0,0,.3);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px; padding: 12px 16px;
      color: #fff; font-size: 14px; font-family: inherit;
      transition: border-color .2s;
    }
    input:focus { outline: none; border-color: #3b82f6; }
    .error-msg { color: #ef4444; font-size: 12px; margin-bottom: 12px; }
    button {
      width: 100%; padding: 13px;
      background: #3b82f6; color: #fff; border: none;
      border-radius: 10px; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: background .2s; font-family: inherit;
    }
    button:hover:not(:disabled) { background: #1d4ed8; }
    button:disabled { opacity: .6; cursor: not-allowed; }
    .hint { font-size: 11px; color: #334155; margin-top: 20px; line-height: 1.5; }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  private fb = inject(FirebaseService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async onLogin(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.fb.login(this.email, this.password);
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set(err.message ?? 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}
