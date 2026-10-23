# Thinking Portfolio

A single-page computational portfolio featuring a Three.js particle cognition engine with a steel-on-slate aesthetic. The site explores how code, typography, motion, and 3D form communicate real-time reasoning.

## Deploy
This is a static site hosted on Netlify. No build command is required. The publish directory is set to the repository root (`.`).

## Tuning
Performance and motion are controlled via the `CONFIG` object in `script.js`:
- `particles.desktop / .mobile`: Number of particles (lower = faster)
- `synapses`: Number of reasoning threads per formation
- `pixelRatioCap`: Max device pixel ratio (1.25 recommended for mobile)
- `motionIntensity`: 0.0 (calm) to 1.5 (lively)
- `pointerInfluence`: Camera parallax strength
- `morphDuration`: Milliseconds per shape reorganization
