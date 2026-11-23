const CACHE='azokara-v86-test';
const HOME=new URL('./index.html',self.location.href).href;
const ROOT=new URL('./',HOME).href;
const PHOTO_CACHE='azoka-photos-v1';
const isPhoto=u=>u.protocol==='https:'&&u.hostname==='www.turismodurango.net'&&u.pathname.startsWith('/documents/');
function photoKey(u){const key=new URL(u.href);key.searchParams.delete('azoka-retry');return key.href;}
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.add(new Request(HOME,{cache:'reload'}));await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;if(r.mode==='navigate'&&u.origin===self.location.origin&&[new URL(HOME).pathname,new URL(ROOT).pathname].includes(u.pathname)){e.respondWith((async()=>{const c=await caches.open(CACHE);const saved=await c.match(HOME);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),saved?4500:15000);try{const response=await fetch(r,{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('HTTP '+response.status);try{await c.put(HOME,response.clone())}catch{}return response}catch{return saved||Response.error()}finally{clearTimeout(timer)}})());return}if(r.destination==='image'&&isPhoto(u)){e.respondWith((async()=>{
 const c=await caches.open(PHOTO_CACHE);
 const saved=await c.match(r)||await c.match(photoKey(u))||await caches.match(r,{cacheName:'azokara-v38'});
 if(saved)return saved;
 for(const name of await caches.keys()){if(!name.startsWith('azokara-'))continue;const old=await caches.open(name);const hit=await old.match(r);if(hit){try{await c.put(r,hit.clone())}catch{}return hit}}
 const response=await fetch(r);if(response.ok||response.type==='opaque'){try{await c.put(r,response.clone())}catch{}}return response;
})())}});
