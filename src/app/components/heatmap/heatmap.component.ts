// src/app/components/heatmap/heatmap.component.ts
import { Component, OnInit, OnDestroy, inject, signal, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { Stand, Gate, StadiumSnapshot } from '../../models/stadium.models';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="hm-wrap">

  <!-- TOP METRICS -->
  <div class="metrics-row">
    <div class="metric-card">
      <div class="metric-label">Attendance</div>
      <div class="metric-val">{{ snap()?.totalAttendance | number }}</div>
      <div class="metric-sub">of 45,000 capacity</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Occupancy</div>
      <div class="metric-val">{{ snap()?.occupancyPct }}%</div>
      <div><span class="badge" [ngClass]="occBadge()">{{ occLabel() }}</span></div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Busiest stand</div>
      <div class="metric-val small">{{ snap()?.busiestStand }}</div>
      <div><span class="badge b-crit">{{ snap()?.busiestPct }}%</span></div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Active alerts</div>
      <div class="metric-val" [style.color]="snap()?.activeAlerts ? '#ef4444' : '#22c55e'">{{ snap()?.activeAlerts ?? 0 }}</div>
      <div class="metric-sub">Firebase live</div>
    </div>
  </div>

  <!-- SPLIT LAYOUT -->
  <div class="ops-split">

    <!-- LEFT: MAP PANEL -->
    <div class="map-panel">
      <div class="legend">
        <span class="leg"><span class="leg-dot" style="background:#22c55e"></span>Low &lt;65%</span>
        <span class="leg"><span class="leg-dot" style="background:#f59e0b"></span>Moderate 65–80%</span>
        <span class="leg"><span class="leg-dot" style="background:#ef4444"></span>High &gt;80%</span>
        <span class="leg"><span class="leg-dot" style="background:#3b82f6;border-radius:50%"></span>Gates</span>
        <button class="toggle-map-btn" (click)="toggleMapMode()">
          {{ useGoogleMaps ? 'SVG View' : 'Google Maps' }}
        </button>
      </div>

      <!-- SVG Stadium Map -->
      <div class="stadium-wrap" *ngIf="!useGoogleMaps">
        <div class="tooltip-box" *ngIf="tooltipVisible" [style.left.px]="ttX" [style.top.px]="ttY">
          <strong>{{ ttName }}</strong>
          <span>Occupancy: <b [style.color]="colorFor(ttPct)">{{ ttPct }}%</b></span>
          <span>Present: {{ ttPresent | number }} / {{ ttCap | number }}</span>
        </div>
        <svg viewBox="0 0 560 560" width="100%" height="100%" style="max-height:100%;display:block">
          <ellipse cx="280" cy="280" rx="248" ry="240" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
          <ellipse cx="280" cy="280" rx="200" ry="192" fill="rgba(255,255,255,0.015)"/>

          <!-- Stands -->
          <ng-container *ngFor="let s of stands()">
            <ng-container [ngSwitch]="s.id">
              <ng-container *ngSwitchCase="'north'">
                <ellipse cx="280" cy="105" rx="128" ry="40" [attr.fill]="colorFor(s.occupancy)" opacity=".84" style="cursor:pointer"
                  (mousemove)="showTip($event,s)" (mouseleave)="hideTip()"/>
                <text x="280" y="99" text-anchor="middle" font-size="11" font-weight="600" [attr.fill]="darkFor(s.occupancy)">North Stand</text>
                <text x="280" y="114" text-anchor="middle" font-size="10" [attr.fill]="darkFor(s.occupancy)">{{ s.occupancy }}% · {{ s.present | number }}</text>
              </ng-container>
              <ng-container *ngSwitchCase="'grand'">
                <ellipse cx="280" cy="455" rx="128" ry="40" [attr.fill]="colorFor(s.occupancy)" opacity=".84" style="cursor:pointer"
                  (mousemove)="showTip($event,s)" (mouseleave)="hideTip()"/>
                <text x="280" y="449" text-anchor="middle" font-size="11" font-weight="600" [attr.fill]="darkFor(s.occupancy)">Grand Stand</text>
                <text x="280" y="464" text-anchor="middle" font-size="10" [attr.fill]="darkFor(s.occupancy)">{{ s.occupancy }}% · {{ s.present | number }}</text>
              </ng-container>
              <ng-container *ngSwitchCase="'sachin'">
                <ellipse cx="102" cy="190" rx="37" ry="92" [attr.fill]="colorFor(s.occupancy)" opacity=".8" style="cursor:pointer"
                  (mousemove)="showTip($event,s)" (mouseleave)="hideTip()"/>
                <text text-anchor="middle" font-size="10" font-weight="600" [attr.fill]="darkFor(s.occupancy)" transform="translate(102,190) rotate(-35)">
                  <tspan x="0" dy="-8">Sachin</tspan><tspan x="0" dy="13">Pavilion</tspan>
                </text>
                <text text-anchor="middle" font-size="10" [attr.fill]="darkFor(s.occupancy)" transform="translate(102,210) rotate(-35)">{{ s.occupancy }}%</text>
              </ng-container>
              <ng-container *ngSwitchCase="'gavaskar'">
                <ellipse cx="458" cy="190" rx="37" ry="92" [attr.fill]="colorFor(s.occupancy)" opacity=".8" style="cursor:pointer"
                  (mousemove)="showTip($event,s)" (mouseleave)="hideTip()"/>
                <text text-anchor="middle" font-size="10" font-weight="600" [attr.fill]="darkFor(s.occupancy)" transform="translate(458,190) rotate(35)">
                  <tspan x="0" dy="-8">Sunil</tspan><tspan x="0" dy="13">Gavaskar</tspan>
                </text>
                <text text-anchor="middle" font-size="10" [attr.fill]="darkFor(s.occupancy)" transform="translate(458,210) rotate(35)">{{ s.occupancy }}%</text>
              </ng-container>
              <ng-container *ngSwitchCase="'vij'">
                <ellipse cx="102" cy="370" rx="37" ry="92" [attr.fill]="colorFor(s.occupancy)" opacity=".8" style="cursor:pointer"
                  (mousemove)="showTip($event,s)" (mouseleave)="hideTip()"/>
                <text text-anchor="middle" font-size="10" font-weight="600" [attr.fill]="darkFor(s.occupancy)" transform="translate(102,370) rotate(35)">
                  <tspan x="0" dy="-8">Vijay</tspan><tspan x="0" dy="13">Merchant</tspan>
                </text>
                <text text-anchor="middle" font-size="10" [attr.fill]="darkFor(s.occupancy)" transform="translate(102,390) rotate(35)">{{ s.occupancy }}%</text>
              </ng-container>
              <ng-container *ngSwitchCase="'divecha'">
                <ellipse cx="458" cy="370" rx="37" ry="92" [attr.fill]="colorFor(s.occupancy)" opacity=".8" style="cursor:pointer"
                  (mousemove)="showTip($event,s)" (mouseleave)="hideTip()"/>
                <text text-anchor="middle" font-size="10" font-weight="600" [attr.fill]="darkFor(s.occupancy)" transform="translate(458,370) rotate(-35)">
                  <tspan x="0" dy="-8">Divesha</tspan><tspan x="0" dy="13">Stand</tspan>
                </text>
                <text text-anchor="middle" font-size="10" [attr.fill]="darkFor(s.occupancy)" transform="translate(458,390) rotate(-35)">{{ s.occupancy }}%</text>
              </ng-container>
              <ng-container *ngSwitchCase="'garware'">
                <ellipse cx="192" cy="126" rx="32" ry="24" [attr.fill]="colorFor(s.occupancy)" opacity=".8" style="cursor:pointer"
                  (mousemove)="showTip($event,s)" (mouseleave)="hideTip()"/>
                <text x="192" y="130" text-anchor="middle" font-size="9" font-weight="500" [attr.fill]="darkFor(s.occupancy)">Garware {{ s.occupancy }}%</text>
              </ng-container>
              <ng-container *ngSwitchCase="'mca'">
                <ellipse cx="368" cy="126" rx="32" ry="24" [attr.fill]="colorFor(s.occupancy)" opacity=".8" style="cursor:pointer"
                  (mousemove)="showTip($event,s)" (mouseleave)="hideTip()"/>
                <text x="368" y="130" text-anchor="middle" font-size="9" font-weight="500" [attr.fill]="darkFor(s.occupancy)">MCA {{ s.occupancy }}%</text>
              </ng-container>
            </ng-container>
          </ng-container>

          <!-- Pitch -->
          <ellipse cx="280" cy="280" rx="130" ry="112" fill="rgba(34,197,94,0.04)"/>
          <ellipse cx="280" cy="280" rx="85" ry="66" fill="rgba(34,197,94,0.09)"/>
          <rect x="258" y="248" width="44" height="64" rx="4" fill="rgba(74,222,128,0.18)" stroke="rgba(74,222,128,0.3)" stroke-width="0.5"/>
          <text x="280" y="283" text-anchor="middle" font-size="11" font-weight="600" fill="rgba(74,222,128,0.7)">PITCH</text>
          <line x1="280" y1="256" x2="280" y2="304" stroke="rgba(74,222,128,0.3)" stroke-width="0.5"/>

          <!-- Gates -->
          <ng-container *ngFor="let g of gates()">
            <ng-container [ngSwitch]="g.id">
              <ng-container *ngSwitchCase="'gate3'">
                <g style="cursor:pointer" (mousemove)="showGateTip($event,g)" (mouseleave)="hideTip()">
                  <circle cx="40" cy="280" r="17" [attr.fill]="gateFill(g.status)" [attr.stroke]="gateStroke(g.status)" stroke-width="1"/>
                  <text x="40" y="277" text-anchor="middle" font-size="8" font-weight="600" fill="#bfdbfe">GATE</text>
                  <text x="40" y="289" text-anchor="middle" font-size="11" font-weight="700" fill="#eff6ff">3</text>
                </g>
                <line x1="57" y1="280" x2="120" y2="280" [attr.stroke]="gateStroke(g.status)" stroke-width="0.8" stroke-dasharray="3,3" opacity=".4"/>
              </ng-container>
              <ng-container *ngSwitchCase="'gate4'">
                <g style="cursor:pointer" (mousemove)="showGateTip($event,g)" (mouseleave)="hideTip()">
                  <circle cx="194" cy="42" r="17" [attr.fill]="gateFill(g.status)" [attr.stroke]="gateStroke(g.status)" stroke-width="1"/>
                  <text x="194" y="39" text-anchor="middle" font-size="8" font-weight="600" fill="#bfdbfe">GATE</text>
                  <text x="194" y="51" text-anchor="middle" font-size="11" font-weight="700" fill="#eff6ff">4</text>
                </g>
                <line x1="200" y1="59" x2="218" y2="118" [attr.stroke]="gateStroke(g.status)" stroke-width="0.8" stroke-dasharray="3,3" opacity=".4"/>
              </ng-container>
              <ng-container *ngSwitchCase="'gate5'">
                <g style="cursor:pointer" (mousemove)="showGateTip($event,g)" (mouseleave)="hideTip()">
                  <circle cx="520" cy="140" r="17" [attr.fill]="gateFill(g.status)" [attr.stroke]="gateStroke(g.status)" stroke-width="1"/>
                  <text x="520" y="137" text-anchor="middle" font-size="8" font-weight="600" fill="#bfdbfe">GATE</text>
                  <text x="520" y="149" text-anchor="middle" font-size="11" font-weight="700" fill="#eff6ff">5</text>
                </g>
                <line x1="503" y1="144" x2="460" y2="170" [attr.stroke]="gateStroke(g.status)" stroke-width="0.8" stroke-dasharray="3,3" opacity=".4"/>
              </ng-container>
              <ng-container *ngSwitchCase="'gate6'">
                <g style="cursor:pointer" (mousemove)="showGateTip($event,g)" (mouseleave)="hideTip()">
                  <circle cx="520" cy="370" r="17" [attr.fill]="gateFill(g.status)" [attr.stroke]="gateStroke(g.status)" stroke-width="1"/>
                  <text x="520" y="367" text-anchor="middle" font-size="8" font-weight="600" fill="#fef3c7">GATE</text>
                  <text x="520" y="379" text-anchor="middle" font-size="11" font-weight="700" fill="#fffbeb">6</text>
                </g>
                <line x1="503" y1="368" x2="460" y2="362" [attr.stroke]="gateStroke(g.status)" stroke-width="0.8" stroke-dasharray="3,3" opacity=".4"/>
              </ng-container>
              <ng-container *ngSwitchCase="'gate7'">
                <g style="cursor:pointer" (mousemove)="showGateTip($event,g)" (mouseleave)="hideTip()">
                  <circle cx="280" cy="520" r="17" [attr.fill]="gateFill(g.status)" [attr.stroke]="gateStroke(g.status)" stroke-width="1"/>
                  <text x="280" y="517" text-anchor="middle" font-size="8" font-weight="600" fill="#fecaca">GATE</text>
                  <text x="280" y="529" text-anchor="middle" font-size="11" font-weight="700" fill="#fee2e2">7</text>
                </g>
                <line x1="280" y1="503" x2="280" y2="470" [attr.stroke]="gateStroke(g.status)" stroke-width="0.8" stroke-dasharray="3,3" opacity=".4"/>
              </ng-container>
            </ng-container>
          </ng-container>

          <text x="10" y="290" font-size="8" fill="#374151" transform="rotate(-90,10,290)">Marine Drive</text>
          <text x="550" y="290" font-size="8" fill="#374151" transform="rotate(90,550,290)">Eastern Railways</text>
          <text x="280" y="16" text-anchor="middle" font-size="8" fill="#374151">Chowk</text>
        </svg>
      </div>

      <!-- Google Maps container -->
      <div class="stadium-wrap" *ngIf="useGoogleMaps">
        <div #mapContainer id="google-map-container" style="width:100%;height:100%;border-radius:8px;">
          <div class="map-placeholder">
            <p>🗺 Google Maps</p>
            <p style="font-size:12px;color:#64748b;margin-top:6px">Add your Maps API key in environment.ts to enable live satellite view with HeatmapLayer</p>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT: STAND BREAKDOWN -->
    <div class="side-panel-wrap">
      <div class="panel">
        <div class="panel-title">Zone occupancy</div>
        <div *ngFor="let s of stands()" class="stand-card">
          <div class="sc-head">
            <span class="sc-name">{{ s.name }}</span>
            <span class="badge" [ngClass]="'b-'+badgeClass(s.occupancy)">{{ s.occupancy }}%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" [style.width.%]="s.occupancy" [style.background]="colorFor(s.occupancy)"></div>
          </div>
          <div class="sc-meta">
            <span>{{ s.present | number }} present</span>
            <span>{{ s.sections }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    * { box-sizing: border-box; }
    .hm-wrap { display: flex; flex-direction: column; gap: 16px; height: 100%; }
    .metrics-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
    .metric-card { background: #111318; border: 1px solid rgba(255,255,255,.07); border-radius: 10px; padding: 14px 16px; }
    .metric-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
    .metric-val { font-size: 24px; font-weight: 600; letter-spacing: -.5px; line-height: 1; margin-bottom: 4px; }
    .metric-val.small { font-size: 13px; margin-top: 4px; }
    .metric-sub { font-size: 11px; color: #334155; }
    .badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
    .b-ok { background: rgba(34,197,94,.1); color: #22c55e; border: 1px solid rgba(34,197,94,.2); }
    .b-warn { background: rgba(245,158,11,.1); color: #f59e0b; border: 1px solid rgba(245,158,11,.2); }
    .b-crit { background: rgba(239,68,68,.1); color: #ef4444; border: 1px solid rgba(239,68,68,.2); }
    .b-info { background: rgba(59,130,246,.1); color: #3b82f6; border: 1px solid rgba(59,130,246,.2); }
    .ops-split { display: grid; grid-template-columns: 1fr 300px; gap: 16px; flex: 1; min-height: 0; }
    .map-panel { background: #111318; border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; min-height: 500px; position: relative; }
    .legend { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
    .leg { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #64748b; }
    .leg-dot { width: 10px; height: 10px; border-radius: 3px; }
    .toggle-map-btn { margin-left: auto; font-size: 11px; padding: 4px 10px; background: rgba(59,130,246,.1); border: 1px solid rgba(59,130,246,.2); border-radius: 6px; color: #3b82f6; cursor: pointer; font-family: inherit; }
    .toggle-map-btn:hover { background: rgba(59,130,246,.2); }
    .stadium-wrap { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; }
    .map-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 300px; background: rgba(255,255,255,.02); border-radius: 8px; border: 1px dashed rgba(255,255,255,.08); text-align: center; color: #64748b; font-size: 18px; }
    .tooltip-box { position: absolute; background: #1e2330; border: 1px solid rgba(255,255,255,.12); border-radius: 8px; padding: 10px 12px; font-size: 12px; pointer-events: none; z-index: 10; min-width: 150px; display: flex; flex-direction: column; gap: 3px; }
    .tooltip-box strong { font-size: 13px; font-weight: 600; color: #fff; }
    .tooltip-box span { color: #94a3b8; }
    .side-panel-wrap { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
    .panel { background: #111318; border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 14px; }
    .panel-title { font-size: 10px; font-weight: 600; color: #334155; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 12px; }
    .stand-card { background: #181c23; border: 1px solid rgba(255,255,255,.05); border-radius: 8px; padding: 9px 11px; margin-bottom: 7px; }
    .stand-card:last-child { margin-bottom: 0; }
    .sc-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .sc-name { font-size: 11px; font-weight: 500; }
    .bar-track { height: 5px; background: #0a0c0f; border-radius: 3px; overflow: hidden; margin-bottom: 5px; }
    .bar-fill { height: 100%; border-radius: 3px; transition: width .6s ease, background .4s; }
    .sc-meta { display: flex; justify-content: space-between; font-size: 10px; color: #334155; }
  `]
})
export class HeatmapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer') mapContainerRef!: ElementRef;

  private fb = inject(FirebaseService);
  stands = signal<Stand[]>([]);
  gates = signal<Gate[]>([]);
  snap = signal<StadiumSnapshot | null>(null);

  tooltipVisible = false;
  ttX = 0; ttY = 0; ttName = ''; ttPct = 0; ttPresent = 0; ttCap = 0;
  useGoogleMaps = false;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(this.fb.getStands$().subscribe(s => this.stands.set(s)));
    this.subs.push(this.fb.getGates$().subscribe(g => this.gates.set(g)));
    this.subs.push(this.fb.getSnapshot$().subscribe(s => this.snap.set(s)));
  }

  ngAfterViewInit(): void {
    if (this.useGoogleMaps) this.initGoogleMap();
  }

  toggleMapMode(): void {
    this.useGoogleMaps = !this.useGoogleMaps;
    if (this.useGoogleMaps) {
      setTimeout(() => this.initGoogleMap(), 100);
    }
  }

  private initGoogleMap(): void {
    const key = environment.googleMapsApiKey;
    if (key === 'YOUR_GOOGLE_MAPS_API_KEY') return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=visualization&callback=initMap`;
    script.async = true;
    (window as any)['initMap'] = () => this.buildMap();
    document.head.appendChild(script);
  }

  private buildMap(): void {
    const el = this.mapContainerRef?.nativeElement;
    if (!el || !(window as any)['google']) return;
    const g = (window as any)['google'];
    const center = { lat: 18.9388, lng: 72.8258 };
    const map = new g.maps.Map(el, { zoom: 18, center, mapTypeId: 'satellite', disableDefaultUI: true, tilt: 0 });

    const makeArc = (startA: number, endA: number, innerR: number, outerR: number) => {
      const pts: any[] = []; const steps = 15;
      const endAdj = endA < startA ? endA + 360 : endA;
      const delta = endAdj - startA;
      for (let i = 0; i <= steps; i++) {
        const rad = (startA + delta * (i / steps)) * Math.PI / 180;
        pts.push({ lat: 18.9388 - outerR * Math.sin(rad), lng: 72.8258 + outerR * Math.cos(rad) * 1.05 });
      }
      for (let i = steps; i >= 0; i--) {
        const rad = (startA + delta * (i / steps)) * Math.PI / 180;
        pts.push({ lat: 18.9388 - innerR * Math.sin(rad), lng: 72.8258 + innerR * Math.cos(rad) * 1.05 });
      }
      return pts;
    };

    const R_IN = 0.0005, R_OUT = 0.0010;
    const style = { strokeColor: '#ef4444', strokeOpacity: .8, strokeWeight: 2, fillColor: '#ef4444', fillOpacity: .05, map };
    [
      [180, 270], [270, 330], [330, 30], [150, 210], [90, 150], [30, 90]
    ].forEach(([s, e]) => new g.maps.Polygon({ ...style, paths: makeArc(s, e, R_IN, R_OUT) }));

    // Build heatmap layer from stand data
    const hmPts: any[] = [];
    const stands = this.stands();
    const standAngles: Record<string, [number, number, number]> = {
      north: [270, 330, 0.00075], grand: [60, 120, 0.0006],
      sachin: [180, 270, 0.00075], gavaskar: [330, 30, 0.00075],
      vij: [150, 210, 0.00075], divecha: [30, 90, 0.00075]
    };
    stands.forEach(s => {
      const ang = standAngles[s.id];
      if (!ang) return;
      const [sa, ea, r] = ang;
      const endAdj = ea < sa ? ea + 360 : ea;
      const delta = endAdj - sa;
      for (let i = 1; i <= 3; i++) {
        const rad = (sa + delta * (i / 4)) * Math.PI / 180;
        hmPts.push({ location: new g.maps.LatLng(18.9388 - r * Math.sin(rad), 72.8258 + r * Math.cos(rad) * 1.05), weight: s.occupancy / 100 * 3 });
      }
    });

    new g.maps.visualization.HeatmapLayer({
      data: hmPts, map, radius: 35, opacity: 0.8,
      gradient: ['rgba(0,255,255,0)','rgba(0,255,255,1)','rgba(0,127,255,1)','rgba(0,0,255,1)','rgba(127,0,63,1)','rgba(255,0,0,1)']
    });
  }

  colorFor(pct: number): string { return pct >= 81 ? '#ef4444' : pct >= 65 ? '#f59e0b' : '#22c55e'; }
  darkFor(pct: number): string { return pct >= 81 ? '#7f1d1d' : pct >= 65 ? '#78350f' : '#14532d'; }
  badgeClass(pct: number): string { return pct >= 81 ? 'crit' : pct >= 65 ? 'warn' : 'ok'; }
  gateFill(s: string): string { return s === 'crit' ? '#991b1b' : s === 'warn' ? '#b45309' : '#1d4ed8'; }
  gateStroke(s: string): string { return s === 'crit' ? 'rgba(239,68,68,.4)' : s === 'warn' ? 'rgba(245,158,11,.4)' : 'rgba(59,130,246,.4)'; }

  occBadge(): string { const p = this.snap()?.occupancyPct ?? 0; return 'b-' + this.badgeClass(p); }
  occLabel(): string { const p = this.snap()?.occupancyPct ?? 0; return p >= 81 ? 'High' : p >= 65 ? 'Moderate' : 'Normal'; }

  showTip(e: MouseEvent, s: Stand): void {
    this.tooltipVisible = true; this.ttX = e.offsetX + 16; this.ttY = e.offsetY - 40;
    this.ttName = s.name; this.ttPct = s.occupancy; this.ttPresent = s.present; this.ttCap = s.capacity;
  }
  showGateTip(e: MouseEvent, g: Gate): void {
    this.tooltipVisible = true; this.ttX = e.offsetX + 16; this.ttY = e.offsetY - 40;
    this.ttName = g.label + ' — ' + g.location; this.ttPct = g.waitMinutes; this.ttPresent = g.flowRate; this.ttCap = 0;
  }
  hideTip(): void { this.tooltipVisible = false; }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
