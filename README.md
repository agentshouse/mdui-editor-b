# editor-b

A separate ordinary House App using the MIT public Plate text/block kit at `udecode/plate@45aee8fd81a596fad5efc4e61ab377bb225fb11c`. editor-a (dokieli) remains unchanged. Both bind the Document editor Room, but preserve different native formats in distinct typed collections.

## Scope

Real public registry BasicBlocks, BasicMarks, classic lists/task lists, code blocks, links, toolbar and editing history. Headings 1–6, paragraph, quote, horizontal rule, bold/italic/underline/strike/code/highlight, bullet/number/task lists, indent/outdent, code, links, undo/redo. Rich editor and raw JSON source preserve the same Plate tree. Search, new document, title, reversible archive and explicit Save operate on `plate_article` documents under `plate/`.

Deliberate reduced closure: no paid/Pro/Potion, AI, Excalidraw/ELK, remote media/upload, collaboration transport, tables, slash menu, drag/drop, syntax highlighting or Markdown interchange. The UI does not imply those features exist. Sample text is the original licensed basic-blocks donor example, not invented demonstration data. Original registry source and exact hashes live in `vendor/plate` and `reports/plate-source-map.json`.

## House contract

Only `connectHouseBridge().runtime` supplies document/draft storage. Query field keys are JSON Pointers (`/title`). Both Room and sync observations must establish initial readiness. All code loads eagerly; later selection/search/navigation uses local state, not REST/page loads.

Every meaningful raw title/content/archive edit is staged in its native Room Draft. Explicit Save validates the tree and queues exactly the observed draft revision. Locally queued is distinct from provider acceptance. Same-browser stale CAS rereads and merges disjoint edits while later input wins overlapping fields; first field bases remain. Failed local input remains visible and is retried together with later disjoint input. Refusal/returned/conflict metadata remains. No localStorage, separate IndexedDB or recovery-copy document exists. Pinned Zustand/Jotai optional persistence accessors are replaced at build time with an explicit throwing boundary, even though retained kits never enable them; the hash guard and release scan prohibit a new browser-storage path. Half-typed popup URL state is presentation-only, per the accepted popup boundary. Provider write-halt does not block native local draft or Save; access/storage loss does.

## Compatible shared Room

The existing `document_article` collection contains semantic dokieli HTML and RDFa. A bounded Plate conversion would destroy unsupported semantics, so editor-b uses an additive `plate_article` type in the same Room. The original schema bytes and donor article documents are not changed. Existing editor-a binding admission must be checked after the schema addition. Existing content is never silently converted or overwritten.

## Checks

`npm ci --ignore-scripts --no-audit --no-fund`; `npm run typecheck`; `npm run lint`; `npm test`; `npm run build`; `npm run release:check`. Production build generates complete dependency notices and validates exact vendored source hashes. Tests cover actual donor editor UI and mocked native Runtime boundary, not live House acceptance. Hosted first-page check is separate and required before readiness.

Main is complete source; release is a parentless built tree. Publication uses the ordinary House Git transport with a new App named editor-b. GitHub publication belongs to Master. Runtime package engines request Node 24.21+.
