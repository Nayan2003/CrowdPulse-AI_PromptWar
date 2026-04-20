// src/app/services/firebase.service.ts
import { Injectable, inject } from '@angular/core';
import { Database, ref, onValue, set, push, query, orderByChild, limitToLast, off } from '@angular/fire/database';
import { Auth, signInWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Gate, Stand, FoodStall, AlertEntry, StadiumSnapshot } from '../models/stadium.models';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private db = inject(Database);
  private auth = inject(Auth);

  // ─── Auth ──────────────────────────────────────────────────
  get currentUser$(): Observable<User | null> {
    return authState(this.auth);
  }

  login(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password).then(() => {});
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  // ─── Real-time RTDB streams ────────────────────────────────

  /** Stream all gates from Firebase */
  getGates$(): Observable<Gate[]> {
    return new Observable(observer => {
      const dbRef = ref(this.db, 'gates');
      onValue(dbRef, snap => {
        const val = snap.val();
        if (val) {
          const gates: Gate[] = Object.keys(val).map(k => ({ id: k, ...val[k] }));
          observer.next(gates);
        } else {
          observer.next([]);
        }
      }, err => observer.error(err));
      return () => off(dbRef);
    });
  }

  /** Stream all stands from Firebase */
  getStands$(): Observable<Stand[]> {
    return new Observable(observer => {
      const dbRef = ref(this.db, 'stands');
      onValue(dbRef, snap => {
        const val = snap.val();
        if (val) {
          const stands: Stand[] = Object.keys(val).map(k => ({ id: k, ...val[k] }));
          observer.next(stands);
        } else {
          observer.next([]);
        }
      }, err => observer.error(err));
      return () => off(dbRef);
    });
  }

  /** Stream all food stalls from Firebase */
  getFoodStalls$(): Observable<FoodStall[]> {
    return new Observable(observer => {
      const dbRef = ref(this.db, 'foodStalls');
      onValue(dbRef, snap => {
        const val = snap.val();
        if (val) {
          const stalls: FoodStall[] = Object.keys(val).map(k => ({ id: k, ...val[k] }));
          observer.next(stalls);
        } else {
          observer.next([]);
        }
      }, err => observer.error(err));
      return () => off(dbRef);
    });
  }

  /** Stream latest 50 alerts from Firebase, newest first */
  getAlerts$(): Observable<AlertEntry[]> {
    return new Observable(observer => {
      const dbRef = query(ref(this.db, 'alerts'), orderByChild('timestamp'), limitToLast(50));
      onValue(dbRef, snap => {
        const val = snap.val();
        if (val) {
          const alerts: AlertEntry[] = Object.keys(val)
            .map(k => ({ id: k, ...val[k] }))
            .sort((a, b) => b.timestamp - a.timestamp);
          observer.next(alerts);
        } else {
          observer.next([]);
        }
      }, err => observer.error(err));
      return () => off(dbRef);
    });
  }

  /** Stream stadium-level snapshot metrics */
  getSnapshot$(): Observable<StadiumSnapshot | null> {
    return new Observable(observer => {
      const dbRef = ref(this.db, 'snapshot');
      onValue(dbRef, snap => {
        observer.next(snap.val() as StadiumSnapshot | null);
      }, err => observer.error(err));
      return () => off(dbRef);
    });
  }

  // ─── Write methods ─────────────────────────────────────────

  pushAlert(alert: Omit<AlertEntry, 'id'>): Promise<void> {
    return push(ref(this.db, 'alerts'), alert).then(() => {});
  }

  updateGate(gate: Gate): Promise<void> {
    const { id, ...data } = gate;
    return set(ref(this.db, `gates/${id}`), data);
  }

  updateStand(stand: Stand): Promise<void> {
    const { id, ...data } = stand;
    return set(ref(this.db, `stands/${id}`), data);
  }

  updateFoodStall(stall: FoodStall): Promise<void> {
    const { id, ...data } = stall;
    return set(ref(this.db, `foodStalls/${id}`), data);
  }

  updateSnapshot(snapshot: StadiumSnapshot): Promise<void> {
    return set(ref(this.db, 'snapshot'), snapshot);
  }

  /** Seed initial data if DB is empty */
  async seedIfEmpty(): Promise<void> {
    const dbRef = ref(this.db, 'gates');
    return new Promise(resolve => {
      onValue(dbRef, async snap => {
        off(dbRef);
        if (!snap.val()) {
          await this.seedInitialData();
        }
        resolve();
      }, { onlyOnce: true });
    });
  }

  private async seedInitialData(): Promise<void> {
    const gates: Record<string, Omit<Gate, 'id'>> = {
      gate1: { label: 'Gate 1', location: 'Grand Stand Gate', lat: 18.9379, lng: 72.8257, waitMinutes: 8, flowRate: 35, status: 'ok', diverted: false },
      gate2: { label: 'Gate 2', location: 'Garware Stand Gate', lat: 18.9383, lng: 72.8251, waitMinutes: 6, flowRate: 32, status: 'ok', diverted: false },
      gate3: { label: 'Gate 3', location: 'Marine Drive West', lat: 18.9388, lng: 72.8247, waitMinutes: 3, flowRate: 12, status: 'ok', diverted: false },
      gate4: { label: 'Gate 4', location: 'Churchgate North', lat: 18.9399, lng: 72.8258, waitMinutes: 5, flowRate: 15, status: 'ok', diverted: false },
      gate5: { label: 'Gate 5', location: 'Ayakar East Upper', lat: 18.9396, lng: 72.8266, waitMinutes: 4, flowRate: 18, status: 'ok', diverted: false },
      gate6: { label: 'Gate 6', location: 'Ayakar East Lower', lat: 18.9380, lng: 72.8266, waitMinutes: 11, flowRate: 35, status: 'warn', diverted: false },
      gate7: { label: 'Gate 7', location: 'Chowk South', lat: 18.9377, lng: 72.8258, waitMinutes: 16, flowRate: 45, status: 'crit', diverted: true }
    };
    const stands: Record<string, Omit<Stand, 'id'>> = {
      north:    { name: 'North Stand',              sections: 'G–Y', occupancy: 78, capacity: 10950, present: 8541, svgId: 's-north' },
      grand:    { name: 'Grand Stand',              sections: 'Levels 1–4', occupancy: 91, capacity: 6813, present: 6200, svgId: 's-grand' },
      sachin:   { name: 'Sachin Tendulkar Pavilion', sections: 'A–Q', occupancy: 62, capacity: 5500, present: 3410, svgId: 's-sachin' },
      gavaskar: { name: 'Sunil Gavaskar Pavilion',   sections: 'A–L', occupancy: 88, capacity: 5500, present: 4840, svgId: 's-gavaskar' },
      vij:      { name: 'Vijay Merchant Pavilion',  sections: 'B–L', occupancy: 75, capacity: 5500, present: 4125, svgId: 's-vij' },
      divecha:  { name: 'Divesha Stand',            sections: 'F–J', occupancy: 72, capacity: 5500, present: 3960, svgId: 's-divecha' },
      mca:      { name: 'MCA Pavilion',             sections: 'Boxes', occupancy: 84, capacity: 2500, present: 2100, svgId: 's-mca' },
      garware:  { name: 'Garware Pavilion',         sections: 'Upper tier', occupancy: 58, capacity: 2500, present: 1450, svgId: 's-garware' }
    };
    const food: Record<string, Omit<FoodStall, 'id'>> = {
      burgerPoint:  { name: 'Burger Point',     zone: 'North',  queueLength: 45, waitMinutes: 15, status: 'crit' },
      coldDrinks:   { name: 'Cold Drinks Bar',  zone: 'East',   queueLength: 12, waitMinutes: 4,  status: 'ok' },
      pizzaHub:     { name: 'Pizza Hub',        zone: 'South',  queueLength: 28, waitMinutes: 9,  status: 'warn' },
      snackBar:     { name: 'Snack Bar',        zone: 'West',   queueLength: 5,  waitMinutes: 2,  status: 'ok' },
      grandFnb:     { name: 'Grand Stand F&B',  zone: 'Grand',  queueLength: 24, waitMinutes: 14, status: 'crit' },
      northKiosk:   { name: 'North Kiosk A3',   zone: 'North',  queueLength: 7,  waitMinutes: 4,  status: 'ok' },
      westMerch:    { name: 'West Merchandise', zone: 'West',   queueLength: 3,  waitMinutes: 2,  status: 'ok' }
    };
    await Promise.all([
      set(ref(this.db, 'gates'), gates),
      set(ref(this.db, 'stands'), stands),
      set(ref(this.db, 'foodStalls'), food)
    ]);
    await this.pushAlert({ title: 'System Init', body: 'CrowdPulse-AI Firebase database seeded.', severity: 'info', timestamp: Date.now() });
  }
}
