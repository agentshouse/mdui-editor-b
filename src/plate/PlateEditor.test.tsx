// @vitest-environment jsdom
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent, act } from '@testing-library/react';
import { PlateEditor, EditorToolbar, platePlugins, validatePlateValue, type Value } from './PlateEditor';
import { Plate, createPlateEditor } from 'platejs/react';
import { toggleCodeBlock } from '@platejs/code-block';
import { upsertLink } from '@platejs/link';
import { Editor } from './ui/editor';
import { TooltipProvider } from './components/tooltip';
import sample from '../../samples/plate-basic-blocks.json';
const value: Value = [{ type: 'p', custom: { retained: true }, children: [{ text: 'Hello Plate', bold: true }] }];
describe('Retained public Plate registry', () => {
  it('renders public editor, mark/list controls and supplied tree', () => {
    render(<PlateEditor value={value} onChange={vi.fn()} />);
    expect(screen.getByText('Hello Plate').closest('strong')).not.toBeNull();
    expect(screen.getByLabelText('Bold')).toBeDefined();
    expect(screen.getByLabelText('Task list')).toBeDefined();
    expect(screen.getByLabelText('Block type')).toBeDefined();
    cleanup();
  });
  it('redraws external JSON changes and keeps unknown data intact', async () => {
    const original = JSON.stringify(value);
    const view = render(<PlateEditor value={value} onChange={vi.fn()} />);
    view.rerender(<PlateEditor value={[{ type: 'h2', children: [{ text: 'Replacement' }] }]} onChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('Replacement').closest('h2')).not.toBeNull());
    expect(JSON.stringify(value)).toBe(original);
    cleanup();
  });
  it('renders the actual nested public sample in read-only mode', () => {
    render(<PlateEditor value={sample as Value} onChange={vi.fn()} readOnly />);
    expect(screen.getByText('Nested blockquotes keep reply chains readable.').closest('blockquote')?.parentElement?.closest('blockquote')).not.toBeNull();
    expect(screen.queryByLabelText('Article formatting')).toBeNull();
    cleanup();
  });
});

describe('Native typed editing operations', () => {
  it('retains unknown block and leaf fields while applying marks and undo', () => {
    const editor = createPlateEditor({ plugins: platePlugins, value: [{ type: 'p', externalId: 'keep-me', children: [{ text: 'Edit me', customLeaf: 7 }] }] });
    editor.tf.select({ anchor: { path: [0,0], offset: 0 }, focus: { path: [0,0], offset: 7 } });
    editor.tf.toggleMark('italic');
    expect(editor.children[0].externalId).toBe('keep-me');
    expect(editor.children[0].children[0]).toMatchObject({ italic: true, customLeaf: 7 });
    editor.undo();
    expect(editor.children[0].children[0]).toMatchObject({ text: 'Edit me', customLeaf: 7 });
  });
  it('creates typed code and link nodes, without stringifying document data', () => {
    const editor = createPlateEditor({ plugins: platePlugins, value: [{ type: 'p', children: [{ text: 'Example' }] }] });
    editor.tf.select({ anchor: { path: [0,0], offset: 0 }, focus: { path: [0,0], offset: 7 } });
    upsertLink(editor, { url: 'https://example.com' });
    expect(editor.children[0].children).toContainEqual(expect.objectContaining({ type: 'a', url: 'https://example.com' }));
    const codeEditor = createPlateEditor({ plugins: platePlugins, value: [{ type: 'p', children: [{ text: 'const n = 1;' }] }] });
    codeEditor.tf.select({ path: [0,0], offset: 0 });
    toggleCodeBlock(codeEditor);
    expect(codeEditor.children[0].type).toBe('code_block');
    expect(codeEditor.children[0].children[0]).toMatchObject({ type: 'code_line' });
  });
});

describe('Actual toolbar controls', () => {
  async function setup() {
    const editor = createPlateEditor({ plugins: platePlugins, value: [{ type: 'p', children: [{ text: 'Toolbar text' }] }] });
    render(<TooltipProvider><Plate editor={editor}><EditorToolbar /><Editor /></Plate></TooltipProvider>);
    await act(async () => { editor.tf.select({ anchor: { path: [0,0], offset: 0 }, focus: { path: [0,0], offset: 12 } }); });
    return editor;
  }
  it('toggles bold with real button, then undo and redo', async () => {
    const editor = await setup();
    fireEvent.click(screen.getByLabelText('Bold'));
    expect(editor.children[0].children[0]).toMatchObject({ bold: true });
    await waitFor(() => expect((screen.getByLabelText('Undo') as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByLabelText('Undo'));
    expect(editor.children[0].children[0]).not.toHaveProperty('bold');
    await waitFor(() => expect((screen.getByLabelText('Redo') as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByLabelText('Redo'));
    expect(editor.children[0].children[0]).toMatchObject({ bold: true }); cleanup();
  });
  it('uses heading dropdown and list toolbar to create typed blocks', async () => {
    const editor = await setup();
    fireEvent.change(screen.getByLabelText('Block type'), { target: { value: 'h2' } });
    expect(editor.children[0].type).toBe('h2');
    fireEvent.click(screen.getByLabelText('Bulleted list'));
    expect(editor.children[0].type).toBe('ul'); cleanup();
  });
  it('creates a task list and changes its actual checkbox', async () => {
    const editor = await setup();
    fireEvent.click(screen.getByLabelText('Task list'));
    await waitFor(() => expect(screen.getByRole('checkbox')).toBeDefined());
    fireEvent.click(screen.getByRole('checkbox'));
    expect(JSON.stringify(editor.children)).toContain('"checked":true'); cleanup();
  });
  it('inserts a code block from the toolbar', async () => {
    const editor = await setup();
    fireEvent.click(screen.getByLabelText('Code block'));
    expect(editor.children[0].type).toBe('code_block'); cleanup();
  });
  it('applies a URL through the link form and rejects unsafe protocols', async () => {
    const editor = await setup();
    fireEvent.click(screen.getByLabelText('Link'));
    fireEvent.change(screen.getByLabelText('Link URL'), { target: { value: 'javascript:alert(1)' } });
    fireEvent.click(screen.getByText('Apply link'));
    expect(screen.getByRole('alert')).toBeDefined();
    fireEvent.change(screen.getByLabelText('Link URL'), { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByText('Apply link'));
    expect(editor.children[0].children).toContainEqual(expect.objectContaining({ type: 'a', url: 'https://example.com' })); cleanup();
  });
});

describe('Malformed tree and observation safety', () => {
  it('rejects malformed structural inputs while preserving unknown JSON metadata', () => {
    for (const invalid of [null, {}, [], [{text:'root leaf'}], [{type:'p',children:[]}], [{type:'p',children:[{}]}], [{type:'p',children:[{text:42}]}]]) expect(validatePlateValue(invalid)).toBe(false);
    expect(validatePlateValue(value)).toBe(true);
    render(<PlateEditor value={[{type:'p',children:[{}]}] as Value} onChange={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeDefined(); cleanup();
  });
  it('does not restage the asynchronous echo of external setValue', async () => {
    const onChange = vi.fn();
    const view = render(<PlateEditor value={value} onChange={onChange} />);
    await act(async () => { view.rerender(<PlateEditor value={[{type:'p',children:[{text:'Observed remote update'}]}]} onChange={onChange} />); });
    await waitFor(() => expect(screen.getByText('Observed remote update')).toBeDefined());
    expect(onChange).not.toHaveBeenCalled(); cleanup();
  });
});
