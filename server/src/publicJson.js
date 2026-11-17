import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { BlockList, isIP } from 'node:net';

const blocked = new BlockList();
for (const [address, prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.168.0.0',16],['192.88.99.0',24],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',3]]) blocked.addSubnet(address,prefix,'ipv4');
const global6 = new BlockList(); global6.addSubnet('2000::',3,'ipv6');
for (const [address,prefix] of [['2001::',23],['2001:db8::',32],['2002::',16],['3fff::',20]]) blocked.addSubnet(address,prefix,'ipv6');
export function publicAddress(address) {
  const family=isIP(address);
  return family===4 ? !blocked.check(address,'ipv4') : family===6 && global6.check(address,'ipv6') && !blocked.check(address,'ipv6');
}

/** Dependency injection is for isolated tests only. Production always uses real DNS/TLS. */
export function createPublicJsonReader({ resolve=lookup, connect=request, timeout=4000, maxBytes=65536 }={}) {
  return async function readPublicJson(input) {
    const url=new URL(input);
    if(url.protocol!=='https:' || url.username || url.password || (url.port && url.port!=='443')) throw Error('Availability requires a public HTTPS URL on port 443.');
    const hostname=url.hostname.replace(/^\[|\]$/g,'');
    if(isIP(hostname) && !publicAddress(hostname)) throw Error('Private destination refused.');
    let timer, req, expired=false;
    const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;req?.destroy();reject(Error('Availability timeout'));},timeout);});
    const work=(async()=>{
      const addresses=isIP(hostname)?[{address:hostname,family:isIP(hostname)}]:await resolve(hostname,{all:true,verbatim:true});
      if(expired) throw Error('Availability timeout');
      if(!addresses.length || addresses.some(({address})=>!publicAddress(address))) throw Error('Private destination refused.');
      const pinned=addresses[0];
      return new Promise((accept,reject)=>{
        req=connect(url,{agent:false,headers:{accept:'application/json','accept-encoding':'identity'},lookup:(_host,options,done)=>options?.all ? done(null,[pinned]) : done(null,pinned.address,pinned.family)},res=>{
          if(res.statusCode!==200 || (res.headers['content-encoding'] && res.headers['content-encoding']!=='identity') || Number(res.headers['content-length'])>maxBytes){res.destroy();reject(Error('Availability response refused.'));return;}
          const chunks=[];let bytes=0;
          res.on('data',chunk=>{bytes+=chunk.length;if(bytes>maxBytes){res.destroy();reject(Error('Availability response too large.'));}else chunks.push(chunk);});
          res.on('error',reject);res.on('aborted',()=>reject(Error('Availability response interrupted.')));
          res.on('end',()=>{try{accept(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch(error){reject(error);}});
        });
        req.on('error',reject);req.end();
      });
    })();
    try{return await Promise.race([work,deadline]);}finally{clearTimeout(timer);req?.destroy();}
  };
}
export const readPublicJson=createPublicJsonReader();
