[OPEN] Hero ring initial-position verification

## User Report
- Need an accessible preview for `f:\personalweb\portfolio`.
- Verify whether the homepage hero ring is first visible at the top-right corner.
- Verify whether it flashes in the center before settling.
- Return checklist conclusions with evidence.

## Falsifiable Hypotheses
1. Initial positioning styles are not applied before first paint, so the ring briefly renders at the center.
2. An entrance animation starts from the center and moves the ring to the top-right.
3. Hydration or mount-time class changes cause a layout jump between first and second paint.
4. The ring container depends on late layout information and repositions after assets finish loading.

## Plan
1. Start local preview and capture a reachable URL.
2. Inspect hero/ring implementation and related styles.
3. Collect runtime evidence with frame-by-frame screenshots during initial load.
4. Summarize each checklist item with conclusion and supporting evidence.

## Evidence Log
- Preview URL: `http://localhost:5174/`
- Code evidence:
  - `src/components/Hero.tsx` sets the hero ring to `opacity: 0`, `visibility: hidden`, and `transform: translate3d(80vw, -80vh, 0) scale(0.1) rotate(720deg)` both in inline style and GSAP pre-state.
  - The GSAP timeline then animates the ring to `x: 0`, `y: 0`, `scale: 1`, `rotation: 0`, meaning it flies from the top-right/outside area toward the center.
- Runtime evidence from `.debug-artifacts/hero-ring-samples.json`:
  - `0ms`: hidden, `opacity=0`, center `(1872, -270)`, completely outside the viewport top-right.
  - `50ms`: first visible sample, `opacity=0.4596`, center `(1342.57, 60.89)`, still in the top-right area and far from viewport center `(720, 450)`.
  - `100ms`: center `(1073.80, 228.88)`, moving diagonally toward center.
  - `300ms`: center `(765.93, 421.30)`, now near viewport center.
  - `500ms`: center `(696.86, 464.47)`, essentially centered.
- Screenshot artifacts:
  - `.debug-artifacts/hero-ring-0000ms.png`
  - `.debug-artifacts/hero-ring-0050ms.png`
  - `.debug-artifacts/hero-ring-0100ms.png`
  - `.debug-artifacts/hero-ring-0300ms.png`
  - `.debug-artifacts/hero-ring-0500ms.png`
