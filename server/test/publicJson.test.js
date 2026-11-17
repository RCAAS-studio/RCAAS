import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import {createPublicJsonReader,publicAddress} from '../src/publicJson.js';

test('only public unicast IPs pass, including mapped/encoded and IPv6 cases',()=>{
  for(const ip of ['127.0.0.1','10.0.0.1','169.254.169.254','100.64.0.1','192.168.1.1','198.18.0.1','224.0.0.1','255.255.255.255','::1','::ffff:127.0.0.1','fc00::1','fe80::1','2001:db8::1','2002:7f00:1::','invalid'])assert.equal(publicAddress(ip),false,ip);
  for(const ip of ['8.8.8.8','1.1.1.1','2606:4700:4700::1111'])assert.equal(publicAddress(ip),true,ip);
});
const resolve=async()=>[{address:'8.8.8.8',family:4}];
function transport(body,{status=200,headers={},inspect=()=>{}}={}) {
  return (url,options,reply)=>{
    inspect(url,options);const req=new EventEmitter();req.destroy=()=>{};
    req.end=()=>queueMicrotask(()=>{const res=new PassThrough();res.statusCode=status;res.headers=headers;reply(res);if(!res.destroyed)res.end(body);});return req;
  };
}
test('private DNS and mixed answers never create a socket',async()=>{
  for(const addresses of [[{address:'127.0.0.1',family:4}],[...await resolve(),{address:'::1',family:6}]]){
    const read=createPublicJsonReader({resolve:async()=>addresses,connect:()=>assert.fail('socket must not open')});
    await assert.rejects(read('https://engine.example/availability'),/Private/);
  }
});
test('URL credentials, nonstandard ports, protocols and encoded private literals are rejected',async()=>{
  const read=createPublicJsonReader({connect:()=>assert.fail('no socket')});
  for(const url of ['http://example.com','https://user:pass@example.com','https://example.com:444','https://2130706433','https://[::ffff:127.0.0.1]'])await assert.rejects(read(url));
});
test('TLS destination stays the hostname while lookup returns only the validated address',async()=>{
  let lookups=0;
  const read=createPublicJsonReader({resolve:async()=>{lookups++;return resolve();},connect:transport('{"booked":[]}',{inspect:(url,options)=>{
    assert.equal(url.hostname,'engine.example');assert.equal(options.agent,false);assert.equal(options.rejectUnauthorized,undefined);
    options.lookup('engine.example',{},(error,address,family)=>{assert.equal(error,null);assert.equal(address,'8.8.8.8');assert.equal(family,4);});
    options.lookup('engine.example',{all:true},(error,addresses)=>assert.deepEqual(addresses,[{address:'8.8.8.8',family:4}]));
  }})});
  assert.deepEqual(await read('https://engine.example'),{booked:[]});assert.equal(lookups,1);
});
test('redirects, encoded responses, malformed JSON and streaming size overflow fail closed',async()=>{
  for(const [body,options] of [['{}',{status:302}],['{}',{headers:{'content-encoding':'gzip'}}],['{',{}],['x'.repeat(65),{}],['{}',{headers:{'content-length':'100'}}]]){
    const read=createPublicJsonReader({resolve,connect:transport(body,options),maxBytes:64});await assert.rejects(read('https://engine.example'));
  }
});
test('deadline includes DNS and a late resolution cannot open a connection',async()=>{
  let complete;
  const read=createPublicJsonReader({timeout:15,resolve:()=>new Promise(done=>{complete=done;}),connect:()=>assert.fail('late socket')});
  await assert.rejects(read('https://engine.example'),/timeout/);complete(await resolve());await new Promise(done=>setImmediate(done));
});
test('deadline also aborts a stalled response',async()=>{
  let destroyed=false;
  const read=createPublicJsonReader({resolve,timeout:15,connect:()=>{const req=new EventEmitter();req.end=()=>{};req.destroy=()=>{destroyed=true;};return req;}});
  await assert.rejects(read('https://engine.example'),/timeout/);assert.equal(destroyed,true);
});
