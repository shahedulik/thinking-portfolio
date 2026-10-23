/* ============================================================
   THINKING PORTFOLIO — particle cognition engine (Three.js)
   ------------------------------------------------------------
   ✎ CONTENT: edit text directly in index.html (look for ✎ EDIT).
   ⚙ TUNING:  everything performance-related lives in CONFIG.
   ============================================================ */

const CONFIG = {
  particles: { desktop: 6500, mobile: 2400 }, // lower = faster on weak devices
  synapses:  { desktop: 150,  mobile: 60 },   // reasoning threads per formation
  pixelRatioCap: 1.75,                        // mobile: set 1.25 to save GPU
  motionIntensity: 1.0,                       // 0.5 calm · 1.0 default · 1.5 lively
  pointerInfluence: 1.0,                      // camera parallax strength
  morphDuration: 2600,                        // ms per reorganization
  formationWords: ['clustering', 'tracing', 'structuring', 'converging'],
};

const isMobile = matchMedia('(max-width: 768px)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) { CONFIG.motionIntensity = 0; CONFIG.pointerInfluence = 0; CONFIG.morphDuration = 0; }

const COUNT = isMobile ? CONFIG.particles.mobile : CONFIG.particles.desktop;
const SYNAPSES = isMobile ? CONFIG.synapses.mobile : CONFIG.synapses.desktop;

/* ---------- tiny math helpers ---------- */
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 1.6;
const hash = (n) => { const s = Math.sin(n) * 43758.5453; return s - Math.floor(s); };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ---------- formation targets: four shapes of thought ---------- */
function makeTargets(kind, n) {
  const t = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3; let x, y, z;
    if (kind === 0) {                       // cluster — drifting lobes of attention
      const c = [[-6, 2, 0], [6, -1, 2], [0, 5, -4]][i % 3];
      x = c[0] + gauss() * 3.2; y = c[1] + gauss() * 2.6; z = c[2] + gauss() * 3.0;
      if (i % 17 === 0) { x *= 2.1; y *= 1.8; z *= 1.9; }
    } else if (kind === 1) {                // trace — double helix of reasoning
      const s = i % 2, u = (i / n) * Math.PI * 6 + s * Math.PI;
      const r = 7.5 + gauss() * 0.5;
      x = Math.cos(u) * r; y = (i / n) * 30 - 15 + gauss() * 0.3; z = Math.sin(u) * r;
      if (i % 23 === 0) { x *= 0.2; z *= 0.2; }
    } else if (kind === 2) {                // lattice — voxel shell (structure)
      const s = 9, f = i % 6;
      const a = (hash(i) * 2 - 1) * s, b = (hash(i * 7 + 1) * 2 - 1) * s;
      if (f === 0) { x = -s; y = a; z = b; } else if (f === 1) { x = s; y = a; z = b; }
      else if (f === 2) { y = -s; x = a; z = b; } else if (f === 3) { y = s; x = a; z = b; }
      else if (f === 4) { z = -s; x = a; y = b; } else { z = s; x = a; y = b; }
      x += gauss() * 0.35; y += gauss() * 0.35; z += gauss() * 0.35;
    } else {                                // converge — fibonacci sphere (decision)
      const ga = Math.acos(1 - 2 * (i + 0.5) / n), ph = i * 2.39996323;
      const r = 11.5 + gauss() * 0.4;
      x = Math.sin(ga) * Math.cos(ph) * r; y = Math.cos(ga) * r; z = Math.sin(ga) * Math.sin(ph) * r;
    }
    t[i3] = x; t[i3 + 1] = y; t[i3 + 2] = z;
  }
  return t;
}

/* ---------- synapse threads: pairs of nearby nodes ---------- */
function buildSynapses(targets, count) {
  const pos = [], n = targets.length / 3;
  let made = 0, tries = 0;
  while (made < count && tries < count * 60) {
    tries++;
    const a = (Math.random() * n) | 0, b = (Math.random() * n) | 0;
    if (a === b) continue;
    const dx = targets[a * 3] - targets[b * 3];
    const dy = targets[a * 3 + 1] - targets[b * 3 + 1];
    const dz = targets[a * 3 + 2] - targets[b * 3 + 2];
    if (dx * dx + dy * dy + dz * dz < 30) {
      pos.push(targets[a * 3], targets[a * 3 + 1], targets[a * 3 + 2],
               targets[b * 3], targets[b * 3 + 1], targets[b * 3 + 2]);
      made++;
    }
  }
  return new Float32Array(pos);
}

/* ---------- static 2D fallback (no WebGL) ---------- */
function renderFallback() {
  document.body.classList.add('no-webgl');
  const cv = document.getElementById('mind-fallback');
  cv.hidden = false;
  const draw = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const t = makeTargets(0, 900); // one frozen cluster
    for (let i = 0; i < 900; i++) {
      const z = t[i * 3 + 2] + 40;
      const s = 320 / z;
      const x = innerWidth * 0.68 + t[i * 3] * s * 0.5;
      const y = innerHeight * 0.42 + t[i * 3 + 1] * s * 0.5;
      const depth = Math.max(0.08, Math.min(1, (z - 20) / 40));
      ctx.fillStyle = `rgba(143,178,198,${0.12 + depth * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.6 + depth * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  draw();
  addEventListener('resize', draw);
}

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.THREE && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

/* ---------- boot ---------- */
const readout = document.getElementById('state-readout');
if (!webglOK()) {
  renderFallback();
  readout.textContent = 'state: static trace';
} else {
  boot();
}

function boot() {
  const canvas = document.getElementById('mind');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? Math.min(CONFIG.pixelRatioCap, 1.25) : CONFIG.pixelRatioCap));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 44);

  const group = new THREE.Group();
  scene.add(group);

  /* targets for all four formations + their synapses */
  const targets = [0, 1, 2, 3].map((k) => makeTargets(k, COUNT));
  const synapses = targets.map((t) => buildSynapses(t, SYNAPSES));

  /* particle buffers */
  const cur = Float32Array.from(targets[0]);
  const from = Float32Array.from(targets[0]);
  const seeds = new Float32Array(COUNT);
  const sizes = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) { seeds[i] = Math.random(); sizes[i] = 0.6 + Math.random() * 0.9; }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(cur, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPulse: { value: 0 },
    uDrift: { value: 0.35 * CONFIG.motionIntensity },
    uSize: { value: 1.6 },
    uPR: { value: renderer.getPixelRatio() },
    uLight: { value: new THREE.Vector3(14, 6, 16) },
    uColorA: { value: new THREE.Color('#22384a') },  // deep steel
    uColorB: { value: new THREE.Color('#6f97ad') },  // mid steel
    uColorC: { value: new THREE.Color('#dceaf2') },  // thinking-surface light
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uTime, uPulse, uDrift, uSize, uPR;
      uniform vec3 uLight;
      attribute float aSeed; attribute float aSize;
      varying float vGlow; varying float vDepth;
      void main() {
        vec3 p = position;
        float t = uTime * 0.35;
        p.x += sin(t + aSeed * 6.2831) * uDrift;
        p.y += cos(t * 0.9 + aSeed * 4.0) * uDrift;
        p.z += sin(t * 0.7 + aSeed * 5.0) * uDrift;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vGlow = 1.0 - smoothstep(4.0, 26.0, distance(p, uLight)); // sweeping attention light
        vDepth = smoothstep(-70.0, -25.0, mv.z);                   // near = bright
        float wave = 0.5 + 0.5 * sin(aSeed * 12.0 + uTime * 2.0);
        float pulse = 1.0 + uPulse * (0.25 + 0.75 * wave);         // deliberation pulse
        gl_PointSize = uSize * aSize * pulse * uPR * (28.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColorA, uColorB, uColorC;
      varying float vGlow; varying float vDepth;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.05, d);
        vec3 base = mix(uColorA, uColorB, vDepth);
        vec3 col = mix(base, uColorC, clamp(vGlow, 0.0, 1.0) * 0.85);
        gl_FragColor = vec4(col, alpha * (0.30 + 0.70 * vDepth));
      }`,
  });

  group.add(new THREE.Points(geo, mat));

  /* synapse threads */
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(synapses[0], 3));
  const lines = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: new THREE.Color('#5d84a0'), transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(lines);

  /* ---------- morph state ---------- */
  let current = 0, morphStart = -1e9, swapping = false;
  function setFormation(idx) {
    if (idx === current && morphStart > -1e8) return;
    current = idx;
    from.set(cur);
    morphStart = performance.now();
    swapping = true;
    readout.textContent = 'state: ' + CONFIG.formationWords[idx];
  }

  /* sections drive reorganization */
  const sections = document.querySelectorAll('[data-formation]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setFormation(+e.target.dataset.formation); });
    }, { threshold: 0.35 });
    sections.forEach((s) => io.observe(s));
  }

  /* pointer parallax */
  let mx = 0, my = 0;
  addEventListener('pointermove', (e) => {
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  /* deliberation pulses */
  let lastPulse = performance.now(), nextPulse = lastPulse + 3200;

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(); });

  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    const now = performance.now();
    const time = clock.getElapsedTime();
    uniforms.uTime.value = time;

    /* light sweeps slowly, offset by pointer = attention follows the visitor */
    uniforms.uLight.value.set(
      Math.sin(time * 0.21) * 18 - mx * 6 * CONFIG.pointerInfluence,
      Math.cos(time * 0.17) * 10 - my * 4 * CONFIG.pointerInfluence,
      14 + Math.sin(time * 0.11) * 6
    );

    /* pulse envelope */
    if (now > nextPulse) { lastPulse = now; nextPulse = now + 3400 + Math.random() * 2600; }
    uniforms.uPulse.value = CONFIG.motionIntensity > 0 ? Math.exp(-(now - lastPulse) / 700) : 0;

    /* morph between formations */
    const k = CONFIG.morphDuration === 0 ? 1 : Math.min(1, (now - morphStart) / CONFIG.morphDuration);
    const e = easeInOut(k);
    const to = targets[current];
    for (let i = 0; i < cur.length; i++) cur[i] = from[i] + (to[i] - from[i]) * e;
    geo.attributes.position.needsUpdate = true;
    if (swapping && k >= 1) {
      swapping = false;
      lineGeo.setAttribute('position', new THREE.BufferAttribute(synapses[current], 3));
    }

    /* autonomous camera drift + pointer response */
    group.rotation.y = time * 0.05 * CONFIG.motionIntensity;
    group.rotation.x = Math.sin(time * 0.07) * 0.08 * CONFIG.motionIntensity;
    camera.position.x += (mx * 3.2 * CONFIG.pointerInfluence - camera.position.x) * 0.04;
    camera.position.y += (-my * 2.2 * CONFIG.pointerInfluence - camera.position.y) * 0.04;
    camera.position.z = 44 + Math.sin(time * 0.12) * 1.2 * CONFIG.motionIntensity;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  loop();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}
