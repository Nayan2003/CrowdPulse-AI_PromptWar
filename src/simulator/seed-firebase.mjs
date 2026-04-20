// src/simulator/seed-firebase.mjs
// Run with: node src/simulator/seed-firebase.mjs
// This pushes live simulated data to Firebase RTDB every 4.5 seconds.

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDcyNbwFv453bDI0mm4DREmon5MqBCsJeY",
  authDomain: "crowdpulse-ai-f3de5.firebaseapp.com",
  databaseURL: "https://crowdpulse-ai-f3de5-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "crowdpulse-ai-f3de5",
  storageBucket: "crowdpulse-ai-f3de5.firebasestorage.app",
  messagingSenderId: "937336493344",
  appId: "1:937336493344:web:07920adbc85ddbe61ab345"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

let gates = {
  gate3: { label:'Gate 3', location:'Marine Drive West', lat:18.9388, lng:72.8247, waitMinutes:3,  flowRate:12, status:'ok',   diverted:false },
  gate4: { label:'Gate 4', location:'Churchgate North',  lat:18.9399, lng:72.8258, waitMinutes:5,  flowRate:15, status:'ok',   diverted:false },
  gate5: { label:'Gate 5', location:'Ayakar East Upper', lat:18.9396, lng:72.8266, waitMinutes:4,  flowRate:18, status:'ok',   diverted:false },
  gate6: { label:'Gate 6', location:'Ayakar East Lower', lat:18.9380, lng:72.8266, waitMinutes:11, flowRate:35, status:'warn', diverted:false },
  gate7: { label:'Gate 7', location:'Chowk South',       lat:18.9377, lng:72.8258, waitMinutes:16, flowRate:45, status:'crit', diverted:true  }
};

let stands = {
  north:    { name:'North Stand',              sections:'G–Y',          occupancy:78, capacity:10950, present:8541, svgId:'s-north'    },
  grand:    { name:'Grand Stand',              sections:'Levels 1–4',   occupancy:91, capacity:6813,  present:6200, svgId:'s-grand'    },
  sachin:   { name:'Sachin Tendulkar Pavilion', sections:'A–Q',          occupancy:62, capacity:5500,  present:3410, svgId:'s-sachin'   },
  gavaskar: { name:'Sunil Gavaskar Pavilion',   sections:'A–L',          occupancy:88, capacity:5500,  present:4840, svgId:'s-gavaskar' },
  vij:      { name:'Vijay Merchant Pavilion',  sections:'B–L',          occupancy:75, capacity:5500,  present:4125, svgId:'s-vij'      },
  divecha:  { name:'Divesha Stand',            sections:'F–J',          occupancy:72, capacity:5500,  present:3960, svgId:'s-divecha'  },
  mca:      { name:'MCA Pavilion',             sections:'Boxes',        occupancy:84, capacity:2500,  present:2100, svgId:'s-mca'      },
  garware:  { name:'Garware Pavilion',         sections:'Upper tier',   occupancy:58, capacity:2500,  present:1450, svgId:'s-garware'  }
};

let foodStalls = {
  burgerPoint: { name:'Burger Point',     zone:'North',  queueLength:45, waitMinutes:15, status:'crit' },
  coldDrinks:  { name:'Cold Drinks Bar',  zone:'East',   queueLength:12, waitMinutes:4,  status:'ok'   },
  pizzaHub:    { name:'Pizza Hub',        zone:'South',  queueLength:28, waitMinutes:9,  status:'warn' },
  snackBar:    { name:'Snack Bar',        zone:'West',   queueLength:5,  waitMinutes:2,  status:'ok'   },
  grandFnb:    { name:'Grand Stand F&B',  zone:'Grand',  queueLength:24, waitMinutes:14, status:'crit' },
  northKiosk:  { name:'North Kiosk A3',   zone:'North',  queueLength:7,  waitMinutes:4,  status:'ok'   },
  westMerch:   { name:'West Merchandise', zone:'West',   queueLength:3,  waitMinutes:2,  status:'ok'   }
};

const statusFromWait = w => w >= 15 ? 'crit' : w >= 8 ? 'warn' : 'ok';

async function seedIfEmpty() {
  const snap = await get(ref(db, 'gates'));
  if (snap.val()) { console.log('✅ DB already seeded.'); return; }
  await Promise.all([
    set(ref(db, 'gates'), gates),
    set(ref(db, 'stands'), stands),
    set(ref(db, 'foodStalls'), foodStalls)
  ]);
  await push(ref(db, 'alerts'), { title:'Simulator started', body:'CrowdPulse-AI Node.js simulator seeded Firebase.', severity:'info', timestamp: Date.now() });
  console.log('🌱 Firebase database seeded with initial data.');
}

function tickGates() {
  Object.keys(gates).forEach(k => {
    const g = gates[k];
    g.waitMinutes = clamp(g.waitMinutes + Math.floor(Math.random()*5)-2, 1, 30);
    g.flowRate    = clamp(g.flowRate    + Math.floor(Math.random()*6)-3, 1, 60);
    g.status      = statusFromWait(g.waitMinutes);
    g.diverted    = g.status === 'crit';
  });
  set(ref(db, 'gates'), gates);
}

function tickStands() {
  let total = 0;
  Object.keys(stands).forEach(k => {
    const s = stands[k];
    s.occupancy = clamp(s.occupancy + Math.floor(Math.random()*7)-3, 30, 99);
    s.present   = Math.round(s.occupancy / 100 * s.capacity);
    total += s.present;
  });
  set(ref(db, 'stands'), stands);
  const occ = Math.round(total / 45000 * 100);
  const busiest = Object.values(stands).reduce((a, b) => a.occupancy > b.occupancy ? a : b);
  const activeAlerts = Object.values(stands).filter(s => s.occupancy >= 81).length;
  set(ref(db, 'snapshot'), { totalAttendance: total, occupancyPct: occ, busiestStand: busiest.name, busiestPct: busiest.occupancy, activeAlerts, lastUpdated: Date.now() });
}

function tickFood() {
  Object.keys(foodStalls).forEach(k => {
    const f = foodStalls[k];
    f.queueLength  = clamp(f.queueLength + Math.floor(Math.random()*9)-4, 0, 80);
    f.waitMinutes  = clamp(Math.round(f.queueLength / 3), 1, 30);
    f.status       = f.waitMinutes >= 12 ? 'crit' : f.waitMinutes >= 7 ? 'warn' : 'ok';
  });
  set(ref(db, 'foodStalls'), foodStalls);
}

const aiAlerts = [
  { title:'Crowd buildup detected',      body:'AI model flagged density spike near North Gate.',         severity:'warn' },
  { title:'Gate 7 queue critical',       body:'Queue exceeding threshold. Aux lane recommended.',        severity:'crit' },
  { title:'Food throughput drop',        body:'Burger Point throughput -40%. Staff reallocation needed.',severity:'warn' },
  { title:'Concourse flow normalised',   body:'South Pavilion density returned to normal range.',        severity:'info' },
  { title:'Halftime surge predicted',    body:'AI predicts 12% attendance surge in 8 min.',              severity:'warn' },
  { title:'Heatmap red-zone alert',      body:'Grand Stand >90% capacity. Immediate review needed.',     severity:'crit' },
  { title:'IoT heartbeat OK',            body:'All edge sensor nodes reporting nominal status.',          severity:'info' }
];

function maybeAlert() {
  if (Math.random() < 0.35) {
    const a = aiAlerts[Math.floor(Math.random() * aiAlerts.length)];
    push(ref(db, 'alerts'), { ...a, timestamp: Date.now() });
  }
}

console.log('🚀 CrowdPulse-AI Firebase Simulator starting...');
console.log('📡 RTDB:', firebaseConfig.databaseURL);
console.log('Press Ctrl+C to stop.\n');

await seedIfEmpty();

setInterval(tickGates,  4500);
setInterval(tickStands, 6000);
setInterval(tickFood,   5000);
setInterval(maybeAlert, 8000);

console.log('🟢 Simulator running — pushing live data to Firebase every few seconds.');
