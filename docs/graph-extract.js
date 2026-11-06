const fs=require("fs"),path=require("path");
const root=process.cwd();
function walk(d,out=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){
  if(e.name==="node_modules"||e.name===".next"||e.name===".git")continue;
  const p=path.join(d,e.name);
  if(e.isDirectory())walk(p,out);else if(/\.(tsx?|mjs)$/.test(e.name))out.push(p);}
  return out;}
const files=walk(root);
const rel=f=>path.relative(root,f);
const nodes={};
for(const f of files){
  const src=fs.readFileSync(f,"utf8");
  const imports=[];
  for(const m of src.matchAll(/from\s+["']([^"']+)["']/g))imports.push(m[1]);
  const exports=[...src.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class)\s+(\w+)/g)].map(m=>m[1]);
  const clients=/["']use client["']/.test(src);
  nodes[rel(f)]={imports,exports,clients,lines:src.split("\n").length};
}
// resolve alias @/ -> root
const resolve=(from,spec)=>{
  if(!spec.startsWith("@/"))return null;
  const base=path.join(root,spec.slice(2));
  for(const ext of [".tsx",".ts",".js"]) if(fs.existsSync(base+ext))return path.relative(root,base+ext);
  if(fs.existsSync(path.join(base,"index.tsx")))return path.relative(root,path.join(base,"index.tsx"));
  return null;
};
const edges=[];
for(const [f,n] of Object.entries(nodes))
  for(const s of n.imports){const t=resolve(f,s); if(t&&nodes[t])edges.push([f,t]);}
console.log(JSON.stringify({nodes,edges},null,0));
