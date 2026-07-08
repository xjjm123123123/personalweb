# PixelBlast Cry Face Debug

Status: [OPEN]

## Symptom

The `PixelBlast` background in the `Experience` section renders incorrectly and appears as a sad/crying face or broken page state.

## Hypotheses

1. The `liquid` postprocessing shader is incompatible with the current `three` / `postprocessing` versions and causes a WebGL shader failure.
2. The integrated `PixelBlast` component was incompletely reconstructed from a truncated source, causing lifecycle or render-path divergence from React Bits.
3. Temporary debugging tools modified dependency state or lockfile, causing Vite dependency re-optimization and stale/churned module output.
4. Multiple dev servers on different ports make the browser preview show stale code rather than the latest local edits.
5. The visual layer exists but is hidden/overdrawn by stacking context or section layout, causing a misleading broken-looking surface.

## Evidence Plan

- Inspect current code and dependency diff.
- Collect browser/runtime errors where possible.
- Apply the smallest fix only after identifying the dominant cause.

## Evidence Collected

- `src/main.tsx` uses `React.StrictMode`, so effects are mounted, cleaned up, and mounted again in development.
- `PixelBlast` appended a WebGL canvas during initialization.
- The unmount cleanup disposed/force-lost the renderer context but did not remove the canvas from the DOM.
- The animation loop only stored the first `requestAnimationFrame` id. Later frames replaced the local `raf` variable but not `threeRef.current.raf`, so cleanup could leave an active render loop using a disposed renderer.
- User-provided console output contains only non-fatal React DevTools and `THREE.Clock` deprecation warnings for `PixelBlast`; these warnings do not explain a broken/sad-face canvas.

## Fix Applied

- Removed aggressive `forceContextLoss()` from normal cleanup.
- Removed stale WebGL canvas from the DOM on cleanup.
- Updated the animation loop to stop when its renderer is no longer the active instance.
- Kept the `liquid` configuration enabled; the fix targets lifecycle cleanup rather than disabling the requested visual effect.
- Replaced the hand-reconstructed `PixelBlast.tsx` with the official React Bits `PixelBlast-JS-CSS` registry files under `src/components/PixelBlast/`.
- Re-mounted the official component as the `Experience` section background.

## Verification

- `npm run build` passes.
- Awaiting browser visual confirmation.
