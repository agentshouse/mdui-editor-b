import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
const pinned=JSON.parse(readFileSync(new URL('../tests/support/disabled-storage-accessors.json',import.meta.url),'utf8')) as {path:string;sha256:string}[];
/** Plate store helpers expose opt-in browser persistence even though no retained
 * kit enables it. Remove those accessors from production, failing closed if any
 * future kit tries them; never substitute a recovery store. */
export function storageBoundary():Plugin{return{name:'house-only-storage',enforce:'pre',transform(code,id){const row=pinned.find(row=>id.replaceAll('\\','/').endsWith('/'+row.path));if(!row)return null;if(createHash('sha256').update(code).digest('hex')!==row.sha256)throw new Error('Storage-boundary upstream bytes changed: '+id);return code.replaceAll('window.localStorage','(() => { throw new Error("Browser persistence is disabled; use native House Room drafts."); })()');}};}
