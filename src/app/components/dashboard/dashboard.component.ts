// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { SimulatorService } from '../../services/simulator.service';
import { StadiumSnapshot, Gate, Stand, FoodStall } from '../../models/stadium.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
<div class="shell">

  <!-- HEADER -->
  <header class="header">
    <div class="logo">
      <div class="logo-mark">C</div>
      <div>
        <div class="logo-name">CrowdPulse-AI</div>
        <div class="logo-sub">Wankhede Stadium · Match Day #14</div>
      </div>
    </div>
    <div class="header-center">
      <span class="live-pill"><span class="live-dot"></span>Firebase Live</span>
      <span class="clock">{{ clock() }}</span>
    </div>
    <div class="header-right">
      <button class="logout-btn" (click)="logout()">Logout</button>
    </div>
  </header>

  <div class="body">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <nav class="nav-menu">
        <a class="nav-item" routerLink="/overview" routerLinkActive="active">
          <span class="nav-icon">🏟</span> Overview
        </a>
        <a class="nav-item" routerLink="/gates" routerLinkActive="active">
          <span class="nav-icon">🚪</span> Gates
        </a>
        <a class="nav-item" routerLink="/food" routerLinkActive="active">
          <span class="nav-icon">🍔</span> Food & Queues
        </a>
        <a class="nav-item" routerLink="/alerts" routerLinkActive="active">
          <span class="nav-icon">⚠️</span> Alerts
        </a>
      </nav>

      <div class="sidebar-section">
        <div class="section-label">Stands</div>
        <div *ngFor="let s of stands()" class="sb-row">
          <span class="sb-name">{{ s.name }}</span>
          <span class="sb-pct" [style.color]="colorFor(s.occupancy)">{{ s.occupancy }}%</span>
        </div>
      </div>

      <div class="sidebar-section">
        <div class="section-label">Gates</div>
        <div *ngFor="let g of gates()" class="sb-row">
          <span class="sb-name">{{ g.label }}</span>
          <span class="badge" [ngClass]="'b-'+g.status">{{ g.waitMinutes }}m</span>
        </div>
      </div>

      <div class="sidebar-section">
        <div class="section-label">Snapshot</div>
        <div class="snapshot-info" *ngIf="snap()">
          <div>Attendance: <strong>{{ snap()!.totalAttendance | number }}</strong></div>
          <div>Occupancy: <strong>{{ snap()!.occupancyPct }}%</strong></div>
          <div>Busiest: <strong>{{ snap()!.busiestStand }}</strong></div>
          <div>Alerts: <strong [style.color]="snap()!.activeAlerts > 0 ? '#ef4444' : '#22c55e'">{{ snap()!.activeAlerts }}</strong></div>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main-content">
      <router-outlet />
    </main>
  </div>
</div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .shell { display: flex; flex-direction: column; height: 100vh; background: #0a0c0f; color: #f0f2f5; font-family: 'DM Sans', system-ui, sans-serif; }

    /* HEADER */
    .header { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: #111318; border-bottom: 1px solid rgba(255,255,255,.07); flex-shrink: 0; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-mark { width: 32px; height: 32px; border-radius: 8px; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
    .logo-name { font-size: 15px; font-weight: 600; }
    .logo-sub { font-size: 11px; color: #64748b; }
    .header-center { display: flex; align-items: center; gap: 14px; }
    .live-pill { display: flex; align-items: center; gap: 5px; background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.2); border-radius: 20px; padding: 4px 10px; font-size: 11px; color: #22c55e; font-weight: 500; }
    .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    .clock { font-family: 'DM Mono', monospace; font-size: 12px; color: #64748b; }
    .logout-btn { padding: 6px 14px; background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 7px; color: #94a3b8; font-size: 12px; cursor: pointer; font-family: inherit; }
    .logout-btn:hover { background: rgba(255,255,255,.05); color: #fff; }

    /* BODY */
    .body { display: flex; flex: 1; overflow: hidden; }

    /* SIDEBAR */
    .sidebar { width: 248px; min-width: 248px; background: #111318; border-right: 1px solid rgba(255,255,255,.07); padding: 16px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
    .nav-menu { display: flex; flex-direction: column; gap: 4px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #64748b; text-decoration: none; font-size: 13px; font-weight: 500; transition: all .15s; }
    .nav-item:hover { background: rgba(255,255,255,.05); color: #fff; }
    .nav-item.active { background: rgba(59,130,246,.15); color: #3b82f6; }
    .nav-icon { font-size: 14px; }
    .sidebar-section {}
    .section-label { font-size: 10px; font-weight: 600; color: #334155; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
    .sb-row { display: flex; align-items: center; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,.04); }
    .sb-row:last-child { border-bottom: none; }
    .sb-name { font-size: 11px; color: #94a3b8; }
    .sb-pct { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 600; }
    .badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
    .b-ok { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.2); }
    .b-warn { background: rgba(245,158,11,.1); color: #f59e0b; border: 1px solid rgba(245,158,11,.2); }
    .b-crit { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.2); }
    .snapshot-info { font-size: 12px; color: #94a3b8; line-height: 2; }
    .snapshot-info strong { color: #f0f2f5; }

    /* MAIN */
    .main-content { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private fb = inject(FirebaseService);
  private sim = inject(SimulatorService);

  gates = signal<Gate[]>([]);
  stands = signal<Stand[]>([]);
  food = signal<FoodStall[]>([]);
  snap = signal<StadiumSnapshot | null>(null);
  clock = signal('');

  private subs: Subscription[] = [];
  private clockTimer: any;

  ngOnInit(): void {
    this.clockTimer = setInterval(() => {
      this.clock.set(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    // Seed DB if empty, then start streams
    this.fb.seedIfEmpty().then(() => {
      this.subs.push(this.fb.getGates$().subscribe(g => {
        this.gates.set(g);
        if (!this.sim['running']) this.tryStartSim();
      }));
      this.subs.push(this.fb.getStands$().subscribe(s => {
        this.stands.set(s);
        if (!this.sim['running']) this.tryStartSim();
      }));
      this.subs.push(this.fb.getFoodStalls$().subscribe(f => {
        this.food.set(f);
        if (!this.sim['running']) this.tryStartSim();
      }));
      this.subs.push(this.fb.getSnapshot$().subscribe(s => this.snap.set(s)));
    });
  }

  private simStarted = false;
  private tryStartSim(): void {
    if (this.simStarted) return;
    const g = this.gates(), s = this.stands(), f = this.food();
    if (g.length && s.length && f.length) {
      this.simStarted = true;
      this.sim.start(g, s, f);
    }
  }

  colorFor(pct: number): string {
    return pct >= 81 ? '#ef4444' : pct >= 65 ? '#f59e0b' : '#22c55e';
  }

  async logout(): Promise<void> {
    this.sim.stop();
    await this.fb.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    clearInterval(this.clockTimer);
  }
}
