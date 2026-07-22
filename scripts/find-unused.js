const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walk(dir, exts, acc = []){
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for(const e of entries){
    const full = path.join(dir, e.name);
    if(e.isDirectory()){
      if(e.name === 'node_modules' || e.name === '.git') continue;
      walk(full, exts, acc);
    } else if(exts.includes(path.extname(e.name))){
      acc.push(full);
    }
  }
  return acc;
}

const roots = ['frontend/src', 'backend/src'];
const exts = ['.js', '.vue', '.ts', '.jsx', '.mjs', '.cjs'];
const cwd = process.cwd();
let files = [];
for(const r of roots){
  const p = path.join(cwd, r);
  if(fs.existsSync(p)) files = files.concat(walk(p, exts, []));
}

function rel(p){ return path.relative(cwd, p).replace(/\\/g, '/'); }

const candidates = [];
for(const f of files){
  try{
    const base = path.basename(f, path.extname(f));
    // search for basename occurrences
    const cmd = `git grep -n -F "${base}" || true`;
    const out = execSync(cmd, { encoding: 'utf8' });
    const lines = out.split('\n').filter(Boolean);
    const filesMentioned = new Set(lines.map(l => l.split(':')[0]));
    // remove the file itself
    filesMentioned.delete(rel(f));
    if(filesMentioned.size === 0){
      candidates.push(rel(f));
    }
  }catch(e){
    // ignore
  }
}

const report = [`Found ${candidates.length} candidate unused files (heuristic by basename):`, ...candidates].join('\n');
fs.writeFileSync(path.join(cwd, 'scripts', 'unused-candidates.txt'), report, 'utf8');
console.log(report);
