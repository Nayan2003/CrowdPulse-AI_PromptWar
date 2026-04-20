// src/app/components/alerts/alerts.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { AlertEntry } from '../../models/stadium.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="alerts-wrap">
  <div class="page-header">
    <div>
      <h3>System Event Log</h3>
      <p class="sub">AI-generated alerts pushed to Firebase — newest first</p>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <span class="firebase-badge">🔥 Firebase Live</span>
      <button class="action-btn crit" (click)="triggerManualAlert('crit')">🔴 Critical Alert</button>
      <button class="action-btn warn" (click)="triggerManualAlert('warn')">🟠 Warning</button>
      <button class="action-btn info" (click)="triggerManualAlert('info')">🔵 Sys Check</button>
    </div>
  </div>

  <!-- Summary pills -->
  <div class="summary-row">
    <div class="pill-stat b-crit">
      <span class="pill-val">{{ countSeverity('crit') }}</span>
      <span class="pill-label">Critical</span>
    </div>
    <div class="pill-stat b-warn">
      <span class="pill-val">{{ countSeverity('warn') }}</span>
      <span class="pill-label">Warnings</span>
    </div>
    <div class="pill-stat b-info">
      <span class="pill-val">{{ countSeverity('info') }}</span>
      <span class="pill-label">Info</span>
    </div>
    <div class="pill-stat b-ok">
      <span class="pill-val">{{ alerts().length }}</span>
      <span class="pill-label">Total (last 50)</span>
    </div>
  </div>

  <!-- Alert feed -->
  <div class="alert-feed">
    <div *ngFor="let a of alerts(); trackBy: trackAlert" class="alert-item" [ngClass]="a.severity">
      <div class="alert-dot"></div>
      <div class="alert-content">
        <div class="alert-row">
          <div class="alert-title">{{ a.title }}</div>
          <div class="alert-time">{{ formatTime(a.timestamp) }}</div>
        </div>
        <div class="alert-body">{{ a.body }}</div>
      </div>
    </div>
    <div *ngIf="alerts().length === 0" class="empty-state">
      No alerts yet. The simulator will push alerts automatically.
    </div>
  </div>
</div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .alerts-wrap { display: flex; flex-direction: column; gap: 16px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    h3 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
    .sub { font-size: 12px; color: #64748b; }
    .firebase-badge { font-size: 11px; padding: 4px 10px; background: rgba(251,146,60,.1); border: 1px solid rgba(251,146,60,.2); border-radius: 20px; color: #fb923c; }
    .action-btn { font-size: 11px; padding: 5px 12px; border-radius: 7px; cursor: pointer; font-family: inherit; font-weight: 600; transition: opacity .15s; border: 1px solid; }
    .action-btn.crit { background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.2); color: #ef4444; }
    .action-btn.warn { background: rgba(245,158,11,.1); border-color: rgba(245,158,11,.2); color: #f59e0b; }
    .action-btn.info { background: rgba(59,130,246,.1); border-color: rgba(59,130,246,.2); color: #3b82f6; }
    .action-btn:hover { opacity: .75; }
    .summary-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .pill-stat { display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-radius: 10px; border: 1px solid; }
    .pill-val { font-size: 22px; font-weight: 700; font-family: 'DM Mono', monospace; }
    .pill-label { font-size: 11px; font-weight: 500; }
    .b-crit { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.2); color: #ef4444; }
    .b-warn { background: rgba(245,158,11,.08); border-color: rgba(245,158,11,.2); color: #f59e0b; }
    .b-info { background: rgba(59,130,246,.08); border-color: rgba(59,130,246,.2); color: #3b82f6; }
    .b-ok { background: rgba(34,197,94,.08); border-color: rgba(34,197,94,.2); color: #22c55e; }
    .alert-feed { display: flex; flex-direction: column; gap: 8px; }
    .alert-item { display: flex; gap: 12px; padding: 12px 14px; border-radius: 10px; border: 1px solid; animation: slideIn .25s ease-out; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    .alert-item.crit { background: rgba(239,68,68,.07); border-color: rgba(239,68,68,.18); }
    .alert-item.warn { background: rgba(245,158,11,.07); border-color: rgba(245,158,11,.18); }
    .alert-item.info { background: rgba(59,130,246,.06); border-color: rgba(59,130,246,.18); }
    .alert-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
    .crit .alert-dot { background: #ef4444; }
    .warn .alert-dot { background: #f59e0b; }
    .info .alert-dot { background: #3b82f6; }
    .alert-content { flex: 1; }
    .alert-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px; }
    .alert-title { font-size: 13px; font-weight: 600; }
    .crit .alert-title { color: #ef4444; }
    .warn .alert-title { color: #f59e0b; }
    .info .alert-title { color: #3b82f6; }
    .alert-time { font-size: 11px; color: #334155; font-family: 'DM Mono', monospace; }
    .alert-body { font-size: 12px; color: #64748b; line-height: 1.5; }
    .empty-state { text-align: center; padding: 40px; color: #334155; font-size: 13px; background: #111318; border-radius: 10px; border: 1px solid rgba(255,255,255,.05); }
  `]
})
export class AlertsComponent implements OnInit, OnDestroy {
  private fb = inject(FirebaseService);
  alerts = signal<AlertEntry[]>([]);
  private sub!: Subscription;

  private readonly manualAlerts = {
    crit: { title: 'MANUAL: Critical override', body: 'Admin-triggered critical alert. Immediate review required.', severity: 'crit' as const },
    warn: { title: 'MANUAL: Warning issued', body: 'Admin-triggered warning. Monitor the situation closely.', severity: 'warn' as const },
    info: { title: 'MANUAL: System check', body: 'Admin-initiated system check. All subsystems operational.', severity: 'info' as const }
  };

  ngOnInit(): void { this.sub = this.fb.getAlerts$().subscribe(a => this.alerts.set(a)); }

  async triggerManualAlert(type: 'crit' | 'warn' | 'info'): Promise<void> {
    await this.fb.pushAlert({ ...this.manualAlerts[type], timestamp: Date.now() });
  }

  countSeverity(s: string): number { return this.alerts().filter(a => a.severity === s).length; }
  formatTime(ts: number): string { return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
  trackAlert(_: number, a: AlertEntry): string { return a.id; }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
