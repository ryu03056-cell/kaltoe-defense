// 칼퇴 디펜스 — 오프라인 저장(서비스 워커) v14.4
// 한 번 접속하면 게임 파일을 폰에 저장해 두고, 인터넷이 끊겨도 실행되게 함
// 저장 목록은 손으로 적지 않음: index.html 이 불러오는 파일 + 그림 목록(manifest.json)을 읽어서 자동으로 만듦
// 새 버전을 올렸을 때
//   · index.html · 그림 목록 · assets_list.js : 항상 인터넷 먼저 (끊겼을 때만 저장본)
//   · 해시(?v=…)가 붙은 그림 : 저장본 먼저 (내용이 바뀌면 해시가 바뀌므로 안전)
//   · 나머지 js·css : 저장본으로 바로 띄우고 뒤에서 새로 받아 둠 → 다음 실행 때 반영
// 저장소 이름(VER)을 바꾸면 옛 저장본은 전부 지워짐
const VER = 'kt-v14.12';
const DIRS = ['pixel', 'mob', 'bg'];

async function precache() {
  const c = await caches.open(VER);
  const urls = new Set(['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png']);
  try {
    const html = await (await fetch('index.html', { cache: 'no-cache' })).text();
    for (const m of html.matchAll(/(?:src|href)="([^"#:]+)"/g)) urls.add(m[1]);
  } catch (e) {}
  for (const d of DIRS) {
    try {
      const j = await (await fetch(d + '/manifest.json', { cache: 'no-cache' })).json();
      const files = Array.isArray(j) ? j : (j.files || []), v = (!Array.isArray(j) && j.v) || {};
      urls.add(d + '/manifest.json');
      files.forEach(n => urls.add(d + '/' + n + '.png' + (v[n] ? '?v=' + v[n] : '')));
    } catch (e) {}
  }
  // 하나가 실패해도 나머지는 저장 (설치 자체가 막히지 않게)
  await Promise.allSettled([...urls].map(u => c.add(new Request(u, { cache: 'no-cache' }))));
}

self.addEventListener('install', e => { e.waitUntil(precache().then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req, key, fresh) {
  const c = await caches.open(VER);
  try {
    const r = await (fresh ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(req));
    if (r && r.ok) c.put(key || req, r.clone());
    return r;
  } catch (e) {
    return (await c.match(key || req)) || (await c.match(key || req, { ignoreSearch: true })) || Response.error();
  }
}
async function cacheFirst(req) {
  const c = await caches.open(VER);
  const hit = await c.match(req);
  if (hit) return hit;
  const r = await fetch(req);
  if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone());
  return r;
}
async function staleWhileRevalidate(req, ev) {
  const c = await caches.open(VER);
  const hit = await c.match(req);
  const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => null);
  if (hit) { ev.waitUntil(net); return hit; }
  return (await net) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  // 글꼴(Jua)
  if (u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com') { e.respondWith(staleWhileRevalidate(req, e)); return; }
  if (u.origin !== location.origin) return;
  if (req.mode === 'navigate') { e.respondWith(networkFirst(req, 'index.html', true)); return; }   // v14.9.1: 브라우저 캐시(최대 10분)에 옛 화면이 남지 않게
  const p = u.pathname;
  if (p.endsWith('/manifest.json') || p.endsWith('/assets_list.js') || p.endsWith('.webmanifest')) { e.respondWith(networkFirst(req)); return; }
  if (p.endsWith('.png') && u.searchParams.has('v')) { e.respondWith(cacheFirst(req)); return; }
  e.respondWith(staleWhileRevalidate(req, e));
});
