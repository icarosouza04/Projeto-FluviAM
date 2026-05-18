import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Lora:ital,wght@0,500;0,600;1,400;1,500&family=DM+Mono:wght@400;500&display=swap');

:root {
  --bg:      #EEF3F1;
  --surface: #FFFFFF;
  --surf2:   #E7EFEB;
  --border:  rgba(16,35,31,0.10);
  --bordm:   rgba(16,35,31,0.18);
  --text:    #10231F;
  --muted:   #5F6E68;
  --faint:   #96A39D;
  --teal:    #007D6E;
  --tealL:   #DDF5EF;
  --amber:   #B86812;
  --amberL:  #FFF1D9;
  --red:     #B8322A;
  --redL:    #FFE7E4;
  --green:   #277A43;
  --navy:    #174D6D;
  --navyL:   #E0EEF6;
  --sid:     #0F251F;
  --sid2:    #17372F;
  --r: 14px;
}
[data-theme=dark]{
  --bg:      #08110F;
  --surface: #111D1A;
  --surf2:   #182A25;
  --border:  rgba(255,255,255,0.08);
  --bordm:   rgba(255,255,255,0.16);
  --text:    #EFF7F3;
  --muted:   #A2B0AA;
  --faint:   #65756F;
  --teal:    #48D0B8;
  --tealL:   rgba(72,208,184,0.14);
  --amber:   #F2A93B;
  --amberL:  rgba(242,169,59,0.16);
  --red:     #FF7164;
  --redL:    rgba(255,113,100,0.13);
  --green:   #65D184;
  --navy:    #75BCE2;
  --navyL:   rgba(117,188,226,0.14);
  --sid:     #07100E;
  --sid2:    #0D1B18;
}

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  font-family:'Outfit',system-ui,sans-serif;
  font-size:15px;line-height:1.6;
  background:var(--bg);color:var(--text);
  -webkit-font-smoothing:antialiased;
  transition:background .2s,color .2s;
}

/* ══ SPLASH ══ */
.splash{
  position:fixed;inset:0;z-index:9999;
  background:#1A1208;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  gap:28px;
  transition:opacity .9s cubic-bezier(.4,0,.2,1), visibility .9s;
}
.splash.hide{ opacity:0; visibility:hidden; pointer-events:none; }
.splash-inner{
  display:flex;flex-direction:column;align-items:center;gap:20px;
  animation:splashReveal 1s cubic-bezier(.16,1,.3,1) both;
}
@keyframes splashReveal{
  from{opacity:0;transform:translateY(24px)}
  to{opacity:1;transform:translateY(0)}
}
.bzr-w1{stroke-dasharray:340;stroke-dashoffset:340;animation:flowWave 1.6s cubic-bezier(.4,0,.2,1) .1s forwards}
.bzr-w2{stroke-dasharray:300;stroke-dashoffset:300;animation:flowWave 1.8s cubic-bezier(.4,0,.2,1) .3s forwards}
.bzr-w3{stroke-dasharray:260;stroke-dashoffset:260;animation:flowWave 2s cubic-bezier(.4,0,.2,1) .55s forwards}
.bzr-w4{stroke-dasharray:220;stroke-dashoffset:220;animation:flowWave 2.1s cubic-bezier(.4,0,.2,1) .75s forwards}
.bzr-w5{stroke-dasharray:190;stroke-dashoffset:190;animation:flowWave 2.2s cubic-bezier(.4,0,.2,1) .95s forwards}
.bzr-loop{stroke-dasharray:190;stroke-dashoffset:190;animation:flowWave 1.4s cubic-bezier(.4,0,.2,1) 0s forwards}
.bzr-dot{r:0;animation:popDot .5s cubic-bezier(.34,1.56,.64,1) 1.3s forwards}
.bzr-dot-in{r:0;animation:popDotIn .5s cubic-bezier(.34,1.56,.64,1) 1.45s forwards}
.bzr-name{opacity:0;animation:nameReveal .6s ease 1.5s forwards}
@keyframes flowWave{to{stroke-dashoffset:0}}
@keyframes popDot{to{r:8}}
@keyframes popDotIn{to{r:4}}
@keyframes nameReveal{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.splash-tagline{
  font-size:10px;letter-spacing:.22em;text-transform:uppercase;
  color:rgba(237,233,225,.2);
  font-family:'DM Mono',monospace;
  text-align:center;
  opacity:0;animation:nameReveal .5s ease 2s forwards;
}
.splash-bar{
  width:120px;height:1.5px;
  background:rgba(255,255,255,.06);
  border-radius:99px;overflow:hidden;
  opacity:0;animation:nameReveal .4s ease 1.8s forwards;
}
.splash-bar-fill{
  height:100%;width:0%;
  background:linear-gradient(90deg,#1B7C6C,#C47A1E);
  border-radius:99px;
  animation:splashLoad 2s .5s cubic-bezier(.4,0,.2,1) forwards;
}
@keyframes splashLoad{to{width:100%}}

/* ══ SHELL ══ */
.shell{display:flex;height:100vh;overflow:hidden}

/* SIDEBAR */
.sidebar{
  width:244px;flex-shrink:0;
  background:var(--sid);
  display:flex;flex-direction:column;
  border-right:1px solid rgba(255,255,255,.04);
  overflow:hidden;
  transition:width .25s cubic-bezier(.4,0,.2,1);
}
.sidebar.closed{width:0}
.sid-logo{
  padding:20px 18px 16px;
  border-bottom:1px solid rgba(255,255,255,.05);
  display:flex;align-items:center;gap:10px;flex-shrink:0;
  cursor:pointer;
}
.sid-logo:hover .sid-bzr-wrap{ filter:brightness(1.15); }
.sid-bzr-wrap{ flex-shrink:0; transition:filter .2s; }
.sid-name{ display:flex;flex-direction:column;gap:2px; min-width:0; }
.sid-wordmark{
  font-family:'Lora',Georgia,serif;
  font-size:20px;font-weight:600;letter-spacing:.01em;
  color:#EDE9E1;white-space:nowrap;line-height:1;
}
.sid-wordmark .sw{color:#C47A1E;font-style:italic;font-weight:500}
.sid-wordmark .sb{color:#3DB89A}
.sid-sub{font-size:10px;color:rgba(255,255,255,.32);text-transform:uppercase;letter-spacing:.08em;font-family:'DM Mono',monospace}

.sid-sec{padding:16px 12px 6px}
.sid-sec-lbl{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.28);padding:0 6px;margin-bottom:4px}
.nav-btn{
  display:flex;align-items:center;gap:9px;
  padding:10px 12px;border-radius:10px;
  color:rgba(255,255,255,.56);font-size:14px;
  cursor:pointer;transition:all .15s;
  margin-bottom:1px;white-space:nowrap;
  border:none;background:transparent;width:100%;font-family:inherit;text-align:left;
}
.nav-btn:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.65)}
.nav-btn.active{background:rgba(61,184,154,.12);color:#5DD5C4}
.nav-ico{width:17px;height:17px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.nav-badge{
  margin-left:auto;background:var(--red);color:#fff;
  font-size:9px;font-weight:600;padding:1px 5px;border-radius:99px;min-width:16px;text-align:center;
}
.sid-footer{
  margin-top:auto;padding:12px 10px;
  border-top:1px solid rgba(255,255,255,.05);flex-shrink:0;
}
.sid-status{
  display:flex;align-items:center;gap:8px;
  padding:7px 10px;background:rgba(255,255,255,.03);border-radius:6px;
}
.s-dot{width:6px;height:6px;border-radius:50%;background:#3DB87C;animation:blink 2.5s ease infinite;flex-shrink:0}
.s-dot.off{background:var(--red);animation:none}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
.s-txt{font-size:11px;color:rgba(255,255,255,.3);white-space:nowrap}
.s-val{font-size:10px;color:rgba(255,255,255,.45);margin-left:auto;font-family:'DM Mono',monospace}

/* MAIN */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{
  background:var(--surface);border-bottom:1px solid var(--border);
  padding:12px 24px;display:flex;align-items:center;gap:12px;flex-shrink:0;
}
.menu-btn{
  width:30px;height:30px;border-radius:6px;
  border:1px solid var(--bordm);background:transparent;
  cursor:pointer;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:4px;flex-shrink:0;transition:background .15s;
}
.menu-btn:hover{background:var(--surf2)}
.menu-btn span{display:block;width:13px;height:1.5px;background:var(--text);border-radius:99px}
.topbar-info{flex:1;min-width:0}
.topbar-sub{font-size:13px;color:var(--muted)}
.topbar-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
.badge{font-size:11px;font-weight:500;padding:3px 9px;border-radius:99px;white-space:nowrap}
.b-red  {background:var(--redL);color:var(--red)}
.b-teal {background:var(--tealL);color:var(--teal)}
.b-amb  {background:var(--amberL);color:var(--amber)}
.b-navy {background:var(--navyL);color:var(--navy)}
.btn-sm{
  padding:8px 14px;border-radius:99px;
  border:1px solid var(--bordm);background:var(--surface);
  color:var(--muted);font-family:inherit;font-size:13px;
  cursor:pointer;transition:all .15s;white-space:nowrap;
}
.btn-sm:hover{background:var(--surf2);color:var(--text)}
.filtro-sel{
  background:var(--surface);border:1px solid var(--bordm);
  color:var(--text);padding:5px 11px;border-radius:99px;
  font-family:inherit;font-size:11px;cursor:pointer;outline:none;
}

.scroll{flex:1;overflow-y:auto;padding:24px 28px 68px;scrollbar-width:thin;scrollbar-color:var(--faint) transparent}

/* CITY TABS */
.city-tabs{
  display:flex;gap:0;overflow-x:auto;scrollbar-width:none;
  border-bottom:1px solid var(--border);margin-bottom:0;
}
.city-tabs::-webkit-scrollbar{display:none}
.c-tab{
  padding:9px 14px;border:none;border-bottom:2px solid transparent;
  background:transparent;font-family:inherit;font-size:12px;
  color:var(--muted);cursor:pointer;white-space:nowrap;
  transition:all .15s;display:flex;align-items:center;gap:5px;flex-shrink:0;
}
.c-tab:hover{color:var(--text)}
.c-tab.active{color:var(--text);border-bottom-color:var(--teal);font-weight:500}
.c-tab .cdot{width:5px;height:5px;border-radius:50%;background:var(--red);display:inline-block}

/* ══ ALERTA DINÂMICO ══ */
.al-bar{
  display:flex;align-items:flex-start;gap:10px;
  padding:10px 14px;border-radius:var(--r);
  border-left:3px solid var(--red);background:var(--redL);
  margin-bottom:16px;
}
.al-bar.warn{border-left-color:var(--amber);background:var(--amberL)}
.al-bar.atencao{border-left-color:var(--amber);background:var(--amberL)}
.al-ico{font-size:13px;flex-shrink:0;margin-top:1px}
.al-ttl{font-size:12px;font-weight:500;color:var(--red);margin-bottom:2px}
.al-bar.warn .al-ttl,.al-bar.atencao .al-ttl{color:var(--amber)}
.al-dsc{font-size:11px;color:var(--muted);line-height:1.5}

.filtro-row{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.filtro-lbl{font-size:11px;color:var(--muted)}
.painel-filtros{
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r);padding:10px 12px;margin:12px 0 16px;
}
.painel-filtros .pf-spacer{flex:1;min-width:12px}
.pf-count{font-size:11px;color:var(--muted);font-family:'DM Mono',monospace;white-space:nowrap}

/* UPDATE BAR */
.update-bar{
  display:flex;align-items:center;gap:0;
  background:var(--surface);
  border-bottom:1px solid var(--border);
  margin-bottom:16px;
  flex-wrap:wrap;
  padding:0;
}
.update-bar-inner{
  display:flex;align-items:center;gap:12px;
  padding:8px 16px;
  flex:1;flex-wrap:wrap;
}
.update-bar .u-dot{width:6px;height:6px;border-radius:50%;background:var(--teal);animation:blink 2.5s ease infinite;flex-shrink:0}
.update-bar .u-item{font-size:11px;color:var(--text);display:flex;align-items:center;gap:5px}
.update-bar .u-sep{width:1px;height:14px;background:var(--border);flex-shrink:0}
.update-bar .u-label{font-size:9px;color:var(--muted);font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em}
.update-bar-right{
  padding:8px 16px;
  border-left:1px solid var(--border);
  display:flex;align-items:center;
  background:var(--surf2);
}

/* KPI GRID */
.kpi-grid{
  display:grid;grid-template-columns:repeat(4,1fr);
  background:var(--border);gap:1px;
  border:1px solid var(--border);border-radius:var(--r);
  overflow:hidden;margin-bottom:16px;
}
.kpi{background:var(--surface);padding:14px 16px}
.kpi-lbl{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:7px;font-family:'DM Mono',monospace}
.kpi-val{font-size:22px;font-weight:500;letter-spacing:-.03em;line-height:1;color:var(--text)}
.kpi-val.g{color:var(--teal)}
.kpi-val.w{color:var(--amber)}
.kpi-val.d{color:var(--red)}
.kpi-unit{font-size:10px;color:var(--faint);margin-top:4px;font-family:'DM Mono',monospace}

/* FONTE BADGE */
.fonte-badge{
  display:inline-flex;align-items:center;gap:4px;
  font-size:10px;padding:2px 8px;border-radius:99px;
  font-weight:500;margin-top:4px;
}
.fonte-sace{background:var(--tealL);color:var(--teal)}
.fonte-openmeteo{background:var(--amberL);color:var(--amber)}
.fonte-fallback{background:var(--redL);color:var(--red)}
.fonte-ana{background:var(--navyL);color:var(--navy)}

/* CHART GRID */
.chart-grid{display:grid;grid-template-columns:1fr 230px;gap:12px;margin-bottom:12px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:15px 17px}
.card-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px}
.card-ttl{font-size:12.5px;font-weight:500}
.card-sub{font-size:11px;color:var(--muted);margin-top:2px}
.chart-box{height:190px}

/* NIVEL */
.nivel{display:flex;flex-direction:column;gap:15px}
.n-lbl{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;font-family:'DM Mono',monospace}
.n-val{font-size:17px;font-weight:500;letter-spacing:-.02em}
.n-bar{height:3px;background:var(--surf2);border-radius:99px;margin-top:7px;overflow:hidden}
.n-fill{height:100%;border-radius:99px;transition:width 1.3s cubic-bezier(.4,0,.2,1)}
.n-fill.g{background:var(--teal)}.n-fill.w{background:var(--amber)}.n-fill.d{background:var(--red)}
.n-status{font-size:12px;font-weight:500;margin-top:3px}
.pico{display:flex;flex-direction:column;gap:11px}

/* TABELA */
.est-tbl{width:100%;border-collapse:collapse}
.est-tbl th{
  font-size:9px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);padding:9px 10px;text-align:left;
  border-bottom:2px solid var(--bordm);
  font-family:'DM Mono',monospace;font-weight:400;
  background:var(--surf2);
}
.est-tbl td{padding:9px 10px;border-bottom:1px solid var(--border);font-size:12px;vertical-align:middle}
.est-tbl tr:last-child td{border-bottom:none}
.est-tbl tbody tr:hover td{background:var(--surf2);cursor:pointer}
.tbl-dot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:7px;vertical-align:middle}

/* MAPA */
.mapa-shell{display:flex;flex-direction:column;height:100%}
.mapa-body{flex:1;position:relative;overflow:hidden}
.map-controls{position:absolute;top:14px;right:14px;z-index:1000;display:flex;flex-direction:column;gap:8px;}
.map-ctrl-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;box-shadow:0 4px 20px rgba(0,0,0,.12);min-width:140px;}
.map-ctrl-ttl{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;font-family:'DM Mono',monospace}
.layer-btn{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:5px;border:none;background:transparent;font-family:inherit;font-size:11px;color:var(--muted);cursor:pointer;width:100%;text-align:left;transition:all .12s;}
.layer-btn:hover{background:var(--surf2);color:var(--text)}
.layer-btn.active{background:var(--tealL);color:var(--teal);font-weight:500}
.layer-dot{width:8px;height:8px;border-radius:2px;flex-shrink:0}
.map-legend{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;box-shadow:0 4px 20px rgba(0,0,0,.12);}
.leg-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.leg-row:last-child{margin-bottom:0}
.leg-pulse{width:10px;height:10px;border-radius:50%;position:relative;flex-shrink:0;}
.leg-pulse::after{content:'';position:absolute;inset:-3px;border-radius:50%;opacity:.4;animation:pulse-leg 2.5s ease-out infinite;}
.leg-pulse.g{background:#1B7C6C}.leg-pulse.g::after{border:2px solid #1B7C6C}
.leg-pulse.w{background:#C47A1E}.leg-pulse.w::after{border:2px solid #C47A1E}
.leg-pulse.d{background:#C0392B}.leg-pulse.d::after{border:2px solid #C0392B}
@keyframes pulse-leg{0%{transform:scale(1);opacity:.4}100%{transform:scale(2.5);opacity:0}}
.leg-txt{font-size:11px;color:var(--text)}
.leg-sub{font-size:10px;color:var(--muted)}
@keyframes marker-pulse{0%{transform:scale(1);opacity:.6}50%{transform:scale(2.2);opacity:0}100%{transform:scale(1);opacity:0}}
.leaflet-tooltip.city-lbl{background:rgba(255,255,255,.92)!important;border:none!important;box-shadow:none!important;color:#1A1714;font-size:10px;font-weight:500;padding:2px 6px;border-radius:4px;font-family:'Outfit',sans-serif;}
.leaflet-tooltip.city-lbl::before{display:none!important}

/* ALERTAS */
.al-cards{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
.al-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background .15s;}
.al-card:hover{background:var(--surf2)}
.al-card-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.al-card-name{font-size:12.5px;font-weight:500}
.al-card-desc{font-size:11px;color:var(--muted);margin-top:1px}
.al-card-cota{font-family:'DM Mono',monospace;font-size:13px;text-align:right;flex-shrink:0}
.sec-ttl{font-size:15px;font-weight:500;letter-spacing:-.02em;margin-bottom:4px}
.sec-sub{font-size:12px;color:var(--muted);margin-bottom:18px}

/* DASHBOARD */
.analytics-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.analytics-wide{grid-column:1/-1}
.dash-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}
.dash-kpi{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;}
.dash-kpi-lbl{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;font-family:'DM Mono',monospace}
.dash-kpi-val{font-size:20px;font-weight:500;letter-spacing:-.03em}
.dash-kpi-sub{font-size:10px;color:var(--muted);margin-top:3px}

/* ══ TICKER ══ */
.ticker-outer{
  overflow:hidden;
  background:linear-gradient(90deg,rgba(0,125,110,.18),rgba(23,77,109,.16));
  border-top:1px solid rgba(255,255,255,.07);
  border-bottom:1px solid rgba(255,255,255,.05);
  padding:12px 0;
  position:relative;
  width:100%;
}
.ticker-outer::before,.ticker-outer::after{
  content:'';position:absolute;top:0;bottom:0;width:60px;z-index:2;pointer-events:none;
}
.ticker-outer::before{left:0;background:linear-gradient(90deg,rgba(15,37,31,1),transparent)}
.ticker-outer::after{right:0;background:linear-gradient(270deg,rgba(15,37,31,1),transparent)}
.ticker-track{
  display:flex;gap:0;
  animation:tickerScroll 145s linear infinite;
  width:max-content;
}
.ticker-outer:hover .ticker-track{animation-play-state:paused}
@keyframes tickerScroll{
  0%{transform:translateX(0)}
  100%{transform:translateX(-50%)}
}
.ticker-item{
  display:flex;align-items:center;gap:10px;
  padding:0 28px;
  cursor:pointer;
  transition:opacity .15s;
  white-space:nowrap;
  border-right:1px solid rgba(255,255,255,.06);
}
.ticker-item:hover{opacity:.7}
.ticker-name{font-size:12px;font-weight:500;color:rgba(237,233,225,.8);font-family:'DM Mono',monospace;letter-spacing:.04em}
.ticker-cota{font-size:14px;font-weight:500;font-family:'DM Mono',monospace}
.ticker-var{font-size:12px;font-family:'DM Mono',monospace}
.ticker-badge{
  font-size:9px;font-weight:600;padding:1px 6px;border-radius:99px;
  text-transform:uppercase;letter-spacing:.06em;
}
.ticker-sep{
  width:4px;height:4px;border-radius:50%;
  background:rgba(255,255,255,.15);flex-shrink:0;
}

/* ══ HOME ══ */
.home-page{
  flex:1;overflow-y:auto;background:var(--bg);
  scrollbar-width:thin;scrollbar-color:var(--faint) transparent;
}
.home-page::-webkit-scrollbar{width:5px}
.home-page::-webkit-scrollbar-track{background:transparent}
.home-page::-webkit-scrollbar-thumb{background:var(--faint);border-radius:99px}
.home-page::-webkit-scrollbar-thumb:hover{background:var(--muted)}

.home-hero{
  position:relative;
  background:linear-gradient(135deg,#0F251F 0%,#17372F 52%,#10231F 100%);
  padding:0;
  overflow:hidden;
  min-height:460px;
  display:flex;align-items:stretch;
  flex-direction:column;
}
.home-hero::after{
  content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(196,122,30,.3),transparent);
}
/* conteúdo principal do hero — layout lateral */
.home-hero-content{
  display:flex;align-items:stretch;flex:1;
}
.home-hero-left{
  flex:1;min-width:0;
  display:flex;flex-direction:column;
  justify-content:center;
  padding:58px 54px 54px 54px;
  position:relative;z-index:1;
  animation:homeReveal .8s cubic-bezier(.16,1,.3,1) both;
}
/* ══ HERO RIGHT — painel de estações em vez da logo ══ */
.home-hero-right{
  width:320px;flex-shrink:0;
  display:flex;flex-direction:column;
  justify-content:center;
  padding:32px 32px 32px 0;
  position:relative;z-index:1;
  animation:homeRevealRight 1s cubic-bezier(.16,1,.3,1) .15s both;
  gap:8px;
}
@keyframes homeReveal{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes homeRevealRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
.home-hero::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 70% 80% at 75% 50%, rgba(27,124,108,.08) 0%, transparent 65%);
  pointer-events:none;
}
.home-hero-divider{
  width:1px;background:rgba(255,255,255,.07);
  margin:40px 0;align-self:stretch;flex-shrink:0;
}

/* mini cards no hero right */
.hero-station-card{
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);
  border-radius:8px;
  padding:9px 12px;
  display:flex;align-items:center;gap:10px;
  cursor:pointer;
  transition:background .15s;
}
.hero-station-card:hover{background:rgba(255,255,255,.08)}
.hero-sc-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.hero-sc-name{font-size:13px;font-weight:500;color:rgba(237,233,225,.75);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hero-sc-cota{font-family:'DM Mono',monospace;font-size:14px;font-weight:500}
.hero-sc-var{font-family:'DM Mono',monospace;font-size:10px}

.home-eyebrow{
  font-size:9px;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(255,255,255,.3);font-family:'DM Mono',monospace;
  margin-bottom:16px;
}
.home-title{
  font-family:'Lora',Georgia,serif;
  font-size:46px;line-height:1.15;
  letter-spacing:-.01em;
  color:#EDE9E1;font-weight:600;
  margin-bottom:14px;
}
.home-title .ht-acc{color:#F2A93B;font-style:italic;font-weight:500}
.home-title .ht-teal{color:#48D0B8}
.home-desc{
  font-size:16px;line-height:1.75;
  color:rgba(237,233,225,.5);
  max-width:560px;
  margin-bottom:24px;
}
.home-cta-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:36px}
.home-cta-primary{
  padding:10px 20px;border-radius:99px;
  background:var(--teal);color:#fff;border:none;
  font-family:'Outfit',inherit;font-size:14px;font-weight:600;
  cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:7px;
}
.home-cta-primary:hover{background:#22937F;transform:translateY(-1px)}
.home-cta-secondary{
  padding:10px 20px;border-radius:99px;
  background:transparent;color:rgba(237,233,225,.55);
  border:1px solid rgba(255,255,255,.12);
  font-family:'Outfit',inherit;font-size:14px;cursor:pointer;transition:all .2s;
}
.home-cta-secondary:hover{border-color:rgba(255,255,255,.25);color:#EDE9E1}
.home-stats{
  display:grid;grid-template-columns:repeat(4,1fr);
  border-top:1px solid rgba(255,255,255,.07);
  padding-top:20px;gap:8px;
}
.home-stat-val{
  font-family:'DM Mono',monospace;
  font-size:24px;font-weight:600;color:#EDE9E1;
  letter-spacing:-.01em;line-height:1;margin-bottom:4px;
}
.home-stat-lbl{font-size:10px;color:rgba(255,255,255,.28);font-family:'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase}

.home-features{padding:34px 44px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.home-feat{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px 24px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;}
.home-feat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--feat-color, var(--teal));opacity:0;transition:opacity .2s;}
.home-feat:hover{transform:translateY(-2px);border-color:var(--bordm);}
.home-feat:hover::before{opacity:1}
.home-feat-ico{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;background:var(--feat-bg, var(--tealL));}
.home-feat-ico svg{width:15px;height:15px;fill:none;stroke:var(--feat-color, var(--teal));stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.home-feat-ttl{font-size:15px;font-weight:500;margin-bottom:5px}
.home-feat-dsc{font-size:13px;color:var(--muted);line-height:1.65}
.home-feat-link{font-size:13px;color:var(--feat-color, var(--teal));margin-top:10px;display:flex;align-items:center;gap:4px;font-weight:500;}
.home-about{margin:0 44px 40px;background:var(--surf2);border:1px solid var(--bordm);border-radius:18px;padding:30px 34px;display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:center;}
.home-about-ttl{font-family:'Lora',Georgia,serif;font-size:28px;letter-spacing:-.01em;margin-bottom:10px;font-weight:600;}
.home-about-txt{font-size:14px;color:var(--muted);line-height:1.8}
.home-about-right{display:flex;flex-direction:column;gap:8px}
.home-about-item{display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;font-size:13px;}
.hai-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.home-footer{padding:16px 40px 28px;text-align:center;border-top:1px solid var(--border);}


/* INFORMAÇÕES DO SISTEMA */
.info-page{display:flex;flex-direction:column;gap:18px;}
.info-hero{background:linear-gradient(135deg,var(--surface),var(--surf2));border:1px solid var(--border);border-radius:22px;padding:30px 34px;box-shadow:0 18px 40px rgba(16,35,31,.06);}
.info-kicker{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--teal);margin-bottom:10px;}
.info-title{font-family:'Lora',Georgia,serif;font-size:34px;line-height:1.15;font-weight:600;letter-spacing:-.02em;margin-bottom:12px;}
.info-text{font-size:15px;line-height:1.85;color:var(--muted);max-width:920px;}
.info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}
.info-item{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px 20px;display:flex;gap:12px;align-items:flex-start;transition:transform .16s,border-color .16s,box-shadow .16s;}
.info-item:hover{transform:translateY(-2px);border-color:var(--bordm);box-shadow:0 14px 28px rgba(16,35,31,.07);}
.info-dot{width:10px;height:10px;border-radius:50%;margin-top:7px;flex-shrink:0;}
.info-item-title{font-size:15px;font-weight:600;margin-bottom:4px;color:var(--text);}
.info-item-desc{font-size:13px;line-height:1.65;color:var(--muted);}
.info-status{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.info-status-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px 20px;}
.info-status-val{font-family:'DM Mono',monospace;font-size:24px;font-weight:600;color:var(--text);}
.info-status-lbl{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:5px;}


/* FONTES & APIs */
.integracoes-page{display:flex;flex-direction:column;gap:18px;}
.integracoes-hero{background:linear-gradient(135deg,var(--surface),var(--surf2));border:1px solid var(--border);border-radius:22px;padding:28px 32px;display:flex;justify-content:space-between;gap:18px;align-items:flex-start;box-shadow:0 18px 40px rgba(16,35,31,.06);}
.integracoes-hero h2{font-family:'Lora',Georgia,serif;font-size:34px;line-height:1.15;margin-bottom:8px;letter-spacing:-.02em;}
.integracoes-hero p{font-size:16px;color:var(--muted);line-height:1.75;max-width:800px;}
.integracoes-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;}
.integracoes-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.int-kpi{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:16px 18px;}
.int-kpi-val{font-size:28px;font-weight:700;letter-spacing:-.03em;}
.int-kpi-lbl{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-top:4px;}
.fontes-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;}
.fonte-card{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:18px 20px;display:flex;flex-direction:column;gap:10px;}
.fonte-card-top{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.fonte-nome{font-size:18px;font-weight:700;}
.fonte-desc{font-size:15px;color:var(--muted);line-height:1.65;}
.cred-chip{font-size:12px;font-weight:700;padding:4px 9px;border-radius:999px;white-space:nowrap;}
.cred-ok{background:var(--tealL);color:var(--teal);}
.cred-warn{background:var(--amberL);color:var(--amber);}
.cred-off{background:var(--redL);color:var(--red);}
.fonte-coleta{font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);background:var(--surf2);border-radius:10px;padding:8px 10px;}
.alertas-integrados{display:flex;flex-direction:column;gap:8px;}
.alerta-int-card{background:var(--surface);border:1px solid var(--border);border-left:4px solid var(--teal);border-radius:16px;padding:14px 16px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;}
.alerta-int-card.rank-2{border-left-color:var(--amber);}
.alerta-int-card.rank-3,.alerta-int-card.rank-4{border-left-color:var(--red);}
.alerta-int-title{font-size:16px;font-weight:700;margin-bottom:3px;}
.alerta-int-desc{font-size:14px;color:var(--muted);line-height:1.55;}
.alerta-int-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px;}
.meta-pill{font-size:12px;font-family:'DM Mono',monospace;padding:3px 8px;border-radius:99px;background:var(--surf2);color:var(--muted);}
.alerta-int-nivel{font-size:13px;font-weight:800;padding:6px 11px;border-radius:999px;background:var(--tealL);color:var(--teal);text-align:center;}
.alerta-int-nivel.rank-2{background:var(--amberL);color:var(--amber);}
.alerta-int-nivel.rank-3,.alerta-int-nivel.rank-4{background:var(--redL);color:var(--red);}

/* REDE */
.filtros-rede{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;}
.filtro-chip{
  padding:5px 13px;border-radius:99px;
  border:1px solid var(--bordm);background:transparent;
  font-family:inherit;font-size:13px;color:var(--muted);
  cursor:pointer;transition:all .15s;white-space:nowrap;
}
.filtro-chip:hover{color:var(--text);border-color:var(--text)}
.filtro-chip.ativo{background:var(--navy);color:#fff;border-color:var(--navy)}
.regiao-label{
  font-size:9px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--muted);font-family:'DM Mono',monospace;
  padding:12px 0 5px;margin-bottom:4px;border-bottom:1px solid var(--bordm);
  margin-top:8px;
}
.regiao-label:first-child{padding-top:0;margin-top:0}
.est-card-grid{display:flex;flex-direction:column;gap:2px;}
.est-row-card{
  display:grid;grid-template-columns:1fr 90px 90px 90px 80px 70px 72px;
  align-items:center;padding:10px 12px;
  background:var(--surface);border:1px solid var(--border);
  border-radius:6px;gap:8px;cursor:pointer;transition:background .12s;
}
.est-row-card:hover{background:var(--surf2)}
.est-row-hdr{
  display:grid;grid-template-columns:1fr 90px 90px 90px 80px 70px 72px;
  padding:9px 12px;gap:8px;
  background:var(--surf2);
  border:1px solid var(--bordm);
  border-radius:6px;
  margin-bottom:4px;
}
.est-row-hdr span{
  font-size:9px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--muted);font-family:'DM Mono',monospace;font-weight:400;
}
.est-num{font-family:'DM Mono',monospace;font-size:12px;text-align:right;}
.est-status-badge{
  font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;text-align:center;
}

/* LOG */
.log-page{}
.log-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.log-filters{display:flex;gap:8px;flex-wrap:wrap}
.log-entry{
  display:flex;gap:14px;padding:12px 16px;
  background:var(--surface);border:1px solid var(--border);
  border-radius:var(--r);margin-bottom:6px;
  transition:background .12s;
}
.log-entry:hover{background:var(--surf2)}
.log-entry.log-cache{
  border-left:3px solid var(--red);
  background:rgba(192,57,43,.03);
}
.log-entry.log-cache:hover{background:rgba(192,57,43,.06)}
.log-dot-wrap{display:flex;flex-direction:column;align-items:center;gap:0;flex-shrink:0;}
.log-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px;}
.log-dot.sace{background:var(--teal)}
.log-dot.openmeteo{background:var(--amber)}
.log-dot.fallback{background:var(--red)}
.log-dot.erro{background:var(--red)}
.log-content{flex:1;min-width:0}
.log-top{display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;}
.log-estacao{font-size:12.5px;font-weight:500}
.log-ts{font-size:10px;color:var(--muted);font-family:'DM Mono',monospace}
.log-detail{font-size:13px;color:var(--muted);line-height:1.55}
.log-detail.log-detail-erro{color:var(--red)}
.log-cota{font-family:'DM Mono',monospace;font-size:13px;flex-shrink:0;text-align:right;padding-top:2px}
.log-turno{
  font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  padding:2px 7px;border-radius:99px;flex-shrink:0;
}
.turno-manha{background:var(--amberL);color:var(--amber)}
.turno-tarde{background:var(--tealL);color:var(--teal)}
.turno-noite{background:var(--navyL);color:var(--navy)}
.log-summary-row{
  display:grid;grid-template-columns:repeat(4,1fr);gap:10px;
  margin-bottom:16px;
}
.log-sum-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;}
.log-sum-val{font-size:20px;font-weight:500;letter-spacing:-.02em;color:var(--text)}
.log-sum-lbl{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-family:'DM Mono',monospace;margin-top:4px;}
.log-sum-card.log-sum-alert{border-color:rgba(192,57,43,.3);background:rgba(192,57,43,.04)}

/* ESTADO */
.state{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:12px;color:var(--muted);text-align:center}
.spinner{width:22px;height:22px;border-radius:50%;border:2px solid var(--border);border-top-color:var(--teal);animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.footer{border-top:1px solid var(--border);padding:11px 22px;text-align:center;font-size:10px;color:var(--faint);font-family:'DM Mono',monospace;flex-shrink:0}


/* HOME LIMPA + MENU INICIAL */
.home-clean{background:var(--bg);}
.home-hero-minimal{
  min-height:auto;
  display:block;
  background:linear-gradient(135deg,#0F251F 0%,#17372F 52%,#10231F 100%);
}
.home-hero-minimal::before,
.home-hero-minimal::after{display:none;}
.home-menu-panel{
  margin:32px auto 42px;
  width:min(1180px, calc(100% - 48px));
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:24px;
  padding:30px;
  box-shadow:0 18px 50px rgba(16,35,31,.08);
}
.home-menu-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  margin-bottom:24px;
}
.home-menu-kicker{
  font-family:'DM Mono',monospace;
  font-size:13px;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--teal);
  margin-bottom:8px;
}
.home-menu-head h1{
  font-family:'Lora',Georgia,serif;
  font-size:34px;
  line-height:1.15;
  letter-spacing:-.02em;
  color:var(--text);
}
.home-menu-status{
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 14px;
  border-radius:999px;
  background:var(--tealL);
  color:var(--teal);
  font-weight:600;
  white-space:nowrap;
}
.home-menu-grid{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:16px;
}
.home-menu-card{
  text-align:left;
  border:1px solid var(--border);
  background:linear-gradient(180deg,var(--surface),var(--surf2));
  border-radius:18px;
  padding:22px;
  min-height:150px;
  display:flex;
  flex-direction:column;
  gap:10px;
  cursor:pointer;
  color:var(--text);
  font-family:inherit;
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
}
.home-menu-card:hover{
  transform:translateY(-3px);
  border-color:var(--teal);
  box-shadow:0 14px 32px rgba(16,35,31,.10);
}
.home-menu-card-title{
  font-size:20px;
  font-weight:700;
  letter-spacing:-.02em;
}
.home-menu-card-desc{
  font-size:16px;
  line-height:1.55;
  color:var(--muted);
  flex:1;
}
.home-menu-card-link{
  font-size:15px;
  font-weight:700;
  color:var(--teal);
}

/* TIPOGRAFIA MAIS LEGÍVEL */
body{font-size:16px;}
.sidebar{width:270px;}
.sid-logo{padding:22px 20px 18px;}
.sid-wordmark{font-size:23px;}
.sid-sub,.sid-sec-lbl{font-size:12px;}
.nav-btn{font-size:16px;padding:13px 14px;border-radius:12px;}
.nav-ico{width:19px;height:19px;}
.topbar{padding:16px 24px;}
.topbar-sub{font-size:15px;}
.badge{font-size:13px;padding:5px 12px;}
.btn-sm,.filtro-sel{font-size:15px;padding:9px 15px;}
.ticker-outer{padding:14px 0;}
.ticker-name{font-size:14px;}
.ticker-cota{font-size:17px;}
.ticker-var{font-size:14px;}
.ticker-badge{font-size:11px;padding:2px 8px;}
.sec-ttl{font-size:20px;}
.sec-sub{font-size:15px;}
.al-ttl,.al-card-name{font-size:15px;}
.al-dsc,.al-card-desc{font-size:14px;}
.kpi-lbl,.dash-kpi-lbl,.log-sum-lbl{font-size:12px;}
.kpi-val{font-size:30px;}
.dash-kpi-val,.log-sum-val{font-size:26px;}
.tbl th{font-size:13px;}
.tbl td{font-size:15px;}
.info-title{font-size:38px;}
.info-text{font-size:17px;}
.info-item-title{font-size:18px;}
.info-item-text{font-size:16px;}
.footer{
  padding:15px 22px;
  font-size:13px;
  color:var(--muted);
  letter-spacing:.02em;
}

@media(max-width:1180px){
  .home-menu-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
  .chart-grid{grid-template-columns:1fr}
  .analytics-grid{grid-template-columns:1fr}
  .home-features{grid-template-columns:repeat(2,1fr)}
  .info-grid{grid-template-columns:1fr}
}
@media(max-width:900px){
  .integracoes-hero{flex-direction:column;padding:24px 22px}.integracoes-kpis{grid-template-columns:repeat(2,1fr)}.fontes-grid{grid-template-columns:1fr}
  .home-hero-content{flex-direction:column}
  .home-hero-right{width:100%;padding:0 24px 30px;flex-direction:row;flex-wrap:wrap}
  .hero-station-card{flex:1;min-width:160px}
  .home-hero-divider{display:none}
  .home-hero-left{padding:44px 26px 28px}
  .home-title{font-size:36px}
  .home-stats{grid-template-columns:1fr 1fr;gap:18px}
  .home-features{grid-template-columns:1fr 1fr;padding:28px 22px}
  .home-about{grid-template-columns:1fr;margin:0 22px 32px;padding:26px}
  .info-status{grid-template-columns:1fr 1fr}
  .kpi-grid{grid-template-columns:repeat(2,1fr)}
  .dash-kpi-row{grid-template-columns:1fr 1fr}
  .est-row-card,.est-row-hdr{grid-template-columns:1fr 80px 70px 60px}
  .est-row-card>*:nth-child(n+5),.est-row-hdr>*:nth-child(n+5){display:none}
}
@media(max-width:760px){
  .home-menu-panel{width:calc(100% - 28px);margin:20px auto 32px;padding:22px;border-radius:20px;}
  .home-menu-head{flex-direction:column;align-items:flex-start;}
  .home-menu-head h1{font-size:28px;}
  .home-menu-grid{grid-template-columns:1fr;}
  .home-menu-card{min-height:auto;padding:20px;}
  .shell{position:relative}
  .sidebar{position:fixed;inset:0 auto 0 0;width:270px;z-index:50;box-shadow:24px 0 60px rgba(0,0,0,.26);transform:translateX(0);transition:transform .25s cubic-bezier(.4,0,.2,1)}
  .sidebar.closed{width:270px;opacity:1;transform:translateX(-105%);pointer-events:none}
  .main{width:100%}
  .topbar{padding:10px 14px;gap:10px}
  .topbar-right{gap:6px;flex-wrap:wrap;justify-content:flex-end}
  .topbar-sub{font-size:12px}
  .scroll{padding:16px 14px 56px}
  .ticker-item{padding:0 18px}
  .home-features{grid-template-columns:1fr;padding:22px 16px}
  .home-about{margin:0 16px 28px;padding:22px}
  .info-hero{padding:24px 22px}.info-title{font-size:28px}.info-status{grid-template-columns:1fr}
  .footer{display:block}
}
@media(max-width:520px){
  .integracoes-kpis{grid-template-columns:1fr}.alerta-int-card{grid-template-columns:1fr}.integracoes-hero h2{font-size:28px}
  body{font-size:15px}
  .home-menu-panel{width:calc(100% - 20px);padding:18px;}
  .home-menu-card-title{font-size:19px;}
  .home-menu-card-desc{font-size:15px;}
  .ticker-item{padding:0 14px;}
  .ticker-name{font-size:13px;}
  .ticker-cota{font-size:15px;}
  .home-title{font-size:31px}
  .home-desc{font-size:14px}
  .home-cta-row{align-items:stretch}.home-cta-primary,.home-cta-secondary,.home-cta-row .btn-sm{width:100%;justify-content:center;text-align:center}
  .home-stats{grid-template-columns:1fr}
  .home-hero-right{flex-direction:column;padding:0 18px 24px}.hero-station-card{min-width:0;width:100%}
  .topbar-info{display:none}
  .kpi-grid,.dash-kpi-row,.log-summary-row{grid-template-columns:1fr}
  .est-row-card,.est-row-hdr{grid-template-columns:1fr 72px}
  .est-row-card>*:nth-child(n+3),.est-row-hdr>*:nth-child(n+3){display:none}
}
`;

/* ─── COMPONENTES LOGO ────────────────────────────────────────────────────── */
const BanzeiroWave = ({ width = 200, dark = true, className = '' }) => {
  const h = Math.round(width * 100 / 280);
  const amber = '#C4813A';
  const teal = '#1B7C6C';
  const tealLight = '#3DB89A';
  const loop = dark ? '#2a1c10' : '#8A7060';
  return (
    <svg width={width} height={h} viewBox="0 0 280 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path fill="none" stroke={loop} strokeWidth="5" strokeLinecap="round" d="M18,68 C10,52 8,36 18,26 C28,16 42,22 44,36 C46,50 34,60 28,52 C22,44 30,34 38,40"/>
      <path fill="none" stroke={amber} strokeWidth="3.5" strokeLinecap="round" d="M44,50 C60,36 72,64 88,50 C104,36 116,64 132,50 C148,36 160,64 176,50 C192,36 204,64 220,52 C236,40 248,60 260,52"/>
      <path fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" d="M44,58 C62,46 74,70 92,58 C110,46 122,70 140,58 C158,46 170,70 188,58 C206,46 218,66 236,58 C250,52 258,64 268,60"/>
      <path fill="none" stroke={amber} strokeWidth="2.5" strokeLinecap="round" opacity="0.45" d="M44,42 C58,30 68,54 84,42 C100,30 112,54 128,42 C144,30 156,54 172,44 C188,34 200,56 216,46 C228,38 244,50 258,44"/>
      <path fill="none" stroke={teal} strokeWidth="2" strokeLinecap="round" opacity="0.3" d="M50,66 C68,56 80,76 98,66 C116,56 128,76 146,66 C164,56 176,74 194,66 C210,58 224,70 240,64"/>
      <circle fill="none" stroke={tealLight} strokeWidth="3" cx="152" cy="50" r="7"/>
      <circle fill={amber} cx="152" cy="50" r="3.5"/>
    </svg>
  );
};

const LogoIcon = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 280 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="none" stroke="#2a1c10" strokeWidth="8" strokeLinecap="round" d="M18,68 C10,52 8,36 18,26 C28,16 42,22 44,36 C46,50 34,60 28,52 C22,44 30,34 38,40"/>
    <path fill="none" stroke="#C4813A" strokeWidth="7" strokeLinecap="round" d="M44,50 C60,36 72,64 88,50 C104,36 116,64 132,50 C148,36 160,64 176,50 C192,36 204,64 220,52"/>
    <path fill="none" stroke="#1B7C6C" strokeWidth="6" strokeLinecap="round" d="M44,58 C62,46 74,70 92,58 C110,46 122,70 140,58 C158,46 170,70 188,58"/>
    <circle fill="none" stroke="#3DB89A" strokeWidth="5" cx="152" cy="50" r="8"/>
    <circle fill="#C4813A" cx="152" cy="50" r="4"/>
  </svg>
);

/* ── Splash ───────────────────────────────────────────────────────────────── */
const SplashScreen = ({ onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2900);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="splash">
      <div className="splash-inner">
        <svg width="300" height="107" viewBox="0 0 280 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter:'drop-shadow(0 0 28px rgba(196,122,30,0.18))' }}>
          <path className="bzr-loop" fill="none" stroke="#2a1c10" strokeWidth="5" strokeLinecap="round" d="M18,68 C10,52 8,36 18,26 C28,16 42,22 44,36 C46,50 34,60 28,52 C22,44 30,34 38,40"/>
          <path className="bzr-w1" fill="none" stroke="#C4813A" strokeWidth="3.5" strokeLinecap="round" d="M44,50 C60,36 72,64 88,50 C104,36 116,64 132,50 C148,36 160,64 176,50 C192,36 204,64 220,52 C236,40 248,60 260,52"/>
          <path className="bzr-w2" fill="none" stroke="#533d0e" strokeWidth="3" strokeLinecap="round" d="M44,58 C62,46 74,70 92,58 C110,46 122,70 140,58 C158,46 170,70 188,58 C206,46 218,66 236,58 C250,52 258,64 268,60"/>
          <path className="bzr-w3" fill="none" stroke="#C4813A" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" d="M44,42 C58,30 68,54 84,42 C100,30 112,54 128,42 C144,30 156,54 172,44 C188,34 200,56 216,46 C228,38 244,50 258,44"/>
          <path className="bzr-w4" fill="none" stroke="#C4813A" strokeWidth="2" strokeLinecap="round" opacity="0.28" d="M50,66 C68,56 80,76 98,66 C116,56 128,76 146,66 C164,56 176,74 194,66 C210,58 224,70 240,64"/>
          <path className="bzr-w5" fill="none" stroke="#C4813A" strokeWidth="1.5" strokeLinecap="round" opacity="0.18" d="M50,36 C64,26 76,46 92,36 C108,26 120,46 136,38 C152,30 164,46 180,38"/>
          <circle className="bzr-dot" fill="none" stroke="#3DB89A" strokeWidth="3" cx="152" cy="50"/>
          <circle className="bzr-dot-in" fill="#C4813A" cx="152" cy="50"/>
        </svg>
        <svg width="210" height="58" viewBox="0 0 230 58" fill="none" className="bzr-name" xmlns="http://www.w3.org/2000/svg">
          <text y="48" fontFamily="'Lora', Georgia, 'Times New Roman', serif" fontSize="46">
            <tspan fill="#EDE9E1" fontWeight="600">Fl</tspan>
            <tspan fill="#EDE9E1" fontStyle="italic" fontWeight="500">u</tspan>
            <tspan fill="#EDE9E1" fontWeight="600">vi</tspan>
            <tspan fill="#C4813A" fontWeight="600">AM</tspan>
          </text>
        </svg>
        <div className="splash-tagline">Monitor Hidrológico · Bacia Amazônica</div>
        <div className="splash-bar"><div className="splash-bar-fill"/></div>
      </div>
    </div>
  );
};

/* ─── Config ──────────────────────────────────────────────────────────────── */
// ALERTAS_FIXOS REMOVIDO — alertas agora são dinâmicos via FloodAlert

const REGIOES = {
  "Alto Solimões":   ["Tabatinga", "Tefé", "Coari"],
  "Médio Solimões":  ["Manacapuru", "Iranduba", "Careiro da Várzea"],
  "Rio Negro":       ["Manaus", "Novo Airão", "Barcelos", "São Gabriel da Cachoeira"],
  "Baixo Amazonas":  ["Itacoatiara", "Parintins", "Óbidos", "Santarém", "Maués", "Borba"],
  "Rio Purus/Madeira": ["Lábrea", "Humaitá", "Manicoré", "Beruri"],
};

const CFG = {
  "Manaus":                    { lat:-3.10,  lon:-60.02, rio:"Rio Negro",      cota_alerta:29.00, cota_max:29.97, cota_emergencia:34.80 },
  "Manacapuru":                { lat:-3.31,  lon:-60.61, rio:"Rio Solimões",   cota_alerta:21.00, cota_max:23.50, cota_emergencia:25.20 },
  "Itacoatiara":               { lat:-3.14,  lon:-58.44, rio:"Rio Amazonas",   cota_alerta:14.00, cota_max:16.83, cota_emergencia:16.80 },
  "Tabatinga":                 { lat:-4.25,  lon:-69.94, rio:"Rio Solimões",   cota_alerta:11.00, cota_max:13.50, cota_emergencia:13.20 },
  "Óbidos":                    { lat:-1.92,  lon:-55.52, rio:"Rio Amazonas",   cota_alerta: 9.00, cota_max:11.20, cota_emergencia:10.80 },
  "Beruri":                    { lat:-3.90,  lon:-61.28, rio:"Rio Purus",      cota_alerta:13.50, cota_max:15.80, cota_emergencia:15.50 },
  "Parintins":                 { lat:-2.63,  lon:-56.74, rio:"Rio Amazonas",   cota_alerta:11.50, cota_max:13.80, cota_emergencia:13.80 },
  "Tefé":                      { lat:-3.37,  lon:-64.72, rio:"Rio Solimões",   cota_alerta:14.50, cota_max:17.50, cota_emergencia:17.40 },
  "Santarém":                  { lat:-2.44,  lon:-54.70, rio:"Rio Amazonas",   cota_alerta: 8.50, cota_max:10.50, cota_emergencia:10.20 },
  "Coari":                     { lat:-4.09,  lon:-63.14, rio:"Rio Solimões",   cota_alerta:14.00, cota_max:16.20, cota_emergencia:16.00 },
  "Barcelos":                  { lat:-0.98,  lon:-62.93, rio:"Rio Negro",      cota_alerta:13.50, cota_max:15.50, cota_emergencia:15.20 },
  "São Gabriel da Cachoeira":  { lat: 0.13,  lon:-67.09, rio:"Rio Negro",      cota_alerta:11.00, cota_max:12.50, cota_emergencia:12.20 },
  "Careiro da Várzea":         { lat:-3.74,  lon:-60.38, rio:"Rio Amazonas",   cota_alerta:28.50, cota_max:29.50, cota_emergencia:29.00 },
  "Iranduba":                  { lat:-3.28,  lon:-60.19, rio:"Rio Solimões",   cota_alerta:20.50, cota_max:22.80, cota_emergencia:22.50 },
  "Lábrea":                    { lat:-7.26,  lon:-64.80, rio:"Rio Purus",      cota_alerta:12.50, cota_max:14.50, cota_emergencia:14.20 },
  "Humaitá":                   { lat:-7.51,  lon:-63.02, rio:"Rio Madeira",    cota_alerta:11.50, cota_max:13.50, cota_emergencia:13.20 },
  "Manicoré":                  { lat:-5.81,  lon:-61.30, rio:"Rio Madeira",    cota_alerta:13.00, cota_max:15.00, cota_emergencia:14.70 },
  "Borba":                     { lat:-4.39,  lon:-59.60, rio:"Rio Madeira",    cota_alerta:14.00, cota_max:16.00, cota_emergencia:15.70 },
  "Novo Airão":                { lat:-2.63,  lon:-60.94, rio:"Rio Negro",      cota_alerta:20.00, cota_max:22.00, cota_emergencia:21.80 },
  "Maués":                     { lat:-3.38,  lon:-57.72, rio:"Rio Maués-Açu",  cota_alerta: 9.00, cota_max:10.80, cota_emergencia:10.50 },
};


// Cobertura ampliada: 62 municípios oficiais do Amazonas.
// Cotas dos municípios sem estação ANA/SACE mapeada operam como estimativa via Open-Meteo
// até vincular o código telemétrico oficial no backend.
const MUNICIPIOS_AMAZONAS = {
  "Alvarães": { lat:-3.22083, lon:-64.80417, rio:"Rede hidrográfica local", cota_alerta:10.50, cota_max:13.00, cota_emergencia:12.50 },
  "Amaturá": { lat:-3.37455, lon:-68.20053, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Anamã": { lat:-3.56697, lon:-61.39630, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Anori": { lat:-3.74603, lon:-61.65750, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Apuí": { lat:-7.19409, lon:-59.89600, rio:"Rio Madeira", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Atalaia do Norte": { lat:-4.37277, lon:-70.19190, rio:"Rio Javari", cota_alerta:10.50, cota_max:13.00, cota_emergencia:12.50 },
  "Autazes": { lat:-3.57972, lon:-59.13056, rio:"Rio Madeira", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Barcelos": { lat:-0.97400, lon:-62.92400, rio:"Rio Negro", cota_alerta:13.50, cota_max:15.50, cota_emergencia:15.20 },
  "Barreirinha": { lat:-2.79830, lon:-57.06790, rio:"Rio Amazonas", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Benjamin Constant": { lat:-4.38306, lon:-70.03111, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Beruri": { lat:-3.89874, lon:-61.37130, rio:"Rio Purus", cota_alerta:13.50, cota_max:15.80, cota_emergencia:15.50 },
  "Boa Vista do Ramos": { lat:-2.97136, lon:-57.58760, rio:"Rio Amazonas", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Boca do Acre": { lat:-8.75222, lon:-67.39780, rio:"Rio Purus", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Borba": { lat:-4.38778, lon:-59.59390, rio:"Rio Madeira", cota_alerta:14.00, cota_max:16.00, cota_emergencia:15.70 },
  "Caapiranga": { lat:-3.31537, lon:-61.20900, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Canutama": { lat:-6.53389, lon:-64.38390, rio:"Rio Purus", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Carauari": { lat:-4.88278, lon:-66.89580, rio:"Rio Juruá", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Careiro": { lat:-3.81000, lon:-60.37000, rio:"Rio Amazonas", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Careiro da Várzea": { lat:-3.74000, lon:-60.38000, rio:"Rio Amazonas", cota_alerta:28.50, cota_max:29.50, cota_emergencia:29.00 },
  "Coari": { lat:-4.09472, lon:-63.14410, rio:"Rio Solimões", cota_alerta:14.00, cota_max:16.20, cota_emergencia:16.00 },
  "Codajás": { lat:-3.83750, lon:-62.05690, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Eirunepé": { lat:-6.66028, lon:-69.87360, rio:"Rio Juruá", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Envira": { lat:-7.43789, lon:-70.02810, rio:"Rio Tarauacá", cota_alerta:10.50, cota_max:13.00, cota_emergencia:12.50 },
  "Fonte Boa": { lat:-2.51389, lon:-66.09170, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Guajará": { lat:-7.53797, lon:-72.59050, rio:"Rio Juruá", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Humaitá": { lat:-7.51651, lon:-63.03110, rio:"Rio Madeira", cota_alerta:11.50, cota_max:13.50, cota_emergencia:13.20 },
  "Ipixuna": { lat:-7.04791, lon:-71.69340, rio:"Rio Juruá", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Iranduba": { lat:-3.28472, lon:-60.18610, rio:"Rio Solimões", cota_alerta:20.50, cota_max:22.80, cota_emergencia:22.50 },
  "Itacoatiara": { lat:-3.13861, lon:-58.44420, rio:"Rio Amazonas", cota_alerta:14.00, cota_max:16.83, cota_emergencia:16.80 },
  "Itamarati": { lat:-6.43889, lon:-68.24390, rio:"Rio Juruá", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Itapiranga": { lat:-2.74589, lon:-58.02980, rio:"Rio Uatumã", cota_alerta:10.50, cota_max:13.00, cota_emergencia:12.50 },
  "Japurá": { lat:-1.88083, lon:-66.99690, rio:"Rio Japurá", cota_alerta:10.50, cota_max:13.00, cota_emergencia:12.50 },
  "Juruá": { lat:-3.48438, lon:-66.07180, rio:"Rio Juruá", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Jutaí": { lat:-2.75814, lon:-66.75950, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Lábrea": { lat:-7.25861, lon:-64.79810, rio:"Rio Purus", cota_alerta:12.50, cota_max:14.50, cota_emergencia:14.20 },
  "Manacapuru": { lat:-3.29972, lon:-60.62060, rio:"Rio Solimões", cota_alerta:21.00, cota_max:23.50, cota_emergencia:25.20 },
  "Manaquiri": { lat:-3.44078, lon:-60.46120, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Manaus": { lat:-3.10000, lon:-60.02000, rio:"Rio Negro", cota_alerta:29.00, cota_max:29.97, cota_emergencia:34.80 },
  "Manicoré": { lat:-5.80917, lon:-61.30030, rio:"Rio Madeira", cota_alerta:13.00, cota_max:15.00, cota_emergencia:14.70 },
  "Maraã": { lat:-1.85313, lon:-65.57300, rio:"Rio Japurá", cota_alerta:10.50, cota_max:13.00, cota_emergencia:12.50 },
  "Maués": { lat:-3.38361, lon:-57.71860, rio:"Rio Maués-Açu", cota_alerta:9.00, cota_max:10.80, cota_emergencia:10.50 },
  "Nhamundá": { lat:-2.18583, lon:-56.71110, rio:"Rio Amazonas", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Nova Olinda do Norte": { lat:-3.90037, lon:-59.09560, rio:"Rio Madeira", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Novo Airão": { lat:-2.62139, lon:-60.94360, rio:"Rio Negro", cota_alerta:20.00, cota_max:22.00, cota_emergencia:21.80 },
  "Novo Aripuanã": { lat:-5.12056, lon:-60.37970, rio:"Rio Madeira", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Parintins": { lat:-2.62833, lon:-56.73580, rio:"Rio Amazonas", cota_alerta:11.50, cota_max:13.80, cota_emergencia:13.80 },
  "Pauini": { lat:-7.71361, lon:-66.97640, rio:"Rio Purus", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Presidente Figueiredo": { lat:-2.03445, lon:-60.02560, rio:"Rede hidrográfica local", cota_alerta:10.50, cota_max:13.00, cota_emergencia:12.50 },
  "Rio Preto da Eva": { lat:-2.69944, lon:-59.70060, rio:"Rede hidrográfica local", cota_alerta:10.50, cota_max:13.00, cota_emergencia:12.50 },
  "Santa Isabel do Rio Negro": { lat:-0.41389, lon:-65.01920, rio:"Rio Negro", cota_alerta:11.50, cota_max:14.00, cota_emergencia:13.50 },
  "Santo Antônio do Içá": { lat:-3.10222, lon:-67.93970, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "São Gabriel da Cachoeira": { lat:0.13028, lon:-67.08920, rio:"Rio Negro", cota_alerta:11.00, cota_max:12.50, cota_emergencia:12.20 },
  "São Paulo de Olivença": { lat:-3.46556, lon:-68.94690, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "São Sebastião do Uatumã": { lat:-2.57088, lon:-57.87080, rio:"Rio Uatumã", cota_alerta:10.50, cota_max:13.00, cota_emergencia:12.50 },
  "Silves": { lat:-2.83333, lon:-58.21390, rio:"Rio Amazonas", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Tabatinga": { lat:-4.25222, lon:-69.93810, rio:"Rio Solimões", cota_alerta:11.00, cota_max:13.50, cota_emergencia:13.20 },
  "Tapauá": { lat:-5.62085, lon:-63.18120, rio:"Rio Purus", cota_alerta:12.50, cota_max:15.00, cota_emergencia:14.50 },
  "Tefé": { lat:-3.36822, lon:-64.71930, rio:"Rio Solimões", cota_alerta:14.50, cota_max:17.50, cota_emergencia:17.40 },
  "Tonantins": { lat:-2.87306, lon:-67.80220, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Uarini": { lat:-2.99600, lon:-65.11330, rio:"Rio Solimões", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Urucará": { lat:-2.53639, lon:-57.76000, rio:"Rio Amazonas", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
  "Urucurituba": { lat:-3.12845, lon:-58.14960, rio:"Rio Amazonas", cota_alerta:13.00, cota_max:16.00, cota_emergencia:15.50 },
};

Object.assign(CFG, MUNICIPIOS_AMAZONAS);

Object.keys(REGIOES).forEach(k => delete REGIOES[k]);
Object.assign(REGIOES, {
  "Alto Solimões/Javari": ["Amaturá", "Atalaia do Norte", "Benjamin Constant", "Fonte Boa", "Jutaí", "Santo Antônio do Içá", "São Paulo de Olivença", "Tabatinga", "Tonantins"],
  "Médio Solimões": ["Alvarães", "Anamã", "Anori", "Beruri", "Caapiranga", "Coari", "Codajás", "Iranduba", "Manacapuru", "Manaquiri", "Tefé", "Uarini"],
  "Rio Negro": ["Barcelos", "Manaus", "Novo Airão", "Presidente Figueiredo", "Rio Preto da Eva", "Santa Isabel do Rio Negro", "São Gabriel da Cachoeira"],
  "Baixo Amazonas": ["Barreirinha", "Boa Vista do Ramos", "Itacoatiara", "Itapiranga", "Maués", "Nhamundá", "Parintins", "São Sebastião do Uatumã", "Silves", "Urucará", "Urucurituba"],
  "Madeira/Aripuanã": ["Apuí", "Autazes", "Borba", "Careiro", "Careiro da Várzea", "Humaitá", "Manicoré", "Nova Olinda do Norte", "Novo Aripuanã"],
  "Purus/Juruá/Japurá": ["Boca do Acre", "Canutama", "Carauari", "Eirunepé", "Envira", "Guajará", "Ipixuna", "Itamarati", "Japurá", "Juruá", "Lábrea", "Maraã", "Pauini", "Tapauá"],
  "Estações de apoio fora do AM": ["Óbidos", "Santarém"],
});

const ESTACOES_BASE = Object.keys(CFG);

function obterEstacoesCompletas(lista) {
  return Array.from(new Set([...(Array.isArray(lista) ? lista : []), ...ESTACOES_BASE]));
}

const CAMADAS = [
  { id:'carto-light', label:'Claro',       color:'#B8B0A0', tile:'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attr:'© CartoDB' },
  { id:'carto-dark',  label:'Escuro',      color:'#4A4438', tile:'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',  attr:'© CartoDB' },
  { id:'osm',         label:'Satélite',    color:'#2A6A4A', tile:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr:'© Esri' },
  { id:'topo',        label:'Topográfico', color:'#6A8A6A', tile:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attr:'© OpenTopoMap' },
];

const PERIODOS = [
  { label:'Todos os dados', value:0 },
  { label:'Últimos 30 dias', value:30 },
  { label:'Últimos 60 dias', value:60 },
  { label:'Últimos 90 dias', value:90 },
];

const LIMITE_MUNICIPIOS_OPCOES = [
  { label:'10 municípios', value:10 },
  { label:'20 municípios', value:20 },
  { label:'30 municípios', value:30 },
  { label:'40 municípios', value:40 },
  { label:'50 municípios', value:50 },
  { label:'Todos', value:'todos' },
];

const STATUS_ALERTA_OPCOES = [
  { label:'Todos os status', value:'todos' },
  { label:'Normal', value:'normal' },
  { label:'Atenção', value:'atencao' },
  { label:'Alerta', value:'alerta' },
  { label:'Emergência', value:'emergencia' },
];

function passaFiltroStatus(item, filtro) {
  if (!filtro || filtro === 'todos') return true;
  const status = item?.status || '';
  if (filtro === 'normal') return status === 'Normal';
  if (filtro === 'atencao') return status === 'Atenção';
  if (filtro === 'alerta') return status === 'Alerta';
  if (filtro === 'emergencia') return status === 'Emergência';
  return true;
}

function limitarMunicipios(lista, limite) {
  if (limite === 'todos') return lista;
  const n = Number(limite);
  if (!Number.isFinite(n) || n <= 0) return lista;
  return lista.slice(0, n);
}

const NAV = [
  { id:'home',      label:'Início',              d:'M3 12L12 3l9 9 M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9' },
  { id:'estacao',   label:'Estações',            d:'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10' },
  { id:'rede',      label:'Rede de Estações',    d:'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4' },
  { id:'mapa',      label:'Mapa ao Vivo',        d:'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z M9 3v15 M15 6v15' },
  { id:'dashboard', label:'Dashboard',           d:'M18 20V10 M12 20V4 M6 20v-6' },
  { id:'sistema',   label:'Informações',         d:'M13 16h-1v-4h-1 M12 8h.01 M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id:'log',       label:'Logs de Atualizações', d:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M9 12h6 M9 16h4' },
];

const COR = { g:'#007D6E', w:'#B86812', d:'#B8322A' };
const fmtD = s => { if (!s) return ''; const [,m,d] = s.split('-'); return `${d}/${m}`; };

const DADOS_CACHE_KEY = 'fluviam:dados-cache:v2';
const ATUALIZACAO_MS = 2 * 60 * 60 * 1000;

function hasUsefulData(payload) {
  return !!payload && typeof payload === 'object' && Object.values(payload).some(info => Array.isArray(info?.dados) && info.dados.length > 0);
}

function getCachedAppState() {
  if (typeof window === 'undefined') return { dados:{}, estacoes:[], cidade:'' };
  try {
    const raw = localStorage.getItem(DADOS_CACHE_KEY);
    if (!raw) return { dados:{}, estacoes:[], cidade:'' };
    const parsed = JSON.parse(raw);
    return {
      dados: hasUsefulData(parsed?.dados) ? parsed.dados : {},
      estacoes: Array.isArray(parsed?.estacoes) ? parsed.estacoes : [],
      cidade: parsed?.cidade || '',
      salvoEm: parsed?.salvoEm || null,
    };
  } catch (_) {
    return { dados:{}, estacoes:[], cidade:'' };
  }
}

function saveCachedAppState(dados, estacoes, cidade) {
  if (typeof window === 'undefined' || !hasUsefulData(dados)) return;
  try {
    localStorage.setItem(DADOS_CACHE_KEY, JSON.stringify({
      dados,
      estacoes: Array.isArray(estacoes) ? estacoes : [],
      cidade: cidade || '',
      salvoEm: new Date().toISOString(),
    }));
  } catch (_) {
    // Cache do navegador cheio ou indisponível: mantém funcionamento normal em memória.
  }
}

function classificar(cota, cfg) {
  if (!cfg) return { c:'g', t:'Normal', pct:0 };
  const pct = Math.min((cota / cfg.cota_max) * 100, 100);
  if (cota >= cfg.cota_alerta * 1.2) return { c:'d', t:'Emergência', pct };
  if (cota >= cfg.cota_alerta)       return { c:'d', t:'Alerta',     pct };
  if (cota >= cfg.cota_alerta * 0.7) return { c:'w', t:'Atenção',    pct };
  return { c:'g', t:'Normal', pct };
}

function estimarPico(lista) {
  if (!lista || lista.length < 7) return null;
  const rec = lista.slice(-14);
  const diffs = rec.slice(1).map((d,i) => (d.cota_m??0) - (rec[i].cota_m??0));
  const tend = diffs.reduce((a,b) => a+b, 0) / diffs.length;
  const cotaAtual = lista[lista.length-1]?.cota_m ?? 0;
  if (tend <= 0) return { data:'Estável', cota:cotaAtual.toFixed(2), desc:'Rio em queda ou estável' };
  const dias = Math.min(30, Math.round(14 + Math.abs(cotaAtual / (tend||0.001))));
  const cotaPico = Math.min(cotaAtual + tend * dias, 38);
  const dt = new Date(); dt.setDate(dt.getDate() + dias);
  return {
    data: dt.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }),
    cota: cotaPico.toFixed(2),
    desc: `${tend > 0 ? '+' : ''}${tend.toFixed(3)} m/dia`
  };
}

function getUpdateTimes() {
  const now = new Date();
  const h = now.getHours();
  const turno = h >= 6 && h < 12 ? 'manha' : h >= 12 && h < 18 ? 'tarde' : 'noite';
  const turnoLabel = { manha:'Manhã', tarde:'Tarde', noite:'Noite' }[turno];
  const proximaHora = String((Math.floor(h / 2) * 2 + 2) % 24).padStart(2, '0') + ':00';
  return {
    turno,
    turnoLabel,
    horarios: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    proxima: proximaHora,
  };
}

function gerarLog(dados, estacoes) {
  const log = [];
  estacoes.forEach(nome => {
    const info = dados[nome] || {};
    const lista = info.dados || [];
    const fonte = info.fonte || 'fallback';
    if (lista.length === 0) return;
    const ult = lista[lista.length - 1];
    const data = new Date(ult.data + 'T12:00:00');
    const h = data.getHours() + (Math.random() > 0.5 ? 6 : 0);
    const turno = h >= 6 && h < 12 ? 'manha' : h >= 12 && h < 18 ? 'tarde' : 'noite';
    log.push({ id:`${nome}-${ult.data}`, estacao:nome, data:ult.data, ts:data.toISOString(), cota:ult.cota_m, fonte, turno, registros:lista.length, status:fonte==='sace'?'ok':fonte==='open-meteo'?'estimativa':'fallback', rio:CFG[nome]?.rio||'—' });
    if (lista.length > 1) {
      const ant = lista[lista.length - 2];
      const dataAnt = new Date(ant.data + 'T06:00:00');
      log.push({ id:`${nome}-${ant.data}`, estacao:nome, data:ant.data, ts:dataAnt.toISOString(), cota:ant.cota_m, fonte, turno:'manha', registros:lista.length-1, status:fonte==='sace'?'ok':'estimativa', rio:CFG[nome]?.rio||'—' });
    }
  });
  log.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  return log;
}

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--bordm)', borderRadius:6, padding:'8px 12px', fontSize:11, boxShadow:'0 4px 16px rgba(0,0,0,.08)' }}>
      <p style={{ color:'var(--muted)', marginBottom:4, fontFamily:'DM Mono,monospace' }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color:p.color, fontWeight:500 }}>{p.name}: {(+p.value).toFixed(2)}</p>)}
    </div>
  );
};

/* ══ COMPONENTE: ALERTA DINÂMICO ══════════════════════════════════════════════
   Renderiza apenas se cota ≥ 70% da cota de alerta.
   Calcula tipo em tempo real: Atenção / Alerta / Emergência.
   =========================================================================== */
function FloodAlert({ estacao, cotaAtual, cotaAlerta, cotaEmergencia }) {
  if (!cotaAlerta || cotaAtual == null) return null;

  const limiarAtencao    = cotaAlerta * 0.70;
  const limiarAlerta     = cotaAlerta;
  const limiarEmergencia = cotaEmergencia || cotaAlerta * 1.20;

  if (cotaAtual < limiarAtencao) return null;

  let tipo, titulo, descricao, cls;

  if (cotaAtual >= limiarEmergencia) {
    tipo = 'emergencia';
    cls  = '';   // vermelho (padrão)
    titulo = `Emergência — ${estacao}`;
    descricao = `Cota ${cotaAtual.toFixed(2)} m ultrapassa a cota de emergência (${limiarEmergencia.toFixed(2)} m). Risco muito elevado.`;
  } else if (cotaAtual >= limiarAlerta) {
    tipo = 'alerta';
    cls  = '';
    titulo = `Alerta de enchente — ${estacao}`;
    descricao = `Cota ${cotaAtual.toFixed(2)} m acima da cota de alerta (${cotaAlerta.toFixed(2)} m). Monitoramento intensivo necessário.`;
  } else {
    tipo = 'atencao';
    cls  = 'atencao';
    titulo = `Atenção — ${estacao}`;
    descricao = `Cota ${cotaAtual.toFixed(2)} m se aproxima da cota de alerta (${cotaAlerta.toFixed(2)} m). Acompanhar evolução.`;
  }

  return (
    <div className={`al-bar ${cls}`}>
      <div className="al-ico">{tipo === 'atencao' ? '⚠' : '🚨'}</div>
      <div>
        <div className="al-ttl">{titulo}</div>
        <div className="al-dsc">{descricao}</div>
      </div>
    </div>
  );
}

function FiltrosPainelMunicipios({ limiteMunicipios, setLimiteMunicipios, statusFiltro, setStatusFiltro, total, exibidos }) {
  return (
    <div className="painel-filtros">
      <span className="filtro-lbl">Visualizar:</span>
      <select className="filtro-sel" value={limiteMunicipios} onChange={e => setLimiteMunicipios(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}>
        {LIMITE_MUNICIPIOS_OPCOES.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
      </select>
      <span className="filtro-lbl">Status:</span>
      <select className="filtro-sel" value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
        {STATUS_ALERTA_OPCOES.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
      </select>
      <span className="pf-spacer"/>
      <span className="pf-count">Exibindo {exibidos} de {total}</span>
    </div>
  );
}

/* ══ COMPONENTE: TICKER DE ESTAÇÕES ══════════════════════════════════════════
   Faixa animada com info de todas as estações.
   Para no hover. Duplica os itens para scroll infinito suave.
   =========================================================================== */
function StationTicker({ estacoes, dados, config, onClickEstacao }) {
  if (!estacoes.length) return null;

  const items = estacoes.map(nome => {
    const d  = dados[nome] || {};
    const l  = d.dados || [];
    const u  = l[l.length - 1] || {};
    const co = u.cota_m ?? 0;
    const prev = l.length > 1 ? (l[l.length - 2]?.cota_m ?? co) : co;
    const diff = +(co - prev).toFixed(2);
    const { c, t } = classificar(co, config[nome]);
    return { nome, cota: co, diff, cls: c, status: t };
  });

  // Duplicar para scroll contínuo
  const doubled = [...items, ...items];

  const badgeStyle = (cls) => {
    if (cls === 'd') return { background:'rgba(192,57,43,.35)', color:'#FF9B8F' };
    if (cls === 'w') return { background:'rgba(196,122,30,.35)', color:'#F5C87A' };
    return null;
  };

  return (
    <div className="ticker-outer">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <div
            key={`${item.nome}-${i}`}
            className="ticker-item"
            onClick={() => onClickEstacao(item.nome)}
          >
            <span
              className="ticker-name"
              style={{ color: item.cls !== 'g' ? (item.cls === 'd' ? '#FF9B8F' : '#F5C87A') : 'rgba(237,233,225,.7)' }}
            >
              {item.nome}
            </span>
            <span className="ticker-sep"/>
            <span
              className="ticker-cota"
              style={{ color: COR[item.cls] }}
            >
              {item.cota.toFixed(2)} m
            </span>
            {item.diff !== 0 && (
              <span
                className="ticker-var"
                style={{ color: item.diff > 0 ? '#FF9B8F' : '#6DD99A' }}
              >
                {item.diff > 0 ? '▲' : '▼'} {Math.abs(item.diff).toFixed(2)}
              </span>
            )}
            {item.cls !== 'g' && badgeStyle(item.cls) && (
              <span className="ticker-badge" style={badgeStyle(item.cls)}>
                {item.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const cacheInicial = getCachedAppState();
  const [splashDone, setSplashDone] = useState(false);
  const [dados,    setDados]    = useState(() => cacheInicial.dados || {});
  const [estacoes, setEstacoes] = useState(() => obterEstacoesCompletas(cacheInicial.estacoes));
  const [cidade,   setCidade]   = useState(() => cacheInicial.cidade || ESTACOES_BASE[0] || '');
  const [periodo,  setPeriodo]  = useState(0);
  const [loading,  setLoading]  = useState(() => !hasUsefulData(cacheInicial.dados));
  const [error,    setError]    = useState(null);
  const [tema,     setTema]     = useState(() => localStorage.getItem('tema') || 'light');
  const [pagina,   setPagina]   = useState('home');
  const [sideOpen, setSideOpen] = useState(true);
  const [camada,   setCamada]   = useState('carto-light');
  const [regiaoFiltro, setRegiaoFiltro] = useState('todas');
  const [ordenacao,    setOrdenacao]    = useState('nome');
  const [limiteMunicipios, setLimiteMunicipios] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [logFiltroFonte, setLogFiltroFonte] = useState('todas');
  const [alertasIntegrados, setAlertasIntegrados] = useState(null);
  const [fontesAlerta, setFontesAlerta] = useState([]);
  const [loadingAlertas, setLoadingAlertas] = useState(false);

  const mapaMainInst = useRef(null);
  const tileLayerRef = useRef(null);
  const firstPeriodoRun = useRef(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('tema', tema);
  }, [tema]);

  const carregar = async (_est = cidade, dias = periodo, force = false) => {
    try {
      setLoading(prev => prev && !hasUsefulData(dados));
      setError(null);

      // Importante: a tela mantém todas as estações em memória.
      // Trocar a cidade selecionada não deve sobrescrever a base completa do ticker.
      const [rE, rD] = await Promise.all([
        axios.get('/api/estacoes'),
        axios.get('/api/dados', { params: { ...(dias > 0 && { dias }), ...(force && { force: true }) } })
      ]);

      const lista = obterEstacoesCompletas(rE.data?.estacoes || []);
      const novosDados = rD.data || {};

      setEstacoes(lista);

      if (hasUsefulData(novosDados)) {
        setDados(novosDados);
        const cidadeAtual = cidade || _est || lista[0] || '';
        if (!cidade && cidadeAtual) setCidade(cidadeAtual);
        saveCachedAppState(novosDados, lista, cidadeAtual);
      } else {
        const cache = getCachedAppState();
        if (hasUsefulData(cache.dados)) {
          setDados(prev => hasUsefulData(prev) ? prev : cache.dados);
          if (!estacoes.length && cache.estacoes?.length) setEstacoes(obterEstacoesCompletas(cache.estacoes));
          if (!cidade && (cache.cidade || ESTACOES_BASE[0])) setCidade(cache.cidade || ESTACOES_BASE[0]);
        }
      }
    } catch (e) {
      const cache = getCachedAppState();
      if (hasUsefulData(cache.dados)) {
        setDados(prev => hasUsefulData(prev) ? prev : cache.dados);
        if (!estacoes.length && cache.estacoes?.length) setEstacoes(obterEstacoesCompletas(cache.estacoes));
        if (!cidade && (cache.cidade || ESTACOES_BASE[0])) setCidade(cache.cidade || ESTACOES_BASE[0]);
        setError(null);
      } else {
        setEstacoes(prev => prev.length ? prev : ESTACOES_BASE);
        if (!cidade && ESTACOES_BASE[0]) setCidade(ESTACOES_BASE[0]);
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const carregarIntegracoes = async (force = false) => {
    try {
      setLoadingAlertas(true);
      const [rF, rA] = await Promise.allSettled([
        axios.get('/api/fontes-alerta'),
        axios.get('/api/alertas-integrados', { params: { force } })
      ]);
      if (rF.status === 'fulfilled') setFontesAlerta(rF.value.data?.fontes || []);
      if (rA.status === 'fulfilled') setAlertasIntegrados(rA.value.data || null);
    } finally {
      setLoadingAlertas(false);
    }
  };

  useEffect(() => { carregar('', 0); carregarIntegracoes(false); }, []);

  useEffect(() => {
    if (firstPeriodoRun.current) {
      firstPeriodoRun.current = false;
      return;
    }
    carregar('', periodo);
  }, [periodo]);

  useEffect(() => {
    const timer = setInterval(() => {
      carregar('', periodo);
      carregarIntegracoes(false);
    }, ATUALIZACAO_MS);
    return () => clearInterval(timer);
  }, [periodo]);

  const buildMapMain = (dadosAtual, estacoesMapa = estacoesVisiveis) => {
    const L = window.L;
    const el = document.getElementById('mapa-leaflet-main');
    if (!L || !el) return;
    if (mapaMainInst.current) { mapaMainInst.current.remove(); mapaMainInst.current = null; }
    const cfg0 = CAMADAS.find(c => c.id === camada) || CAMADAS[0];
    const map = L.map('mapa-leaflet-main', { zoomControl:true, scrollWheelZoom:true }).setView([-3.5, -62], 5);
    const tl = L.tileLayer(cfg0.tile, { attribution: cfg0.attr, maxZoom:16 }).addTo(map);
    tileLayerRef.current = tl;
    // Itera sobre os municípios filtrados no painel (quantidade + status de alerta)
    const nomesMapa = (Array.isArray(estacoesMapa) && estacoesMapa.length ? estacoesMapa : estacoes).filter(nome => CFG[nome]);
    nomesMapa.forEach((nome) => {
      const cfg = CFG[nome];
      const info = dadosAtual[nome] || {};
      const lista = info.dados || [];
      const cota = lista[lista.length-1]?.cota_m ?? 0;
      const prev = lista.length > 1 ? (lista[lista.length-2]?.cota_m ?? cota) : cota;
      const diff = cota - prev;
      const { c, t } = classificar(cota, cfg);
      const cor = COR[c];
      const pctV = Math.min((cota / (cfg.cota_max||1)) * 100, 100);
      const icon = L.divIcon({
        className: '',
        html: `<div style="position:relative;width:14px;height:14px;">
          <div style="position:absolute;inset:-4px;border-radius:50%;background:${cor};opacity:.25;animation:marker-pulse 2.8s ease-out infinite;"></div>
          <div style="position:absolute;inset:-8px;border-radius:50%;background:${cor};opacity:.12;animation:marker-pulse 2.8s ease-out infinite .6s;"></div>
          <div style="width:14px;height:14px;border-radius:50%;background:${cor};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);position:relative;z-index:1;"></div>
        </div>`,
        iconSize: [14,14], iconAnchor: [7,7]
      });
      const marker = L.marker([cfg.lat, cfg.lon], { icon }).addTo(map);
      const barW = Math.round(pctV);
      const diffStr = diff !== 0 ? `${diff > 0 ? '▲' : '▼'} ${Math.abs(diff).toFixed(2)} m` : '—';
      const diffColor = diff > 0 ? '#C0392B' : diff < 0 ? '#2A7A3A' : '#8A8278';
      marker.bindPopup(L.popup({ maxWidth:220, minWidth:180 }).setContent(`
        <div style="font-family:'Outfit',sans-serif;padding:2px">
          <div style="font-weight:600;font-size:13px;margin-bottom:2px">${nome}</div>
          <div style="font-size:10px;color:#8A8278;margin-bottom:10px">${cfg.rio}</div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
            <span style="font-size:10px;color:#8A8278">Cota atual</span>
            <span style="font-size:20px;font-weight:600;color:${cor};font-family:'DM Mono',monospace">${cota.toFixed(2)} m</span>
          </div>
          <div style="height:4px;background:#EEEBE4;border-radius:99px;margin-bottom:10px;overflow:hidden">
            <div style="height:100%;width:${barW}%;background:${cor};border-radius:99px;"></div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:5px">
              <div style="width:7px;height:7px;border-radius:50%;background:${cor}"></div>
              <span style="font-size:11px;font-weight:500;color:${cor}">${t}</span>
            </div>
            <span style="font-size:10px;color:${diffColor};font-family:'DM Mono',monospace">${diffStr}</span>
          </div>
        </div>`));
      marker.bindTooltip(nome, { direction:'right', offset:[8,0], className:'city-lbl', permanent:true });
    });
    mapaMainInst.current = map;
  };

  useEffect(() => {
    if (pagina !== 'mapa') return;
    const timer = setTimeout(() => {
      const el = document.getElementById('mapa-leaflet-main');
      if (!el) return;
      if (window.L) { buildMapMain(dados, estacoesVisiveis); return; }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      const sc = document.createElement('script');
      sc.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      sc.onload = () => buildMapMain(dados, estacoesVisiveis);
      document.head.appendChild(sc);
    }, 150);
    return () => clearTimeout(timer);
  }, [pagina, JSON.stringify(Object.keys(dados)), statusFiltro, limiteMunicipios]);

  useEffect(() => {
    if (!mapaMainInst.current || !window.L) return;
    const cfg = CAMADAS.find(c => c.id === camada);
    if (cfg && tileLayerRef.current) tileLayerRef.current.setUrl(cfg.tile);
  }, [camada]);

  const info    = dados[cidade] || {};
  const lista   = info.dados    || [];
  const ult     = lista[lista.length-1] || {};
  const cota    = ult.cota_m ?? 0;
  const cfgC    = CFG[cidade];
  const { c:cl, t:stTxt, pct } = classificar(cota, cfgC);
  const stColor = cl==='g' ? 'var(--teal)' : cl==='w' ? 'var(--amber)' : 'var(--red)';
  const pico    = estimarPico(lista);
  const fonte   = info.fonte || '';
  const fonteLabel = { sace:'SACE/SGB', 'open-meteo':'Open-Meteo', fallback:'Cache', ana:'ANA HidroWS' }[fonte] || fonte || '—';
  const isSace  = fonte === 'sace';
  const updateInfo = getUpdateTimes(fonte);
  const ultimaDataStr = ult.data ? new Date(ult.data + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' }) : '—';

  const todasAlertas = estacoes.map(nome => {
    const d = dados[nome] || {};
    const l = d.dados || [];
    const u = l[l.length-1] || {};
    const co = u.cota_m ?? 0;
    const { c, t } = classificar(co, CFG[nome]);
    return { nome, cota:co, status:t, cls:c };
  }).filter(e => e.cls !== 'g');

  const alertCount = todasAlertas.length;
  const fontesOperacionais = fontesAlerta.length ? fontesAlerta : (alertasIntegrados?.fontes || []);
  const alertasExternos = alertasIntegrados?.alertas || [];
  const resumoIntegrado = alertasIntegrados?.resumo || {};
  const janelaIntegrada = alertasIntegrados?.janela || {};

  const allDatasets = estacoes.map(nome => {
    const d = dados[nome] || {};
    const l = d.dados || [];
    const u = l[l.length-1] || {};
    const co = u.cota_m ?? 0;
    const prev = l.length > 1 ? (l[l.length-2]?.cota_m ?? co) : co;
    const { c, t } = classificar(co, CFG[nome]);
    return { nome, cota: co, alerta: CFG[nome]?.cota_alerta || 0, pct: Math.round((co / (CFG[nome]?.cota_max||1))*100), status:t, cls:c, var: +(co - prev).toFixed(3), fonte: d.fonte || 'fallback' };
  });

  const datasetsPorStatus = allDatasets.filter(d => passaFiltroStatus(d, statusFiltro));
  const datasetsVisiveis = limitarMunicipios(datasetsPorStatus, limiteMunicipios);
  const estacoesVisiveis = datasetsVisiveis.map(d => d.nome);
  const cotaBarData = datasetsVisiveis.map(d => ({ name: d.nome, cota: d.cota, alerta: d.alerta, fill: COR[d.cls] }));
  const overallMax  = datasetsVisiveis.length ? Math.max(...datasetsVisiveis.map(d => d.cota)) : 0;
  const emAlerta    = datasetsVisiveis.filter(d => d.cls === 'd').length;
  const emAtencao   = datasetsVisiveis.filter(d => d.cls === 'w').length;
  const varData     = datasetsVisiveis.map(d => ({ name: d.nome, variacao: d.var, fill: d.var > 0 ? '#C0392B' : '#2A7A3A' }));
  const listaDash   = (dados[cidade]?.dados || []).slice(-30);

  const logEntries = gerarLog(dados, estacoes);
  const logFiltrado = logEntries.filter(e => logFiltroFonte === 'todas' || e.fonte === logFiltroFonte);
  const cacheCount = logEntries.filter(e => e.fonte === 'fallback').length;

  // Estações destacadas no hero (primeiras 5)
  const heroEstacoes = estacoes.slice(0, 5);

  useEffect(() => {
    if (estacoesVisiveis.length && cidade && !estacoesVisiveis.includes(cidade)) {
      setCidade(estacoesVisiveis[0]);
    }
  }, [statusFiltro, limiteMunicipios, estacoesVisiveis.join('|')]);

  if (loading && !estacoes.length) return (
    <><style>{css}</style>
    {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
    <div className="state" style={{ minHeight:'100vh' }}><div className="spinner"/><span style={{ fontSize:12 }}>Carregando…</span></div>
    </>
  );

  if (error && !estacoes.length) return (
    <><style>{css}</style>
    <div className="state" style={{ minHeight:'100vh' }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:10, padding:24, maxWidth:380 }}>
        <p style={{ fontWeight:500, color:'var(--red)', marginBottom:8 }}>Backend offline</p>
        <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.7 }}>
          Rode: <code style={{ fontSize:11, fontFamily:'DM Mono,monospace', background:'var(--surf2)', padding:'4px 8px', borderRadius:4 }}>
            uvicorn backend.server:app --port 5000 --reload
          </code>
        </p>
        <button className="btn-sm" style={{ marginTop:14 }} onClick={() => carregar('', 0, true)}>Tentar novamente</button>
      </div>
    </div></>
  );

  let redeOrdenada = [...datasetsPorStatus];
  if (ordenacao === 'cota-desc') redeOrdenada.sort((a,b) => b.cota - a.cota);
  else if (ordenacao === 'cota-asc') redeOrdenada.sort((a,b) => a.cota - b.cota);
  else if (ordenacao === 'status') redeOrdenada.sort((a,b) => {
    const o = { Emergência:0, Alerta:1, Atenção:2, Normal:3 };
    return (o[a.status]||3) - (o[b.status]||3);
  });
  else redeOrdenada.sort((a,b) => a.nome.localeCompare(b.nome));
  redeOrdenada = limitarMunicipios(redeOrdenada, limiteMunicipios);

  const renderPage = () => {

    /* ═══ HOME ═══════════════════════════════════════════════════════════════ */
    if (pagina === 'home') return (
      <div className="home-page home-clean">
        <div className="home-hero home-hero-minimal">
          <StationTicker
            estacoes={estacoes}
            dados={dados}
            config={CFG}
            onClickEstacao={(nome) => { setCidade(nome); setPagina('estacao'); }}
          />
        </div>

        <section className="home-menu-panel">
          <div className="home-menu-head">
            <div>
              <div className="home-menu-kicker">Menu do sistema</div>
              <h1>Escolha uma área para acessar</h1>
            </div>
            <div className="home-menu-status">
              <span className={`s-dot${error ? ' off' : ''}`}/>
              <span>{error ? 'Offline' : 'Dados ativos'}</span>
            </div>
          </div>

          <div className="home-menu-grid">
            {[
              { id:'home',      ttl:'Início',                 dsc:'Visão geral e acesso rápido aos módulos.' },
              { id:'estacao',   ttl:'Estações',               dsc:'Histórico, cotas e tendência por ponto de monitoramento.' },
              { id:'rede',      ttl:'Rede de Estações',       dsc:`${estacoes.length || 0} estações disponíveis para consulta.` },
              { id:'mapa',      ttl:'Mapa ao Vivo',           dsc:'Visualização geográfica das estações monitoradas.' },
              { id:'dashboard', ttl:'Dashboard',              dsc:'Indicadores, gráficos e consolidação operacional.' },
              { id:'sistema',   ttl:'Informações',            dsc:'Informações do sistema, fontes de dados, APIs e alertas integrados.' },
              { id:'log',       ttl:'Logs de Atualizações',   dsc:'Registro das últimas coletas e atualizações.' },
            ].filter(item => item.id !== 'home').map((item) => (
              <button key={item.id} className="home-menu-card" onClick={() => setPagina(item.id)}>
                <span className="home-menu-card-title">{item.ttl}</span>
                <span className="home-menu-card-desc">{item.dsc}</span>
                <span className="home-menu-card-link">Abrir módulo →</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    );

    /* ═══ INFORMAÇÕES DO SISTEMA + FONTES & APIs ════════════════════════════ */
    if (pagina === 'sistema' || pagina === 'fontes') return (
      <div className="info-page">
        <div className="info-hero">
          <div className="info-kicker">Informações</div>
          <div className="info-title">FluviAM: monitoramento, fontes e APIs em um só lugar</div>
          <p className="info-text">
            O FluviAM é um sistema de monitoramento hidrológico que acompanha o comportamento dos rios da Bacia Amazônica,
            integrando leituras operacionais, histórico de níveis, alertas automáticos e fontes externas para apoiar análise,
            demonstrações e tomada de decisão.
          </p>
        </div>

        <div className="info-grid">
          {[
            { cor:'#007D6E', titulo:'Dados hidrológicos consolidados', desc:'Consulta das leituras mais recentes das estações, priorizando visual limpo e leitura rápida.' },
            { cor:'#B86812', titulo:'Alertas automáticos de enchente', desc:'Sinalização visual para níveis de atenção, alerta e emergência, com base nas cotas configuradas.' },
            { cor:'#B8322A', titulo:`Monitoramento de ${estacoes.length || 20} municípios`, desc:'Rede organizada para acompanhamento regional da Bacia Amazônica.' },
            { cor:'#277A43', titulo:'Previsão de pico por tendência', desc:'Estimativa simples de tendência para apoiar decisões operacionais e comunicação preventiva.' },
            { cor:'#174D6D', titulo:'Histórico completo de cotas', desc:'Série histórica por estação, útil para comparação, análise e relatórios.' },
            { cor:'#48D0B8', titulo:'Cache persistente de informações', desc:'Depois que os dados são carregados, o sistema mantém a última leitura válida até receber uma nova atualização.' },
          ].map((item,i) => (
            <div key={i} className="info-item">
              <span className="info-dot" style={{ background:item.cor }}/>
              <div>
                <div className="info-item-title">{item.titulo}</div>
                <div className="info-item-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="info-status">
          <div className="info-status-card">
            <div className="info-status-val">{estacoes.length || 20}</div>
            <div className="info-status-lbl">Estações ativas</div>
          </div>
          <div className="info-status-card">
            <div className="info-status-val" style={{ color: alertCount > 0 ? 'var(--red)' : 'var(--teal)' }}>{alertCount}</div>
            <div className="info-status-lbl">Alertas agora</div>
          </div>
          <div className="info-status-card">
            <div className="info-status-val">2h</div>
            <div className="info-status-lbl">Ciclo de atualização</div>
          </div>
        </div>

        <div className="integracoes-hero compact">
          <div>
            <div className="info-kicker">Fontes & APIs</div>
            <h2>Bases integradas ao sistema</h2>
            <p>
              As informações de fontes e APIs agora ficam dentro do menu Informações. O sistema consolida dados da ANA/SACE, INMET,
              CEMADEN e Open-Meteo, com atualização programada a cada 2 horas e preservação da última coleta válida.
            </p>
          </div>
          <div className="integracoes-actions">
            <button className="btn-sm" onClick={() => carregarIntegracoes(true)} disabled={loadingAlertas}>
              {loadingAlertas ? 'Coletando…' : 'Forçar coleta agora'}
            </button>
          </div>
        </div>

        <div className="integracoes-kpis">
          <div className="int-kpi"><div className="int-kpi-val" style={{ color:'var(--teal)' }}>{fontesOperacionais.length || 4}</div><div className="int-kpi-lbl">bases mapeadas</div></div>
          <div className="int-kpi"><div className="int-kpi-val" style={{ color:'var(--red)' }}>{resumoIntegrado.total ?? alertasExternos.length}</div><div className="int-kpi-lbl">alertas integrados</div></div>
          <div className="int-kpi"><div className="int-kpi-val">2h</div><div className="int-kpi-lbl">intervalo de coleta</div></div>
          <div className="int-kpi"><div className="int-kpi-val">{alertasIntegrados?.cache ? 'Cache' : 'API'}</div><div className="int-kpi-lbl">origem da leitura</div></div>
        </div>

        <div className="fontes-grid">
          {fontesOperacionais.map((f) => {
            const credClass = f.credencial === 'necessaria' && !f.configurada ? 'cred-off' : f.credencial === 'necessaria' ? 'cred-warn' : 'cred-ok';
            const credLabel = f.credencial === 'necessaria'
              ? (f.configurada ? 'Credencial configurada' : 'Requer .env')
              : 'Sem credencial';
            return (
              <div key={f.slug} className="fonte-card">
                <div className="fonte-card-top">
                  <div className="fonte-nome">{f.nome}</div>
                  <span className={`cred-chip ${credClass}`}>{credLabel}</span>
                </div>
                <div className="fonte-desc">{f.uso}</div>
                <div className="fonte-coleta">{f.coleta}</div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="sec-ttl">Alertas coletados pelas APIs</div>
          <div className="sec-sub" style={{ marginBottom:12 }}>
            Última coleta: {alertasIntegrados?.coletado_em ? new Date(alertasIntegrados.coletado_em).toLocaleString('pt-BR') : '—'} · Próxima janela: {janelaIntegrada.proxima_coleta ? new Date(janelaIntegrada.proxima_coleta).toLocaleString('pt-BR') : '—'}
          </div>
          {alertasExternos.length === 0 ? (
            <div className="state" style={{ minHeight:180 }}><span>{loadingAlertas ? 'Consultando fontes…' : 'Nenhum alerta externo encontrado na última coleta.'}</span></div>
          ) : (
            <div className="alertas-integrados">
              {alertasExternos.slice(0, 12).map((a, idx) => (
                <div key={`${a.id}-${idx}`} className={`alerta-int-card rank-${a.nivel_rank || 1}`}>
                  <div>
                    <div className="alerta-int-title">{a.titulo}</div>
                    <div className="alerta-int-desc">{a.descricao}</div>
                    <div className="alerta-int-meta">
                      <span className="meta-pill">{a.fonte}</span>
                      <span className="meta-pill">{a.municipio}/{a.uf}</span>
                      <span className="meta-pill">{a.tipo}</span>
                    </div>
                  </div>
                  <div className={`alerta-int-nivel rank-${a.nivel_rank || 1}`}>{a.nivel}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

    /* Fontes & APIs foi incorporado à página Informações. */

    /* ═══ MAPA ════════════════════════════════════════════════════════════════ */
    if (pagina === 'mapa') return (
      <div className="mapa-shell">
        <div className="mapa-body">
          <div id="mapa-leaflet-main" style={{ width:'100%', height:'100%' }}/>
          <div className="map-controls">
            <div className="map-ctrl-card">
              <div className="map-ctrl-ttl">Camada de mapa</div>
              {CAMADAS.map(c => (
                <button key={c.id} className={`layer-btn${camada === c.id ? ' active' : ''}`}
                  onClick={() => { setCamada(c.id); if (mapaMainInst.current && tileLayerRef.current) tileLayerRef.current.setUrl(c.tile); }}>
                  <div className="layer-dot" style={{ background:c.color }}/>{c.label}
                </button>
              ))}
            </div>
            <div className="map-ctrl-card">
              <div className="map-ctrl-ttl">Filtros</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <select className="filtro-sel" value={limiteMunicipios} onChange={e => setLimiteMunicipios(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}>
                  {LIMITE_MUNICIPIOS_OPCOES.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                </select>
                <select className="filtro-sel" value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
                  {STATUS_ALERTA_OPCOES.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                </select>
                <div className="pf-count">{estacoesVisiveis.length} visíveis</div>
              </div>
            </div>
            <div className="map-legend">
              <div className="map-ctrl-ttl">Legenda</div>
              <div className="leg-row"><div className="leg-pulse g"/><div><div className="leg-txt">Normal</div><div className="leg-sub">Abaixo de 70%</div></div></div>
              <div className="leg-row"><div className="leg-pulse w"/><div><div className="leg-txt">Atenção</div><div className="leg-sub">70–100%</div></div></div>
              <div className="leg-row"><div className="leg-pulse d"/><div><div className="leg-txt">Alerta</div><div className="leg-sub">Acima da cota</div></div></div>
            </div>
          </div>
        </div>
      </div>
    );

    /* ═══ ESTAÇÃO ════════════════════════════════════════════════════════════ */
    if (pagina === 'estacao') return (
      <>
        <nav className="city-tabs">
          {estacoesVisiveis.map(c => {
            // Badge na tab: mostra ponto vermelho se estação em alerta/atenção
            const d = dados[c] || {};
            const l = d.dados || [];
            const u = l[l.length-1] || {};
            const co = u.cota_m ?? 0;
            const { cls: tc } = classificar(co, CFG[c]) || {};
            const emAlertaTab = tc === 'd' || tc === 'w';
            return (
              <button key={c} className={`c-tab${c === cidade ? ' active' : ''}`} onClick={() => setCidade(c)}>
                {c}{emAlertaTab && <span className="cdot" style={{ background: tc === 'd' ? 'var(--red)' : 'var(--amber)' }}/>}
              </button>
            );
          })}
        </nav>

        {lista.length > 0 && (
          <div className="update-bar">
            <div className="update-bar-inner">
              <span className="u-dot"/>
              <div className="u-item">
                <span className="u-label">Última atualização</span>
                <strong style={{ fontFamily:'DM Mono,monospace', fontSize:11 }}>{ultimaDataStr}</strong>
              </div>
              <div className="u-sep"/>
              <div className="u-item">
                <span className="u-label">Turno</span>
                <span className={`log-turno turno-${updateInfo.turno}`}>{updateInfo.turnoLabel}</span>
              </div>
              <div className="u-sep"/>
              <div className="u-item">
                <span className="u-label">Horários</span>
                <span style={{ fontFamily:'DM Mono,monospace', fontSize:11 }}>{updateInfo.horarios.join(' · ')}</span>
              </div>
              <div className="u-sep"/>
              <div className="u-item">
                <span className="u-label">Próxima</span>
                <strong style={{ fontFamily:'DM Mono,monospace', fontSize:11 }}>{updateInfo.proxima}</strong>
              </div>
            </div>
            <div className="update-bar-right">
              <span className={`fonte-badge ${isSace ? 'fonte-sace' : fonte === 'open-meteo' ? 'fonte-openmeteo' : fonte === 'ana' ? 'fonte-ana' : 'fonte-fallback'}`}>
                {isSace ? '✓ Dados reais SACE' : fonte === 'open-meteo' ? '~ Estimativa Open-Meteo' : fonte === 'ana' ? '✓ ANA HidroWS' : '⚠ Cache local'}
              </span>
            </div>
          </div>
        )}

        <div className="filtro-row" style={{ marginTop:12 }}>
          <span className="filtro-lbl">Período:</span>
          <select className="filtro-sel" value={periodo} onChange={e => setPeriodo(Number(e.target.value))}>
            {PERIODOS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {loading && <div className="spinner" style={{ width:15, height:15 }}/>}
        </div>

        <FiltrosPainelMunicipios
          limiteMunicipios={limiteMunicipios}
          setLimiteMunicipios={setLimiteMunicipios}
          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}
          total={allDatasets.length}
          exibidos={datasetsVisiveis.length}
        />

        {/* ALERTA DINÂMICO — substitui ALERTAS_FIXOS */}
        <FloodAlert
          estacao={cidade}
          cotaAtual={cota}
          cotaAlerta={cfgC?.cota_alerta}
          cotaEmergencia={cfgC?.cota_emergencia}
        />

        {!loading && lista.length === 0
          ? <div className="state"><span>Sem dados para <strong>{cidade}</strong>.</span></div>
          : <>
            <div className="kpi-grid">
              <div className="kpi">
                <div className="kpi-lbl">Cota Atual</div>
                <div className={`kpi-val ${cl}`}>{cota.toFixed(2)}</div>
                <div className="kpi-unit">metros</div>
              </div>
              <div className="kpi">
                <div className="kpi-lbl">Cota de Alerta</div>
                <div className="kpi-val">{cfgC?.cota_alerta?.toFixed(2) ?? '—'}</div>
                <div className="kpi-unit">metros</div>
              </div>
              <div className="kpi">
                <div className="kpi-lbl">% do Máximo</div>
                <div className={`kpi-val ${cl}`}>{pct.toFixed(0)}%</div>
                <div className="kpi-unit">histórico</div>
              </div>
              <div className="kpi">
                <div className="kpi-lbl">Fonte</div>
                <div className="kpi-val" style={{ fontSize:12, paddingTop:4 }}>{fonteLabel}</div>
                <div className={`fonte-badge ${isSace ? 'fonte-sace' : fonte === 'open-meteo' ? 'fonte-openmeteo' : fonte === 'ana' ? 'fonte-ana' : 'fonte-fallback'}`} style={{ display:'inline-flex' }}>
                  {isSace ? '✓ dados reais' : fonte === 'open-meteo' ? '~ estimativa' : fonte === 'ana' ? '✓ ANA' : '⚠ cache'}
                </div>
              </div>
            </div>

            <div className="chart-grid">
              <div className="card">
                <div className="card-hdr">
                  <div>
                    <div className="card-ttl">Cota hídrica — histórico</div>
                    <div className="card-sub">{cidade} · {cfgC?.rio}</div>
                  </div>
                  <span className="badge b-teal" style={{ fontSize:10 }}>{lista.length} dias</span>
                </div>
                <div className="chart-box">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lista} margin={{ top:4, right:8, left:0, bottom:0 }}>
                      <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
                      <XAxis dataKey="data" tickFormatter={fmtD} tick={{ fontSize:10, fill:'var(--muted)', fontFamily:'DM Mono,monospace' }} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                      <YAxis tick={{ fontSize:10, fill:'var(--muted)', fontFamily:'DM Mono,monospace' }} axisLine={false} tickLine={false} width={34} domain={['auto','auto']}/>
                      <Tooltip content={<Tip/>}/>
                      {cfgC && <ReferenceLine y={cfgC.cota_alerta} stroke="var(--amber)" strokeDasharray="3 3" strokeWidth={1.5} label={{ value:'Alerta', position:'insideTopRight', fontSize:9, fill:'var(--amber)' }}/>}
                      <Line type="monotone" dataKey="cota_m" name="Cota (m)" stroke="var(--teal)" strokeWidth={1.8} dot={false} activeDot={{ r:4, strokeWidth:0 }}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div className="card" style={{ flex:1 }}>
                  <div className="card-hdr" style={{ marginBottom:14 }}>
                    <div><div className="card-ttl">Nível hídrico</div><div className="card-sub">status atual</div></div>
                  </div>
                  <div className="nivel">
                    <div>
                      <div className="n-lbl">Cota</div><div className="n-val">{cota.toFixed(2)} m</div>
                      <div className="n-bar"><div className={`n-fill ${cl}`} style={{ width:`${pct.toFixed(1)}%` }}/></div>
                    </div>
                    <div>
                      <div className="n-lbl">Margem p/ alerta</div>
                      <div className="n-val">{cfgC ? (cfgC.cota_alerta - cota).toFixed(2) : '—'} m</div>
                      <div className="n-bar"><div className="n-fill g" style={{ width:`${Math.min((cota/(cfgC?.cota_alerta||1))*100, 100).toFixed(1)}%` }}/></div>
                    </div>
                    <div><div className="n-lbl">Status</div><div className="n-status" style={{ color:stColor }}>{stTxt}</div></div>
                  </div>
                </div>
                {pico && (
                  <div className="card">
                    <div className="card-ttl">Previsão de pico</div>
                    <div className="card-sub" style={{ marginBottom:12 }}>por tendência</div>
                    <div className="pico">
                      <div><div className="n-lbl">Data estimada</div><div className="n-val" style={{ fontSize:15 }}>{pico.data}</div></div>
                      <div><div className="n-lbl">Cota estimada</div><div className="n-val" style={{ fontSize:15 }}>{pico.cota} m</div></div>
                      <div className="n-lbl">{pico.desc}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-hdr">
                <div><div className="card-ttl">Todas as estações</div><div className="card-sub">leitura mais recente</div></div>
                <button className="btn-sm" onClick={() => setPagina('rede')}>Ver rede completa →</button>
              </div>
              <table className="est-tbl">
                <thead><tr><th>Estação</th><th>Rio</th><th style={{ textAlign:'right' }}>Cota (m)</th><th style={{ textAlign:'right' }}>Alerta (m)</th><th style={{ textAlign:'right' }}>Var. dia</th><th style={{ textAlign:'right' }}>Status</th></tr></thead>
                <tbody>
                  {estacoesVisiveis.map(nome => {
                    const d = dados[nome] || {};
                    const l = d.dados || [];
                    const u = l[l.length-1] || {};
                    const co = u.cota_m ?? 0;
                    const prev = l.length > 1 ? (l[l.length-2]?.cota_m ?? co) : co;
                    const diff = co - prev;
                    const { c, t } = classificar(co, CFG[nome]);
                    return (
                      <tr key={nome} onClick={() => setCidade(nome)}>
                        <td style={{ fontWeight:500 }}><span className="tbl-dot" style={{ background:COR[c] }}/>{nome}</td>
                        <td style={{ color:'var(--muted)', fontSize:11 }}>{CFG[nome]?.rio || '—'}</td>
                        <td style={{ textAlign:'right', fontFamily:'DM Mono,monospace' }}>{co.toFixed(2)}</td>
                        <td style={{ textAlign:'right', fontFamily:'DM Mono,monospace', color:'var(--muted)' }}>{CFG[nome]?.cota_alerta?.toFixed(2) || '—'}</td>
                        <td style={{ textAlign:'right', fontFamily:'DM Mono,monospace', color: diff > 0 ? 'var(--red)' : diff < 0 ? 'var(--green)' : 'var(--muted)' }}>{diff > 0 ? '+' : ''}{diff.toFixed(2)}</td>
                        <td style={{ textAlign:'right', color:COR[c], fontWeight:500 }}>{t}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        }
      </>
    );

    /* ═══ ALERTAS ════════════════════════════════════════════════════════════ */
    if (pagina === 'alertas') return (
      <>
        <div className="sec-ttl">Alertas ativos</div>
        <div className="sec-sub">Estações acima da cota de atenção + alertas externos integrados</div>
        {todasAlertas.length === 0
          ? <div className="state" style={{ minHeight:160 }}><span>✓ Nenhuma estação em alerta no momento.</span></div>
          : <div className="al-cards">
              {todasAlertas.map(e => (
                <div key={e.nome} className="al-card" onClick={() => { setCidade(e.nome); setPagina('estacao'); }}>
                  <div className="al-card-dot" style={{ background:COR[e.cls] }}/>
                  <div style={{ flex:1 }}>
                    <div className="al-card-name">{e.nome}</div>
                    <div className="al-card-desc">{CFG[e.nome]?.rio} · {e.status}</div>
                  </div>
                  <div className="al-card-cota" style={{ color:COR[e.cls] }}>{e.cota.toFixed(2)} m</div>
                </div>
              ))}
            </div>
        }

        <div className="sec-ttl" style={{ marginTop:18 }}>Alertas das APIs integradas</div>
        <div className="sec-sub">ANA/SACE · INMET · CEMADEN · Open-Meteo</div>
        {alertasExternos.length === 0 ? (
          <div className="state" style={{ minHeight:160 }}><span>{loadingAlertas ? 'Consultando fontes externas…' : 'Nenhum alerta externo encontrado na última coleta.'}</span></div>
        ) : (
          <div className="alertas-integrados">
            {alertasExternos.slice(0, 10).map((a, idx) => (
              <div key={`${a.id}-${idx}`} className={`alerta-int-card rank-${a.nivel_rank || 1}`}>
                <div>
                  <div className="alerta-int-title">{a.titulo}</div>
                  <div className="alerta-int-desc">{a.descricao}</div>
                  <div className="alerta-int-meta">
                    <span className="meta-pill">{a.fonte}</span>
                    <span className="meta-pill">{a.municipio}/{a.uf}</span>
                    <span className="meta-pill">{a.tipo}</span>
                  </div>
                </div>
                <div className={`alerta-int-nivel rank-${a.nivel_rank || 1}`}>{a.nivel}</div>
              </div>
            ))}
          </div>
        )}
      </>
    );

    /* ═══ REDE DE ESTAÇÕES ═══════════════════════════════════════════════════ */
    if (pagina === 'rede') return (
      <>
        <div className="sec-ttl">Rede de Estações</div>
        <div className="sec-sub">Bacia Amazônica · {datasetsVisiveis.length} de {estacoes.length} municípios/estações visíveis</div>

        <FiltrosPainelMunicipios
          limiteMunicipios={limiteMunicipios}
          setLimiteMunicipios={setLimiteMunicipios}
          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}
          total={allDatasets.length}
          exibidos={redeOrdenada.length}
        />

        <div className="filtros-rede">
          <span className="filtro-lbl" style={{ marginRight:4 }}>Região:</span>
          {['todas', ...Object.keys(REGIOES)].map(r => (
            <button key={r} className={`filtro-chip${regiaoFiltro === r ? ' ativo' : ''}`} onClick={() => setRegiaoFiltro(r)}>
              {r === 'todas' ? 'Todas' : r}
            </button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            <span className="filtro-lbl">Ordenar:</span>
            <select className="filtro-sel" value={ordenacao} onChange={e => setOrdenacao(e.target.value)}>
              <option value="nome">Nome A–Z</option>
              <option value="cota-desc">Cota ↓ alta primeiro</option>
              <option value="cota-asc">Cota ↑ baixa primeiro</option>
              <option value="status">Status (crítico primeiro)</option>
            </select>
          </div>
        </div>

        <div className="est-row-hdr">
          <span>Estação / Rio</span>
          <span style={{ textAlign:'right' }}>Cota (m)</span>
          <span style={{ textAlign:'right' }}>Alerta (m)</span>
          <span style={{ textAlign:'right' }}>Var. dia</span>
          <span style={{ textAlign:'right' }}>% Máx.</span>
          <span>Fonte</span>
          <span style={{ textAlign:'right' }}>Status</span>
        </div>

        {redeOrdenada.length === 0 ? (
          <div className="state" style={{ minHeight:180 }}><span>Nenhum município encontrado para os filtros selecionados.</span></div>
        ) : regiaoFiltro === 'todas' ? (
          Object.entries(REGIOES).map(([regiao, nomes]) => {
            const itens = redeOrdenada.filter(d => nomes.includes(d.nome));
            if (!itens.length) return null;
            return (
              <div key={regiao}>
                <div className="regiao-label">{regiao}</div>
                <div className="est-card-grid">
                  {itens.map(d => <EstacaoRow key={d.nome} d={d} dados={dados} onClick={() => { setCidade(d.nome); setPagina('estacao'); }}/>)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="est-card-grid">
            {redeOrdenada
              .filter(d => REGIOES[regiaoFiltro]?.includes(d.nome))
              .map(d => <EstacaoRow key={d.nome} d={d} dados={dados} onClick={() => { setCidade(d.nome); setPagina('estacao'); }}/>)}
          </div>
        )}
      </>
    );

    /* ═══ LOG DE ATUALIZAÇÕES ════════════════════════════════════════════════ */
    if (pagina === 'log') return (
      <>
        <div className="log-header">
          <div>
            <div className="sec-ttl">Logs de Atualizações</div>
            <div className="sec-sub" style={{ marginBottom:0 }}>Histórico de coletas · {logEntries.length} registros</div>
          </div>
          <div className="log-filters">
            {[
              { v:'todas',       l:'Todas' },
              { v:'sace',        l:'SACE/SGB' },
              { v:'open-meteo',  l:'Open-Meteo' },
              { v:'fallback',    l:'Cache' },
            ].map(f => (
              <button key={f.v} className={`filtro-chip${logFiltroFonte === f.v ? ' ativo' : ''}`} onClick={() => setLogFiltroFonte(f.v)}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        <div className="log-summary-row">
          <div className="log-sum-card">
            <div className="log-sum-val" style={{ color:'var(--teal)' }}>{logEntries.filter(e => e.fonte === 'sace').length}</div>
            <div className="log-sum-lbl">Coletas SACE</div>
          </div>
          <div className="log-sum-card">
            <div className="log-sum-val" style={{ color:'var(--amber)' }}>{logEntries.filter(e => e.fonte === 'open-meteo').length}</div>
            <div className="log-sum-lbl">Open-Meteo</div>
          </div>
          <div className={`log-sum-card${cacheCount > 0 ? ' log-sum-alert' : ''}`}>
            <div className="log-sum-val" style={{ color: cacheCount > 0 ? 'var(--red)' : 'var(--muted)' }}>{cacheCount}</div>
            <div className="log-sum-lbl">Cache local {cacheCount > 0 ? '⚠' : ''}</div>
            {cacheCount > 0 && <div style={{ fontSize:9, color:'var(--red)', marginTop:4, fontFamily:'DM Mono,monospace' }}>SACE + Open-Meteo indisponíveis</div>}
          </div>
          <div className="log-sum-card">
            <div className="log-sum-val">{estacoes.length}</div>
            <div className="log-sum-lbl">Estações ativas</div>
          </div>
        </div>

        {logFiltrado.length === 0 ? (
          <div className="state"><span>Nenhum registro encontrado.</span></div>
        ) : (
          logFiltrado.map(entry => {
            const cls = entry.fonte === 'sace' ? 'sace' : entry.fonte === 'open-meteo' ? 'openmeteo' : 'fallback';
            const isFallback = entry.fonte === 'fallback';
            const { c } = classificar(entry.cota, CFG[entry.estacao]);
            const turnoC = { manha:'turno-manha', tarde:'turno-tarde', noite:'turno-noite' }[entry.turno] || 'turno-manha';
            const turnoL = { manha:'Manhã', tarde:'Tarde', noite:'Noite' }[entry.turno] || 'Manhã';
            const dataFmt = entry.data ? new Date(entry.data + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' }) : '—';
            const fonteC = entry.fonte === 'sace' ? 'fonte-sace' : entry.fonte === 'open-meteo' ? 'fonte-openmeteo' : 'fonte-fallback';
            const fonteL = { sace:'SACE/SGB', 'open-meteo':'Open-Meteo', fallback:'Cache' }[entry.fonte] || entry.fonte;
            return (
              <div key={entry.id} className={`log-entry${isFallback ? ' log-cache' : ''}`} onClick={() => { setCidade(entry.estacao); setPagina('estacao'); }}>
                <div className="log-dot-wrap">
                  <div className={`log-dot ${cls}`}/>
                </div>
                <div className="log-content">
                  <div className="log-top">
                    <span className="log-estacao">{entry.estacao}</span>
                    <span style={{ fontSize:10, color:'var(--muted)' }}>{entry.rio}</span>
                    <span className={`log-turno ${turnoC}`}>{turnoL}</span>
                    <span className={`fonte-badge ${fonteC}`}>{fonteL}</span>
                    <span className="log-ts">{dataFmt}</span>
                  </div>
                  <div className={`log-detail${isFallback ? ' log-detail-erro' : ''}`}>
                    {entry.fonte === 'sace'
                      ? `✓ Dados reais coletados via SACE/SGB · ${entry.registros} registros acumulados no período`
                      : entry.fonte === 'open-meteo'
                      ? `~ Estimativa via Open-Meteo (SACE indisponível) · ${entry.registros} registros`
                      : `⚠ Usando cache local — SACE e Open-Meteo indisponíveis · verificar conexão com as fontes`}
                  </div>
                </div>
                <div className="log-cota" style={{ color:COR[c] }}>
                  {entry.cota != null ? `${entry.cota.toFixed(2)} m` : '—'}
                </div>
              </div>
            );
          })
        )}
      </>
    );

    /* ═══ DASHBOARD ══════════════════════════════════════════════════════════ */
    if (pagina === 'dashboard') return (
      <>
        <div className="sec-ttl">Dashboard analítico</div>
        <div className="sec-sub">Visão consolidada · Bacia Amazônica</div>
        <FiltrosPainelMunicipios
          limiteMunicipios={limiteMunicipios}
          setLimiteMunicipios={setLimiteMunicipios}
          statusFiltro={statusFiltro}
          setStatusFiltro={setStatusFiltro}
          total={allDatasets.length}
          exibidos={datasetsVisiveis.length}
        />
        <div className="dash-kpi-row">
          <div className="dash-kpi"><div className="dash-kpi-lbl">Municípios/Estações</div><div className="dash-kpi-val" style={{ color:'var(--teal)' }}>{datasetsVisiveis.length}</div><div className="dash-kpi-sub">de {estacoes.length} na rede</div></div>
          <div className="dash-kpi"><div className="dash-kpi-lbl">Em alerta</div><div className="dash-kpi-val" style={{ color: emAlerta > 0 ? 'var(--red)' : 'var(--teal)' }}>{emAlerta}</div><div className="dash-kpi-sub">acima da cota</div></div>
          <div className="dash-kpi"><div className="dash-kpi-lbl">Em atenção</div><div className="dash-kpi-val" style={{ color: emAtencao > 0 ? 'var(--amber)' : 'var(--teal)' }}>{emAtencao}</div><div className="dash-kpi-sub">70–100%</div></div>
          <div className="dash-kpi"><div className="dash-kpi-lbl">Cota máxima</div><div className="dash-kpi-val">{overallMax.toFixed(2)}</div><div className="dash-kpi-sub">metros</div></div>
        </div>
        <div className="analytics-grid">
          <div className="card analytics-wide">
            <div className="card-hdr"><div><div className="card-ttl">Cota atual vs. cota de alerta</div><div className="card-sub">municípios filtrados</div></div></div>
            <div style={{ height:220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cotaBarData} margin={{ top:4, right:8, left:0, bottom:28 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--muted)', fontFamily:'DM Mono,monospace' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" interval={0}/>
                  <YAxis tick={{ fontSize:10, fill:'var(--muted)', fontFamily:'DM Mono,monospace' }} axisLine={false} tickLine={false} width={34}/>
                  <Tooltip content={<Tip/>}/>
                  <Bar dataKey="cota" name="Cota (m)" fill="var(--teal)" radius={[3,3,0,0]}/>
                  <Bar dataKey="alerta" name="Alerta (m)" fill="var(--amber)" fillOpacity={0.3} radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="analytics-grid">
          <div className="card">
            <div className="card-hdr"><div><div className="card-ttl">Variação diária (m)</div><div className="card-sub">subida/descida em 24h</div></div></div>
            <div style={{ height:180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={varData} margin={{ top:4, right:8, left:0, bottom:28 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--muted)', fontFamily:'DM Mono,monospace' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" interval={0}/>
                  <YAxis tick={{ fontSize:10, fill:'var(--muted)', fontFamily:'DM Mono,monospace' }} axisLine={false} tickLine={false} width={38}/>
                  <Tooltip content={<Tip/>}/>
                  <ReferenceLine y={0} stroke="var(--bordm)" strokeWidth={1}/>
                  <Bar dataKey="variacao" name="Var. (m)" radius={[3,3,0,0]} fill="var(--teal)"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-hdr">
              <div>
                <div className="card-ttl">Histórico — 30 dias</div>
                <div className="card-sub">
                  <select className="filtro-sel" style={{ padding:'2px 8px', fontSize:11 }} value={cidade} onChange={e => setCidade(e.target.value)}>
                    {estacoesVisiveis.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ height:180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={listaDash} margin={{ top:4, right:8, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--teal)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="data" tickFormatter={fmtD} tick={{ fontSize:10, fill:'var(--muted)', fontFamily:'DM Mono,monospace' }} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
                  <YAxis tick={{ fontSize:10, fill:'var(--muted)', fontFamily:'DM Mono,monospace' }} axisLine={false} tickLine={false} width={34} domain={['auto','auto']}/>
                  <Tooltip content={<Tip/>}/>
                  {cfgC && <ReferenceLine y={cfgC.cota_alerta} stroke="var(--amber)" strokeDasharray="3 3" strokeWidth={1.5}/>}
                  <Area type="monotone" dataKey="cota_m" name="Cota (m)" stroke="var(--teal)" strokeWidth={1.8} fill="url(#gradTeal)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </>
    );
  };

  const isMapaFull = pagina === 'mapa';
  const isHomeFull = pagina === 'home';

  return (
    <>
      <style>{css}</style>
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      <div className="shell">
        <aside className={`sidebar${sideOpen ? '' : ' closed'}`}>
          <div className="sid-logo" onClick={() => setPagina('home')}>
            <div className="sid-bzr-wrap"><LogoIcon size={32}/></div>
            <div className="sid-name">
              <div className="sid-wordmark">Fl<span className="sw">u</span>vi<span className="sb">AM</span></div>
              <div className="sid-sub">Monitor</div>
            </div>
          </div>
          <div className="sid-sec">
            <div className="sid-sec-lbl">Navegação</div>
            {NAV.map(n => (
              <button key={n.id} className={`nav-btn${pagina === n.id ? ' active' : ''}`} onClick={() => setPagina(n.id)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="nav-ico">
                  <path d={n.d}/>
                </svg>
                {n.label}
                {n.badge && alertCount > 0 && <span className="nav-badge">{alertCount}</span>}
              </button>
            ))}
          </div>
          <div className="sid-footer">
            <div className="sid-status">
              <span className={`s-dot${error ? ' off' : ''}`}/>
              <span className="s-txt">{error ? 'Offline' : 'Ao vivo'}</span>
              <span className="s-val">SACE/SGB</span>
            </div>
          </div>
        </aside>

        <div className="main">
          <div className="topbar">
            <button className="menu-btn" onClick={() => setSideOpen(o => !o)}>
              <span/><span/><span/>
            </button>
            <div className="topbar-info">
              <div className="topbar-sub">
                {estacoes.length} municípios/estações · {new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}
              </div>
            </div>
            <div className="topbar-right">
              {alertCount > 0 && <span className="badge b-red">⚠ {alertCount} alerta{alertCount > 1 ? 's' : ''}</span>}
              {loading && <div className="spinner" style={{ width:16, height:16 }}/>}
              <button className="btn-sm" onClick={() => setTema(t => t === 'dark' ? 'light' : 'dark')}>
                {tema === 'dark' ? '☀ Claro' : '◐ Escuro'}
              </button>
            </div>
          </div>

          {isHomeFull
            ? renderPage()
            : isMapaFull
              ? <div style={{ flex:1, position:'relative', overflow:'hidden' }}>{renderPage()}</div>
              : <div className="scroll">{renderPage()}</div>
          }

          <div className="footer">
            © 2026 FluviAM. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Componente de linha da rede ─────────────────────────────────────────── */
function EstacaoRow({ d, dados, onClick }) {
  const info = dados[d.nome] || {};
  const lista = info.dados || [];
  const prev = lista.length > 1 ? (lista[lista.length-2]?.cota_m ?? d.cota) : d.cota;
  const diff = d.cota - prev;
  const fonteC = d.fonte === 'sace' ? 'fonte-sace' : d.fonte === 'open-meteo' ? 'fonte-openmeteo' : d.fonte === 'ana' ? 'fonte-ana' : 'fonte-fallback';
  const fonteL = { sace:'SACE', 'open-meteo':'Open-Meteo', fallback:'Cache', ana:'ANA' }[d.fonte] || d.fonte;
  const statusBg = d.cls === 'd' ? 'var(--redL)' : d.cls === 'w' ? 'var(--amberL)' : 'var(--tealL)';
  const statusColor = { g:'var(--teal)', w:'var(--amber)', d:'var(--red)' }[d.cls];

  return (
    <div className="est-row-card" onClick={onClick}>
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span className="tbl-dot" style={{ background:statusColor, flexShrink:0 }}/>
          <span style={{ fontWeight:500, fontSize:12.5 }}>{d.nome}</span>
        </div>
        <div style={{ fontSize:10.5, color:'var(--muted)', marginLeft:14 }}>{CFG[d.nome]?.rio || '—'}</div>
      </div>
      <div className="est-num">{d.cota.toFixed(2)}</div>
      <div className="est-num" style={{ color:'var(--muted)' }}>{CFG[d.nome]?.cota_alerta?.toFixed(2) || '—'}</div>
      <div className="est-num" style={{ color: diff > 0 ? 'var(--red)' : diff < 0 ? 'var(--green)' : 'var(--muted)' }}>
        {diff > 0 ? '+' : ''}{diff.toFixed(2)}
      </div>
      <div className="est-num" style={{ color: d.pct > 90 ? 'var(--red)' : d.pct > 70 ? 'var(--amber)' : 'var(--teal)' }}>
        {d.pct}%
      </div>
      <div><span className={`fonte-badge ${fonteC}`}>{fonteL}</span></div>
      <div style={{ textAlign:'right' }}>
        <span className="est-status-badge" style={{ background:statusBg, color:statusColor }}>{d.status}</span>
      </div>
    </div>
  );
}
