# Local verification

2026-10-11, Node 24.21.0, clean `npm ci --ignore-scripts --no-audit --no-fund`, under shared porting-heavy-build.lock. Typecheck, ESLint, all 29 tests, schema and sample/source hash checks, exact dependency notices, production build and static release check passed. Two suites comprise 17 native Room draft/store regressions and 12 real Plate UI tests. Release: 6 files, 1,117,272 bytes, single eager JavaScript bundle. No runtime network APIs, browser storage accessors, inline scripts or remote assets in release. Vite warns about the deliberately eager 857 kB script; no code-splitting introduced.

112 production dependencies: 106 MIT, 3 Apache-2.0, one ISC, one 0BSD and one CC0-1.0. Full packaged notices retained, with 23 hashed upstream supplements. One provenance limitation: react-remove-scroll-bar 2.3.8 declares MIT but does not package a LICENSE and its npm gitHead is not publicly available. Its full official MIT notice is included from pinned later official source commit, explicitly disclosed in reports/license-supplements.json and the distributed notices. The other 22 supplements match exact npm gitHead. No Excalidraw, ELK, Mermaid, paid/Pro closure.

Room schema addition and exact donor sample readback matched. Original document_article schema text preserved byte-for-byte as a prefix (apart from a separating newline). editor-a release/binding untouched, fresh get_app_bindings checked_at 2026-10-11T18:21:44.512Z confirms admitted/compatible after schema revision fr_5rs.4.d. New sample revision fr_6kz.1.c. No original article docs were mutated.

Local verification is not browser acceptance. Root owns installed first-page check and later live CRUD/reload/narrow/multi-client checks. No ready/done claim until that first-page check.
