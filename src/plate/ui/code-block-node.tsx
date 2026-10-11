'use client';
// Reduced from the MIT Plate public registry code-block-node.tsx; see source map.
import { type TCodeSyntaxLeaf } from 'platejs';
import { type PlateElementProps, type PlateLeafProps, PlateElement, PlateLeaf } from 'platejs/react';
export function CodeBlockElement(props: PlateElementProps) {
  return <PlateElement className="py-1" {...props}><div className="relative rounded-md bg-muted/50"><pre className="overflow-x-auto p-8 pr-4 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid"><code>{props.children}</code></pre></div></PlateElement>;
}
export function CodeLineElement(props: PlateElementProps) { return <PlateElement {...props} />; }
export function CodeSyntaxLeaf(props: PlateLeafProps<TCodeSyntaxLeaf>) { const tokenClassName = props.leaf.className as string; return <PlateLeaf className={tokenClassName} {...props} />; }
