// src/app/services/simulator.service.ts
import { Injectable, OnDestroy, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Gate, Stand, FoodStall } from '../models/stadium.models';

@Injectable({ providedIn: 'root' })
export class SimulatorService implements OnDestroy {
  private fb = inject(FirebaseService);
  private intervals: ReturnType<typeof setInterval>[] = [];
  private cachedGates: Gate[] = [];
  private cachedStands: Stand[] = [];
  private cachedFood: FoodStall[] = [];
  private running = false;

  start(gates: Gate[], stands: Stand[], food: FoodStall[]): void {
    if (this.running) return;
    this.running = true;
    this.cachedGates = JSON.parse(JSON.stringify(gates));
    this.cachedStands = JSON.parse(JSON.stringify(stands));
    this.cachedFood = JSON.parse(JSON.stringify(food));

    // Mutate gates every 4s
    this.intervals.push(setInterval(() => this.tickGates(), 4000));
    // Mutate stands every 6s
    this.intervals.push(setInterval(() => this.tickStands(), 6000));
    // Mutate food every 5s
    this.intervals.push(setInterval(() => this.tickFood(), 5000));
    // Push AI alerts occasionally
    this.intervals.push(setInterval(() => this.maybeAlert(), 8000));
  }

  private clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
  }

  private statusFromWait(w: number): 'ok' | 'warn' | 'crit' {
    return w >= 15 ? 'crit' : w >= 8 ? 'warn' : 'ok';
  }

  private tickGates(): void {
    this.cachedGates = this.cachedGates.map(g => {
      const delta = Math.floor(Math.random() * 5) - 2;
      g.waitMinutes = this.clamp(g.waitMinutes + delta, 1, 30);
      g.flowRate = this.clamp(g.flowRate + Math.floor(Math.random() * 6) - 3, 1, 60);
      g.status = this.statusFromWait(g.waitMinutes);
      g.diverted = g.status === 'crit';
      this.fb.updateGate(g);
      return g;
    });
  }

  private tickStands(): void {
    this.cachedStands = this.cachedStands.map(s => {
      const delta = Math.floor(Math.random() * 7) - 3;
      s.occupancy = this.clamp(s.occupancy + delta, 30, 99);
      s.present = Math.round(s.occupancy / 100 * s.capacity);
      this.fb.updateStand(s);
      return s;
    });
    // Recompute snapshot
    const total = this.cachedStands.reduce((acc, s) => acc + s.present, 0);
    const occ = Math.round(total / 45000 * 100);
    const busiest = this.cachedStands.reduce((a, b) => a.occupancy > b.occupancy ? a : b);
    const alerts = this.cachedStands.filter(s => s.occupancy >= 81).length;
    this.fb.updateSnapshot({ totalAttendance: total, occupancyPct: occ, busiestStand: busiest.name, busiestPct: busiest.occupancy, activeAlerts: alerts, lastUpdated: Date.now() });
  }

  private tickFood(): void {
    this.cachedFood = this.cachedFood.map(f => {
      f.queueLength = this.clamp(f.queueLength + Math.floor(Math.random() * 9) - 4, 0, 80);
      f.waitMinutes = this.clamp(Math.round(f.queueLength / 3), 1, 30);
      f.status = f.waitMinutes >= 12 ? 'crit' : f.waitMinutes >= 7 ? 'warn' : 'ok';
      this.fb.updateFoodStall(f);
      return f;
    });
  }

  private readonly aiAlerts = [
    { title: 'Crowd buildup detected', body: 'AI model flagged density spike near North Gate. Consider diversion.', severity: 'warn' as const },
    { title: 'Gate flow bottleneck', body: 'Queue exceeding normal threshold at Gate 7. Aux lane recommended.', severity: 'crit' as const },
    { title: 'Food service delay', body: 'Burger Point throughput dropped 40%. Staff reallocation suggested.', severity: 'warn' as const },
    { title: 'Concourse normalized', body: 'South Pavilion density returned to normal range.', severity: 'info' as const },
    { title: 'Halftime surge predicted', body: 'Vertex AI predicts 12% attendance surge in 8 min. Pre-open corridor C7.', severity: 'warn' as const },
    { title: 'Sensor heartbeat OK', body: 'All IoT edge nodes reporting nominal status.', severity: 'info' as const },
    { title: 'Heatmap red-zone alert', body: 'Grand Stand exceeds 90% capacity. Immediate review recommended.', severity: 'crit' as const }
  ];

  private maybeAlert(): void {
    if (Math.random() < 0.4) {
      const a = this.aiAlerts[Math.floor(Math.random() * this.aiAlerts.length)];
      this.fb.pushAlert({ ...a, timestamp: Date.now() });
    }
  }

  stop(): void {
    this.intervals.forEach(i => clearInterval(i));
    this.intervals = [];
    this.running = false;
  }

  ngOnDestroy(): void { this.stop(); }
}
