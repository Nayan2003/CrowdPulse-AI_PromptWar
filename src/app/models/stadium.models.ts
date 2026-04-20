// src/app/models/stadium.models.ts

export interface Gate {
  id: string;
  label: string;
  location: string;
  lat: number;
  lng: number;
  waitMinutes: number;
  flowRate: number;   // people per minute
  status: 'ok' | 'warn' | 'crit';
  diverted: boolean;
}

export interface Stand {
  id: string;
  name: string;
  sections: string;
  occupancy: number;  // 0–100
  capacity: number;
  present: number;
  svgId: string;
}

export interface FoodStall {
  id: string;
  name: string;
  zone: string;
  queueLength: number;
  waitMinutes: number;
  status: 'ok' | 'warn' | 'crit';
}

export interface AlertEntry {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warn' | 'crit';
  timestamp: number;
}

export interface StadiumSnapshot {
  totalAttendance: number;
  occupancyPct: number;
  busiestStand: string;
  busiestPct: number;
  activeAlerts: number;
  lastUpdated: number;
}
