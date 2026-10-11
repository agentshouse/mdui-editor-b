# Fixed-light theme boundary

The pinned Plate donor `45aee8fd81a596fad5efc4e61ab377bb225fb11c`, `apps/www/src/app/globals.css:7`, declares `@custom-variant dark (&:is(.dark *));`. The House adaptation retained a fixed-light shell but omitted that declaration, so Tailwind emitted 11 `prefers-color-scheme:dark` media blocks for retained donor dark utilities in release 3. OS dark preference could therefore recolor a subset of toolbar/code classes independently of the light shell.

The adapter now includes the exact donor class-based variant. No dark root or theme switch is introduced. Two source regressions verify the variant and light shell. The full compiled-release gate rejects any dark color-scheme media query and requires the explicit `.dark` ancestor boundary. This establishes that OS-dark preference alone cannot activate those utilities. No app state, schema, Room data, runtime, dependency or license scope changes.

Publication and browser checks are tracked in the new immutable Porting checkpoint. The explicitly cancelled post-release-3 binding metadata read remains unverified and must not be retried.
