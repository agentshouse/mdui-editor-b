import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const stylesheet=readFileSync('src/style.css','utf8');
describe('fixed-light Plate theme boundary',()=>{
 it('retains the pinned donor class-based dark variant',()=>{expect(stylesheet).toContain('@custom-variant dark (&:is(.dark *));');});
 it('does not activate a dark root or OS preference theme in the App shell',()=>{const shell=readFileSync('src/main.tsx','utf8');expect(shell).not.toMatch(/className=["'][^"']*\bdark\b/);expect(stylesheet).not.toMatch(/prefers-color-scheme\s*:\s*dark/);expect(stylesheet).toContain('--color-background: white');});
});
