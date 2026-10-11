# Confirmed queue outcome contract — Master 1845

Source: Porting messages/20261011T1845Z-master-queue-outcome-contract.md. This supersedes release 2's queue-removal uncertainty interpretation.

A batch leaves `observe("queue", room)` on provider acceptance or refusal. Refusal returns its native Room Draft with `returned` metadata (`conflicted`, `rejected`, or `expired`). Departure without a returned Draft means saved. An explicit accepted queue entry is only an intermediate state while the replica lags; it need not appear. `save()` answers only the local queueing step.

The App reads `roomDraft.read(room,path)` locally when an observed batch departs, as well as observing `room-drafts`. This preserves correct result handling across observer delivery order. It shows Saved for no returned Draft, the exact returned reason otherwise, and distinguishes later unsaved edits from the earlier saved batch. A latest-batch guard prevents a delayed old result replacing a newer batch's status. Native Draft content, field bases and refusal metadata are never changed or discarded by outcome handling. No provider requests, REST polling, new runtime, or alternate storage were introduced.

Regression coverage includes direct departure without an accepted event; conflicted/rejected/expired returns; both queue/Draft observer orders; later unsaved edits; replacement batch on the same path; and accepted notification before local Save reply. Full suite: 38 tests.
