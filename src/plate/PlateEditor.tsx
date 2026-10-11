import * as React from 'react';
import { type Value, KEYS } from 'platejs';
import { Plate, usePlateEditor, useEditorRef, useEditorSelector } from 'platejs/react';
import { toggleCodeBlock } from '@platejs/code-block';
import { upsertLink, unwrapLink } from '@platejs/link';
import { Bold, Italic, Underline, Strikethrough, Code, Highlighter, Link2, Unlink, Quote } from 'lucide-react';
import { BasicBlocksKit } from './plugins/basic-blocks-kit';
import { BasicMarksKit } from './plugins/basic-marks-kit';
import { ListKit } from './plugins/list-classic-kit';
import { CodeBlockKit } from './plugins/code-block-kit';
import { LinkKit } from './plugins/link-kit';
import { Editor, EditorContainer } from './ui/editor';
import { Toolbar, ToolbarButton, ToolbarSeparator } from './ui/toolbar';
import { MarkToolbarButton } from './ui/mark-toolbar-button';
import { UndoToolbarButton, RedoToolbarButton } from './ui/history-toolbar-button';
import { ListToolbarButton, IndentToolbarButton } from './ui/list-classic-toolbar-button';
import { TooltipProvider } from './components/tooltip';
import './plate.css';
import { validatePlateValue } from './validate';
export { validatePlateValue } from './validate';

export type { Value } from 'platejs';
export const platePlugins = [...BasicBlocksKit, ...BasicMarksKit, ...ListKit, ...CodeBlockKit, ...LinkKit];
const copy = (value: Value): Value => JSON.parse(JSON.stringify(value));

/** Plate public registry UI. The caller owns storage and explicit save behavior. */
export function PlateEditor({ value, onChange, readOnly = false }: { value: Value; onChange(value: Value): void; readOnly?: boolean }) {
  if (!validatePlateValue(value)) return <div role="alert" className="plate-editor-adapter">This JSON is not a valid editor tree. Each block needs a type and nonempty children, and text leaves need a text string. Your raw source is preserved.</div>;
  return <ValidPlateEditor value={value} onChange={onChange} readOnly={readOnly} />;
}

function ValidPlateEditor({ value, onChange, readOnly }: { value: Value; onChange(value: Value): void; readOnly: boolean }) {
  const editor = usePlateEditor({ plugins: platePlugins, value: copy(value) });
  const last = React.useRef(JSON.stringify(value));
  React.useEffect(() => {
    const next = JSON.stringify(value);
    if (next !== last.current && next !== JSON.stringify(editor.children)) {
      editor.tf.setValue(copy(value));
      editor.history.undos = [];
      editor.history.redos = [];
    }
    last.current = JSON.stringify(editor.children);
  }, [value, editor]);
  return <TooltipProvider><div className="plate-editor-adapter"><Plate editor={editor} readOnly={readOnly} onValueChange={({ value: next }) => {
    const serialized = JSON.stringify(next);
    if (serialized === last.current) return;
    last.current = serialized;
    onChange(copy(next));
  }}>{!readOnly && <EditorToolbar />}<EditorContainer><Editor variant="none" className="plate-document" placeholder="Start writing…" aria-label="Article body" /></EditorContainer></Plate></div></TooltipProvider>;
}

export function EditorToolbar() {
  const editor = useEditorRef();
  const blockType = useEditorSelector(e => String(e.api.block()?.[0]?.type ?? 'p'), []);
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [url, setUrl] = React.useState('');
  const [error, setError] = React.useState('');
  const selection = React.useRef<typeof editor.selection>(null);
  const marks = [
    ['bold', 'Bold', Bold], ['italic', 'Italic', Italic], ['underline', 'Underline', Underline],
    ['strikethrough', 'Strikethrough', Strikethrough], ['code', 'Inline code', Code], ['highlight', 'Highlight', Highlighter],
  ] as const;
  return <><Toolbar aria-label="Article formatting" className="plate-toolbar">
    <UndoToolbarButton aria-label="Undo" /><RedoToolbarButton aria-label="Redo" />
    <ToolbarSeparator />
    <select aria-label="Block type" value={['p','h1','h2','h3','h4','h5','h6'].includes(blockType) ? blockType : 'p'} onChange={event => {
      const type = event.target.value;
      editor.tf.withoutNormalizing(() => editor.api.blocks({ mode: 'lowest' }).forEach(([,path]) => editor.tf.setNodes({ type }, { at: path })));
      editor.tf.focus();
    }}>
      <option value="p">Text</option>{[1,2,3,4,5,6].map(n => <option key={n} value={`h${n}`}>Heading {n}</option>)}
    </select><ToolbarSeparator />
    {marks.map(([nodeType,label,Icon]) => <MarkToolbarButton key={nodeType} nodeType={nodeType} tooltip={label} aria-label={label}><Icon /></MarkToolbarButton>)}
    <ToolbarSeparator />
    <ListToolbarButton nodeType={KEYS.ulClassic} aria-label="Bulleted list" /><ListToolbarButton nodeType={KEYS.olClassic} aria-label="Numbered list" /><ListToolbarButton nodeType={KEYS.taskList} aria-label="Task list" />
    <IndentToolbarButton aria-label="Indent" /><IndentToolbarButton reverse aria-label="Outdent" />
    <ToolbarButton tooltip="Blockquote" aria-label="Blockquote" onMouseDown={e => e.preventDefault()} onClick={() => { editor.tf.toggleBlock(KEYS.blockquote, { wrap: true }); editor.tf.focus(); }}><Quote /></ToolbarButton>
    <ToolbarButton tooltip="Code block" aria-label="Code block" onMouseDown={e => e.preventDefault()} onClick={() => { toggleCodeBlock(editor); editor.tf.focus(); }}><Code /></ToolbarButton>
    <ToolbarButton tooltip="Link" aria-label="Link" onMouseDown={e => e.preventDefault()} onClick={() => { selection.current = editor.selection; setLinkOpen(!linkOpen); setError(''); }}><Link2 /></ToolbarButton>
    <ToolbarButton tooltip="Remove link" aria-label="Remove link" onMouseDown={e => e.preventDefault()} onClick={() => { unwrapLink(editor); editor.tf.focus(); }}><Unlink /></ToolbarButton>
  </Toolbar>{linkOpen && <form className="plate-link-form" onSubmit={event => {
    event.preventDefault();
    if (!/^(https?:\/\/|mailto:)/i.test(url.trim())) { setError('Use an https://, http://, or mailto: link.'); return; }
    if (selection.current) editor.tf.select(selection.current);
    upsertLink(editor, { url: url.trim() });
    setLinkOpen(false); setUrl(''); editor.tf.focus();
  }}><label>Link URL <input aria-label="Link URL" type="text" value={url} onChange={e => setUrl(e.target.value)} autoFocus placeholder="https://example.com" /></label><button type="submit">Apply link</button><button type="button" onClick={() => setLinkOpen(false)}>Cancel</button>{error && <span role="alert">{error}</span>}</form>}</>;
}
export default PlateEditor;
