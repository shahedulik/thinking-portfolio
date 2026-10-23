# Thinking Portfolio

A single-page computational portfolio powered by a Three.js particle cognition engine. The site renders thousands of particles that morph between four formations — cluster, helix trace, lattice shell, and fibonacci sphere — as the visitor scrolls through sections. A steel-on-slate monochromatic palette (deep void → lifted slate → thinking-surface light) unifies the WebGL background, typography (Fraunces display + IBM Plex Mono), and UI chrome into one cohesive reasoning aesthetic.

## Deploy

Static site on Netlify. Publish directory is the project root (`.`). No build command is required — all assets are pre-built HTML, CSS, and JavaScript served directly.

## Tuning

All performance and motion parameters live in the `CONFIG` object at the top of `script.js`:

| Key | Purpose |
|-----|---------|
| `particles.desktop` / `particles.mobile` | Total particle count per device class. Lower = faster on weak GPUs. |
| `synapses.desktop` / `synapses.mobile` | Number of reasoning-thread line segments drawn per formation. |
| `pixelRatioCap` | Maximum device pixel ratio passed to the WebGL renderer. Set to `1.25` on mobile to save GPU. |
| `motionIntensity` | Global motion multiplier (`0.5` calm · `1.0` default · `1.5` lively). Set to `0` by `prefers-reduced-motion`. |
| `pointerInfluence` | Camera parallax strength driven by pointer position. |
| `morphDuration` | Duration in milliseconds for each formation reorganization transition. |
