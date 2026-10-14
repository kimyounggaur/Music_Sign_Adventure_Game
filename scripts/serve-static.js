'use strict';
// Local review server; uses only Node's built-in modules.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..',process.argv.includes('--dist')?'dist':'.');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};
http.createServer((req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/asset-review.html':pathname));
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const bytes=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('File not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Harmonia review: http://127.0.0.1:${port}/asset-review.html`));
