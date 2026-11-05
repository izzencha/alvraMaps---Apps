const C="alvra-v8",T="alvra-tiles";let puts=0;
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","logo.png"])).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function trim(c,max){const k=await c.keys();if(k.length>max)await Promise.all(k.slice(0,k.length-max).map(x=>c.delete(x)))}
async function mapHandler(req){
  const c=await caches.open(T),hit=await c.match(req),isTile=/\.(pbf|mvt|png|webp|jpg)(\?|$)/.test(req.url);
  if(hit&&isTile)return hit;
  try{const r=await fetch(req);if(r.ok){c.put(req,r.clone());if(isTile&&++puts%60===0)trim(c,6000)}return r}
  catch(err){if(hit)return hit;throw err}
}
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.hostname==="tiles.openfreemap.org"){e.respondWith(mapHandler(e.request));return}
  if(u.origin!==location.origin&&u.hostname!=="cdn.jsdelivr.net")return;
  e.respondWith(caches.open(C).then(async c=>{
    const hit=await c.match(e.request);
    const net=fetch(e.request).then(r=>{if(r.ok||r.type==="opaque")c.put(e.request,r.clone());return r}).catch(()=>hit);
    return hit||net;
  }));
});
