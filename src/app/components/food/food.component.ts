// src/app/components/food/food.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { FoodStall } from '../../models/stadium.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-food',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="food-wrap">
  <div class="page-header">
    <div>
      <h3>F&amp;B Queue Analytics</h3>
      <p class="sub">Real-time queue lengths & wait times — Firebase RTDB</p>
    </div>
    <span class="firebase-badge">🔥 Firebase Live</span>
  </div>

  <!-- Summary -->
  <div class="summary-row">
    <div class="sum-card">
      <div class="sum-label">Vendors</div>
      <div class="sum-val">{{ food().length }}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Total in queue</div>
      <div class="sum-val">{{ totalQueue() }}</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Peak wait</div>
      <div class="sum-val" style="color:#ef4444">{{ maxWait() }} min</div>
    </div>
    <div class="sum-card">
      <div class="sum-label">Congested</div>
      <div class="sum-val" style="color:#ef4444">{{ countCrit() }}</div>
    </div>
  </div>

  <!-- Stall cards -->
  <div class="stall-grid">
    <div *ngFor="let f of foodSorted()" class="stall-card" [ngClass]="'border-'+f.status">
      <div class="stall-head">
        <div>
          <div class="stall-name">{{ f.name }}</div>
          <div class="stall-zone">{{ f.zone }} Zone</div>
        </div>
        <span class="badge" [ngClass]="'b-'+f.status">{{ statusLabel(f.status) }}</span>
      </div>
      <div class="stall-metrics">
        <div class="sm-item">
          <div class="sm-label">In queue</div>
          <div class="sm-val" [style.color]="statusColor(f.status)">{{ f.queueLength }}</div>
        </div>
        <div class="sm-item">
          <div class="sm-label">Wait time</div>
          <div class="sm-val" [style.color]="statusColor(f.status)">{{ f.waitMinutes }} min</div>
        </div>
      </div>
      <div class="queue-track">
        <div class="queue-fill" [style.width.%]="Math.min(100, f.queueLength * 1.5)" [style.background]="statusColor(f.status)"></div>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="panel">
    <div class="panel-title">Detailed F&amp;B table — sorted by queue length</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Vendor</th>
          <th>Zone</th>
          <th>Queue</th>
          <th>Wait</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let f of foodSorted()">
          <td><strong>{{ f.name }}</strong></td>
          <td class="muted">{{ f.zone }}</td>
          <td class="mono">{{ f.queueLength }} people</td>
          <td><span [style.color]="statusColor(f.status)" style="font-weight:600;font-family:monospace">{{ f.waitMinutes }} min</span></td>
          <td><span class="badge" [ngClass]="'b-'+f.status">{{ statusLabel(f.status) }}</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .food-wrap { display: flex; flex-direction: column; gap: 16px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    h3 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
    .sub { font-size: 12px; color: #64748b; }
    .firebase-badge { font-size: 11px; padding: 4px 10px; background: rgba(251,146,60,.1); border: 1px solid rgba(251,146,60,.2); border-radius: 20px; color: #fb923c; }
    .summary-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
    .sum-card { background: #111318; border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: 14px; }
    .sum-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
    .sum-val { font-size: 28px; font-weight: 700; line-height: 1; }
    .stall-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    .stall-card { background: #111318; border: 1px solid rgba(255,255,255,.07); border-radius: 12px; padding: 16px; border-left: 3px solid transparent; }
    .border-ok { border-left-color: #22c55e; }
    .border-warn { border-left-color: #f59e0b; }
    .border-crit { border-left-color: #ef4444; }
    .stall-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
    .stall-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
    .stall-zone { font-size: 11px; color: #64748b; }
    .stall-metrics { display: flex; gap: 20px; margin-bottom: 12px; }
    .sm-label { font-size: 11px; color: #64748b; margin-bottom: 3px; }
    .sm-val { font-size: 20px; font-weight: 700; font-family: 'DM Mono', monospace; }
    .queue-track { height: 5px; background: rgba(255,255,255,.06); border-radius: 3px; overflow: hidden; }
    .queue-fill { height: 100%; border-radius: 3px; transition: width .5s ease, background .3s; }
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
export class FoodComponent implements OnInit, OnDestroy {
  protected Math = Math;
  private fb = inject(FirebaseService);
  food = signal<FoodStall[]>([]);
  private sub!: Subscription;

  ngOnInit(): void { this.sub = this.fb.getFoodStalls$().subscribe(f => this.food.set(f)); }

  foodSorted() { return [...this.food()].sort((a, b) => b.queueLength - a.queueLength); }
  totalQueue(): number { return this.food().reduce((acc, f) => acc + f.queueLength, 0); }
  maxWait(): number { return this.food().reduce((acc, f) => Math.max(acc, f.waitMinutes), 0); }
  countCrit(): number { return this.food().filter(f => f.status === 'crit').length; }
  statusLabel(s: string): string { return s === 'crit' ? 'Peak' : s === 'warn' ? 'Building' : 'Clear'; }
  statusColor(s: string): string { return s === 'crit' ? '#ef4444' : s === 'warn' ? '#f59e0b' : '#22c55e'; }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}
