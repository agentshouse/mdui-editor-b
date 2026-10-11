import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
fs.mkdirSync('.build/public',{recursive:true});
const root=process.cwd();const hash=b=>createHash('sha256').update(b).digest('hex');
const donor=JSON.parse(fs.readFileSync('licenses/plate-source-map.json','utf8'));
for(const file of donor.files)assert.equal(hash(fs.readFileSync(file.vendored)),file.sha256,file.vendored);
const notices=['EDITOR-B — THIRD PARTY NOTICES\nPlate public text/block kit adapted for House Room storage. Source: https://github.com/udecode/plate/tree/45aee8fd81a596fad5efc4e61ab377bb225fb11c\nNo paid, AI, Excalidraw, media upload or collaboration transport code is retained. Registry source adaptations and original samples are inventoried in licenses/plate-source-map.json.'];
for(const file of [...donor.licenseFiles,'licenses/CC-BY-4.0.txt','licenses/starter-html-attribution.txt'])notices.push(`\n${file}\n${fs.readFileSync(file,'utf8')}`);
const supplements=JSON.parse(fs.readFileSync('licenses/license-supplements.json','utf8'));
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));const packages=[],missing=[];
for(const [relative,entry]of Object.entries(lock.packages)){
 if(!relative||entry.dev)continue;const dir=path.join(root,relative);if(!fs.existsSync(path.join(dir,'package.json'))){if(!entry.optional)missing.push(relative);continue;}
 const pkg=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8'));assert(!/elkjs|excalidraw|mermaid/.test(pkg.name),`Excluded dependency ${pkg.name}`);
 const files=fs.readdirSync(dir).filter(n=>/^(licen[cs]e|notice|copying|copyright|ofl|thirdpartynotice)/i.test(n)&&fs.statSync(path.join(dir,n)).isFile());
 packages.push({name:pkg.name,version:pkg.version,license:pkg.license,files});notices.push(`\n${'='.repeat(72)}\n${pkg.name}@${pkg.version}\nDeclared license: ${pkg.license}\n`);
 if(!files.length){const supplement=supplements.find(x=>x.name===pkg.name&&x.version===pkg.version);if(!supplement)missing.push(`${pkg.name}@${pkg.version}`);else {const body=fs.readFileSync(supplement.file);assert.equal(hash(body),supplement.sha256);notices.push(`Source: ${supplement.source}\n${supplement.provenanceNote??''}\n${body}`);}};for(const file of files)notices.push(fs.readFileSync(path.join(dir,file),'utf8'));
}
fs.writeFileSync('.build/public/THIRD_PARTY_NOTICES.txt',notices.join('\n'));fs.writeFileSync('.build/license-audit.json',JSON.stringify({packages,missing},null,2)+'\n');console.log({packages:packages.length,missing});assert.equal(missing.length,0,'Missing exact dependency license text');
