# Hosted QA checkpoint, 2026-10-11

Root first-page pass: cloud tab113, 18:26:01 UTC, exact release1 renderer 01a12c36-0236-7000-9f15-dda5c025df93. Styled rail, real Basic blocks sample, toolbar, heading hierarchy, quotes, JSON source and Save; no business edits.

Worker scoped QA in own cloud tab114, same release1. Room r_1j.3 was verified owned, list_triggers returned empty. Only a separately labeled QA article was created, never the donor or original dokieli articles. Native unsaved rich title/body survived a normal reload. Raw incomplete JSON `[{"type":"p","children":[{"text":"QA partial` survived a second normal reload exactly and safely refused Save. CLI `ls` still showed only basic-blocks.md before explicit valid Save.

After repairing raw source, explicit Save created plate/ebba7c2f-45a6-42a0-9737-cdfa2079e831.md. Independent House CLI readback confirms title `QA editor-b 2026-10-11 18:28`, h2 `QA saved heading` and paragraph `Isolated QA rich and raw recovery verified.` Browser rich view showed both blocks and normal reload retained the article. The QA document remains; no delete was attempted.

Two scoped presentation defects found: stale invalid-JSON alert remained after corrected successful input/Save; fast provider queue updates could be overwritten by the later local Save reply. The next source clears only repaired local feedback, preserves authoritative queue acceptance received before the reply, and explicitly reports queue disappearance without an acceptance receipt instead of continuing an unjustified pending label. Three regressions added. Clean Node24.21 gates: 32 tests, types, lint, schema/provenance/notices/build/release scan pass. New artifact six files / 1,117,811 bytes. Follow-up installed-release and corrected-flow browser checks are required before claiming these fixes hosted.

No narrow/mobile, cross-device, real-provider halt/conflict, deletion, external link/action or full feature acceptance is claimed. Status working.
