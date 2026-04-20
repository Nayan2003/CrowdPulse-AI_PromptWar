// src/app/components/gates/gates.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { Gate } from '../../models/stadium.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gates',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="gates-wrap">
  <div class="page-header">
    <div>
      <h3>Gate Management</h3>
      <p class="sub">Live wait times & flow rates — streamed from Firebase RTDB</p>
    </div>
    <span class="firebase-badge">🔥 Firebase Live</span>
  </div>

  <!-- Summary cards -->
  <div class="summary-row">
    <div class="sum-card">
      <div class="sum-label">Total gates</div>
      <div class="sum-val">{{ gates().length }}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Clear</div>
      <div class="sum-val" style="color:#22c55e">{{ countStatus('ok') }}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Moderate</div>
      <div class="sum-val" style="color:#f59e0b">{{ countStatus('warn') }}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Congested</div>
      <div class="sum-val" style="color:#ef4444">{{ countStatus('crit') }}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Diverted</div>
      <div class="sum-val" style="color:#ef4444">{{ countDiverted() }}</div>
    </div>
  </div>

  <!-- Gate cards grid -->
  <div class="gate-grid">
    <div *ngFor="let g of gatesSorted()" class="gate-card" [ngClass]="'border-'+g.status">
      <div class="gc-header">
        <div class="gc-label">{{ g.label }}</div>
        <span class="badge" [ngClass]="'b-'+g.status">{{ statusLabel(g.status) }}</span>
      </div>
      <div class="gc-location">{{ g.location }}</div>
      <div class="gc-metrics">
        <div class="gc-metric">
          <div class="gcm-label">Wait time</div>
          <div class="gcm-val" [style.color]="waitColor(g.waitMinutes)">{{ g.waitMinutes }} min</div>
        </div>
        <div class="gc-metric">
          <div class="gcm-label">Flow rate</div>
          <div class="gcm-val">{{ g.flowRate }} ppl/min</div>
        </div>
      </div>
      <div class="queue-bar-wrap">
        <div class="queue-bar-track">
          <div class="queue-bar-fill" [style.width.%]="queuePct(g.waitMinutes)" [style.background]="waitColor(g.waitMinutes)"></div>
        </div>
        <span class="queue-bar-label">{{ queuePct(g.waitMinutes) | number:'1.0-0' }}% capacity</span>
      </div>
      <div class="diverted-tag" *ngIf="g.diverted">
        ⚠ Traffic diverted — recommend alternate entry
      </div>
    </div>
  </div>

  <!-- Detail table -->
  <div class="panel">
    <div class="panel-title">Full gate analytics — sorted by wait time</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Gate</th>
          <th>Location</th>
          <th>Wait</th>
          <th>Flow</th>
          <th>Status</th>
          <th>Diverted</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let g of gatesSorted()">
          <td><strong>{{ g.label }}</strong></td>
          <td class="muted">{{ g.location }}</td>
          <td><span [style.color]="waitColor(g.waitMinutes)" style="font-weight:600;font-family:monospace">{{ g.waitMinutes }} min</span></td>
          <td class="mono">{{ g.flowRate }} ppl/min</td>
          <td><span class="badge" [ngClass]="'b-'+g.status">{{ statusLabel(g.status) }}</span></td>
          <td><span class="badge" [ngClass]="g.diverted ? 'b-crit' : 'b-ok'">{{ g.diverted ? 'Yes' : 'No' }}</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .gates-wrap { display: flex; flex-direction: column; gap: 16px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    h3 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
    .sub { font-size: 12px; color: #64748b; }
    .firebase-badge { font-size: 11px; padding: 4px 10px; background: rgba(251,146,60,.1); border: 1px solid rgba(251,146,60,.2); border-radius: 20px; color: #fb923c; }
    .summary-row { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; }
    .sum-card { background: #111318; border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: 14px; }
    .sum-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
    .sum-val { font-size: 28px; font-weight: 700; line-height: 1; }
    .gate-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    .gate-card { background: #111318; border: 1px solid rgba(255,255,255,.07); border-radius: 12px; padding: 16px; border-left: 3px solid transparent; }
    .border-ok { border-left-color: #22c55e; }
    .border-warn { border-left-color: #f59e0b; }
    .border-crit { border-left-color: #ef4444; }
    .gc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .gc-label { font-size: 15px; font-weight: 600; }
    .gc-location { font-size: 12px; color: #64748b; margin-bottom: 14px; }
    .gc-metrics { display: flex; gap: 20px; margin-bottom: 12px; }
    .gcm-label { font-size: 11px; color: #64748b; margin-bottom: 3px; }
    .gcm-val { font-size: 18px; font-weight: 600; font-family: 'DM Mono', monospace; }
    .queue-bar-wrap { margin-bottom: 8px; }
    .queue-bar-track { height: 6px; background: rgba(255,255,255,.06); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
    .queue-bar-fill { height: 100%; border-radius: 3px; transition: width .5s ease, background .3s; }
    .queue-bar-label { font-size: 10px; color: #334155; }
    .diverted-tag { font-size: 11px; color: #f59e0b; background: rgba(245,158,11,.08); border: 1px solid rgba(245,158,11,.2); border-radius: 6px; padding: 5px 8px; }
    .badge { display: inline-flex; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
    .b-ok { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.2); }
    .b-warn { background: rgba(245,158,11,.1); color: #f59e0b; border: 1px solid rgba(245,158,11,.2); }
    .b-crit { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.2); }
    .panel { background: #111318; border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 16px; }
    .panel-title { font-size: 10px; font-weight: 600; color: #334155; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 14px; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th { padding: 10px 12px; color: #64748b; font-weight: 500; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,.06); text-align: left; }
    .data-table td { padding: 13px 12px; border-bottom: 1px solid rgba(255,255,255,.03); }
    .data-table tr:hover td { background: rgba(255,255,255,.02); }
    .muted { color: #64748b; }
    .mono { font-family: 'DM Mono', monospace; }
  `]
})
export class GatesComponent implements OnInit, OnDestroy {
  private fb = inject(FirebaseService);
  gates = signal<Gate[]>([]);
  private sub!: Subscription;

  ngOnInit(): void { this.sub = this.fb.getGates$().subscribe(g => this.gates.set(g)); }

  gatesSorted() { return [...this.gates()].sort((a, b) => b.waitMinutes - a.waitMinutes); }
  countStatus(s: string): number { return this.gates().filter(g => g.status === s).length; }
  countDiverted(): number { return this.gates().filter(g => g.diverted).length; }
  statusLabel(s: string): string { return s === 'crit' ? 'Congested' : s === 'warn' ? 'Moderate' : 'Clear'; }
  waitColor(w: number): string { return w >= 15 ? '#ef4444' : w >= 8 ? '#f59e0b' : '#22c55e'; }
  queuePct(w: number): number { return Math.min(100, Math.round((w / 25) * 100)); }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
