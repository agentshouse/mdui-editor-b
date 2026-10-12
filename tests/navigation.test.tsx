import React from 'react';
import {afterEach,expect,it,vi} from 'vitest';
import {render,screen,cleanup,fireEvent,waitFor,act} from '@testing-library/react';
import {houseBridge} from '@agentshouse/app-bridge';
import {createHouseBridgeTestHost} from '@agentshouse/app-bridge/test-host';
import {App} from '../src/App';
import {ArticleStore,type Fields} from '../src/data/house';
import {ArticleNavigation,articleAddress,readArticleAddress} from '../src/navigation';
import {fakeRuntime} from './fakeRuntime';
const fields:Fields={title:'First',content:'[{"type":"p","children":[{"text":"Original"}]}]',archived:false,source_url:'',source_revision:'',author:'',license:''};
const first={room:'r_one',path:'plate/one.md',type:'plate_article',fields};
const second={...first,path:'plate/two.md',fields:{...fields,title:'Second'}};
const target=(path=second.path)=>({room:'r_one',path,view:'source' as const});
afterEach(cleanup);
function setup(address:string|null=articleAddress(target())){
 const fake=fakeRuntime([first,second]);const store=new ArticleStore(async()=>fake.runtime);
 const host=createHouseBridgeTestHost(address===null?{}:{address});const nav=new ArticleNavigation(houseBridge());
 return {...fake,store,host,nav};
}
it('accepts only bounded article identity and optional source view',()=>{
 expect(readArticleAddress(articleAddress(target())).target).toEqual(target());
 for(const url of ['/articles?room=r&path=../x','//host','/articles?room=r&path=p&view=admin','/articles?room=r&path=p&text=secret','/articles?room=r&path=p&path=q'])expect(readArticleAddress(url).error).toBeTruthy();
});
it('cold source link selects its article, preserves raw drafts through Back and remount, and never saves',async()=>{
 const f=setup();const mounted=render(<App store={f.store} navigation={f.nav}/>);
 const input=await screen.findByLabelText('Raw document JSON');expect((screen.getByLabelText('Document title') as HTMLInputElement).value).toBe('Second');
 fireEvent.change(input,{target:{value:'[unfinished'}});
 await waitFor(()=>expect(f.drafts.get('r_one/plate/two.md')?.parts.fields?.content.value).toBe('[unfinished'));
 await act(async()=>f.host.open(articleAddress(target(first.path))));
 await waitFor(()=>expect((screen.getByLabelText('Document title') as HTMLInputElement).value).toBe('First'));
 await act(async()=>f.host.open(articleAddress(target())));
 await waitFor(()=>expect((screen.getByLabelText('Raw document JSON') as HTMLTextAreaElement).value).toBe('[unfinished'));
 expect(f.host.navigations).toHaveLength(0);expect(f.raw.save).not.toHaveBeenCalled();
 mounted.unmount();const store=new ArticleStore(async()=>f.runtime);render(<App store={store} navigation={f.nav}/>);
 await waitFor(()=>expect((screen.getByLabelText('Raw document JSON') as HTMLTextAreaElement).value).toBe('[unfinished'));expect(f.raw.save).not.toHaveBeenCalled();
});
it('missing and wrong-Room targets never fall back or create a document',async()=>{
 const f=setup(articleAddress({room:'r_other',path:first.path}));render(<App store={f.store} navigation={f.nav}/>);
 await screen.findByRole('alert');expect(screen.queryByLabelText('Document title')).toBeNull();expect(f.raw.roomDraft.write).not.toHaveBeenCalled();
 await act(async()=>f.host.open(articleAddress(target())));await screen.findByLabelText('Document title');expect(f.raw.save).not.toHaveBeenCalled();
});
it('document and view clicks update the House address while typing adds no history',async()=>{
 const f=setup();render(<App store={f.store} navigation={f.nav}/>);await screen.findByLabelText('Raw document JSON');
 fireEvent.click(screen.getByRole('button',{name:/First.*Article/}));
 await waitFor(()=>expect(f.nav.snapshot().target).toEqual({room:'r_one',path:first.path}));
 fireEvent.click(screen.getByRole('button',{name:'JSON source'}));
 await waitFor(()=>expect(f.nav.snapshot().target).toEqual(target(first.path)));
 const count=f.host.navigations.length;fireEvent.change(screen.getByLabelText('Document title'),{target:{value:'Changed title'}});
 await waitFor(()=>expect(f.raw.roomDraft.write).toHaveBeenCalled());expect(f.host.navigations).toHaveLength(count);expect(f.raw.save).not.toHaveBeenCalled();
});
it('waits for a delayed query before diagnosing a deep link as missing',async()=>{
 const f=setup();const observe=f.raw.observe.getMockImplementation()!;let release:()=>void=()=>{};const hold=new Promise<void>(resolve=>{release=resolve;});
 f.raw.observe.mockImplementation(async(...args)=>{if(args[0]==='query')await hold;return observe(...args);});
 render(<App store={f.store} navigation={f.nav}/>);await waitFor(()=>expect(f.raw.observe).toHaveBeenCalledWith('query',expect.anything()));
 expect(f.store.snapshot().loaded).toBe(false);expect(screen.queryByRole('alert')).toBeNull();
 await act(async()=>release());await screen.findByLabelText('Raw document JSON');expect(f.host.navigations).toHaveLength(0);
});
it('a new-document completion cannot replace a newer host selection',async()=>{
 const f=setup();render(<App store={f.store} navigation={f.nav}/>);await screen.findByLabelText('Raw document JSON');
 let release:()=>void=()=>{};const hold=new Promise<void>(resolve=>{release=resolve;});const create=f.store.create.bind(f.store);vi.spyOn(f.store,'create').mockImplementation(async()=>{await hold;return create();});
 fireEvent.click(screen.getByRole('button',{name:/New document/}));await act(async()=>f.host.open(articleAddress(target(first.path))));await act(async()=>release());
 await waitFor(()=>expect(f.store.snapshot().articles).toHaveLength(3));expect((screen.getByLabelText('Document title') as HTMLInputElement).value).toBe('First');expect(f.host.navigations).toHaveLength(0);
});
