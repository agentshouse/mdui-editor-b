# Document editor B

A House App for structured block documents with rich text, lists and raw JSON editing. Edits use native Room Drafts; Save explicitly queues the current draft.

## Build and publish

Use Node 24.21 or newer. Run `npm ci --ignore-scripts --no-audit --no-fund`, then `npm run verify` to run the complete local checks and build `dist/`. Configure `origin` as the intended House App Git remote, commit the reviewed source on `main`, then run `npm run publish`. Publication verifies the exact clean source and atomically pushes `main` plus a parentless built `release`; it never commits or resets work. Verify the admitted App revision after publication. Hosted acceptance is separate from local checks.

## Starter documents

`starter/` contains two unchanged licensed example documents at their existing Room paths. Both editor variants carry the same union schema and starter. A edits HTML articles; B edits block-tree articles. These are separate representations, not interoperable copies, and neither variant converts the other. No Room migration or binding changes are needed.

License files and source attribution are retained with the code and examples. Original example content and required legal notices can name their authors and sources.

## Portable publisher safety

The publisher accepts credential-free HTTPS House App remotes on any host, including
`https://<host>/app/new.git` for creation. Choose only a host and App you are authorized
to publish to. Host portability does not authorize publication to another environment.
For initial creation, use `npm run publish -- --name "<display name>"`; `--name` is
optional and no default display name is invented. The helper reports only complete,
explicitly returned App/Git receipt URLs and never changes `origin`. After creation,
inspect the returned canonical App in House and set its actual Git URL as `origin`
before another publication. Never retry an uncertain creation blindly.

`npm run test:publisher` runs offline local-Git regression fixtures with mocked
push/remote transport; it installs no packages and does not contact House. These
checks are included in `npm run verify` before the existing App-specific gates.
Publication requires clean committed `main`, runs exactly that full verify gate,
pins the source SHA, and atomically pushes source `main` plus a parentless dist-only
`release`. It preserves the normal index and source branch, rejects unsafe origin
rewrites, index flags, metadata mismatches, and conflicting publisher/worktree locks.
It never commits source, resets work, or substitutes a build-only verification.

Failure diagnostics suppress arbitrary subprocess output to avoid leaking credentials.
Run `npm run verify` locally for full compiler/test output; never share credential
values or verbose HTTP traces. A reported creation receipt or advertised source SHA
does not prove release admission: inspect the known App's published revision in House.
After a failed or uncertain push, inspect that state before deciding whether to retry.

## House addresses

Article selection uses the outer House address `/articles?room=<locator>&path=<document path>`; `view=source` opens the exact raw JSON view. The existing bridge owns navigation, including Back/Forward and cold links. The requested document waits for the first completed local query before being declared unavailable; it never silently falls back to a different article. Root selects the first non-archived article using replace.

Typing never changes history, saves, or discards drafts. A new-document completion cannot replace a later user selection. Search and the archived-list toggle remain transient filters, while an explicitly opened article stays selected. Query/Room changes cannot display an override from another Room.
