import * as THREE from 'three';

export function mountScene(widget: HTMLElement) {
  const canvas = widget.querySelector<HTMLCanvasElement>('canvas')!;
  const viewport = widget.querySelector<HTMLElement>('.scene-viewport')!;
  const mode = widget.dataset.scene;
  let renderer: THREE.WebGLRenderer;
  const unavailable = () => { widget.querySelector<HTMLElement>('[data-scene-motion]')!.hidden = true; widget.querySelector<HTMLElement>('[data-scene-activate]')!.hidden = true; };
  try { const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' }); if (!context) { unavailable(); return; } renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true, powerPreference: 'low-power' }); } catch { unavailable(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
  camera.position.set(0, mode === 'growth' ? 1.45 : .4, 7.5);
  camera.lookAt(0, mode === 'growth' ? .3 : 0, 0);
  scene.add(new THREE.HemisphereLight(0xfffce9, 0x647346, 2.8));
  const light = new THREE.DirectionalLight(0xfff2cb, 4); light.position.set(-3, 5, 4); scene.add(light);
  const fill = new THREE.DirectionalLight(0xc7dfcd, 1.5); fill.position.set(3, 1, -2); scene.add(fill);
  const model = new THREE.Group(); scene.add(model);
  let stage = Number(widget.dataset.stage || 0); let motionEnabled = widget.dataset.motion !== 'false'; let angle = 0; let targetAngle = 0; let hoverX = 0; let hoverY = 0; let visible = false; let frame = 0; let lastTime = 0; let dirty = true;
  const animated: THREE.Object3D[] = [];
  const materials: THREE.Material[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  function material(color: number, roughness = .72) { const value = new THREE.MeshStandardMaterial({ color, roughness, metalness: .02, side: THREE.DoubleSide }); materials.push(value); return value; }
  function mesh(geometry: THREE.BufferGeometry, mat: THREE.Material) { geometries.push(geometry); return new THREE.Mesh(geometry, mat); }
  const green = material(0x628346); const greenLight = material(0x8a9d4d); const stemMat = material(0x61723a); const gold = material(0xc3a24f); const rootMat = material(0xbca57d);
  function tube(points: THREE.Vector3[], radius: number, mat: THREE.Material, segments = 18) { return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, 5, false), mat); }
  function riceShape(radius: number, height: number) {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= 28; i++) { const p = i / 28; points.push(new THREE.Vector2(Math.pow(Math.sin(p * Math.PI), .73) * radius * (1 - p * .12), (p - .5) * height)); }
    return new THREE.LatheGeometry(points, 32);
  }
  function leaf(height: number, length: number, side: number, rotation: number, mat: THREE.Material) {
    const vertices: number[] = []; const indices: number[] = [];
    for (let i = 0; i <= 20; i++) {
      const p = i / 20; const width = Math.sin(p * Math.PI) * .058;
      const x = side * (p * length * .63); const y = height + Math.sin(p * 1.7) * length * .65 - p * p * length * .22;
      vertices.push(x, y, -width, x, y + .014 * Math.sin(p * Math.PI), 0, x, y, width);
      if (i < 20) { const n = i * 3; indices.push(n, n + 3, n + 1, n + 1, n + 3, n + 4, n + 1, n + 4, n + 2, n + 2, n + 4, n + 5); }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
    const result = mesh(geometry, mat); result.rotation.y = rotation; return result;
  }
  const growthGroups: THREE.Group[] = [];
  const shellParts: THREE.Object3D[] = [];
  let bran: THREE.Mesh | null = null;
  if (mode === 'growth') {
    const earth = mesh(new THREE.CylinderGeometry(.94, .87, .16, 64), material(0x665d42)); earth.position.y = -.91; model.add(earth);
    const ring = mesh(new THREE.TorusGeometry(.94, .007, 6, 80), material(0x89906a)); ring.rotation.x = Math.PI / 2; ring.position.y = -.82; model.add(ring);
    for (let phase = 0; phase < 3; phase++) {
      const group = new THREE.Group(); group.position.y = -.82;
      const count = [1, 5, 7][phase]; const height = [.95, 1.7, 2.15][phase];
      for (let i = 0; i < count; i++) {
        const shoot = new THREE.Group(); const theta = i * 2.4; const spread = i === 0 ? 0 : .12;
        shoot.position.set(Math.cos(theta) * spread, 0, Math.sin(theta) * spread); shoot.rotation.z = i === 0 ? .03 : Math.cos(theta) * .13; shoot.rotation.x = Math.sin(theta) * .1;
        const h = height * (1 - (i % 3) * .09);
        shoot.add(tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.02, h * .45, 0), new THREE.Vector3(.07, h, 0)], .012, stemMat));
        for (let l = 0; l < (phase === 0 ? 3 : 5); l++) shoot.add(leaf(h * (.12 + l * .15), h * (.55 - l * .055), l % 2 ? 1 : -1, i * 1.1 + l * .6, phase === 2 && l < 2 ? greenLight : green));
        for (let r = 0; r < 5; r++) { const rootTheta = r * 1.25; shoot.add(tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(rootTheta) * .1, -.12, Math.sin(rootTheta) * .1), new THREE.Vector3(Math.cos(rootTheta) * .2, -.22, Math.sin(rootTheta) * .2)], .004, rootMat, 10)); }
        if (phase === 2) {
          const panicle = new THREE.Group(); panicle.position.set(.07, h, 0);
          panicle.add(tube([new THREE.Vector3(0, -.02, 0), new THREE.Vector3(.14, .2, 0), new THREE.Vector3(.34, .2, .01), new THREE.Vector3(.52, -.02, .02)], .008, gold));
          const grainGeometry = riceShape(.018, .09); geometries.push(grainGeometry);
          for (let branch = 0; branch < 7; branch++) {
            const bx = .07 + branch * .056; const by = Math.sin((branch + 1) / 8 * Math.PI) * .23; const bz = branch % 2 ? .08 : -.08;
            panicle.add(tube([new THREE.Vector3(bx, by, 0), new THREE.Vector3(bx + .05, by - .06, bz), new THREE.Vector3(bx + .085, by - .2, bz * 1.4)], .003, gold, 10));
            for (let g = 0; g < 4; g++) { const grain = new THREE.Mesh(grainGeometry, gold); grain.position.set(bx + .04 + g * .016, by - .035 - g * .048, bz * (.5 + g * .17)); grain.rotation.z = -.5 + g * .13; grain.rotation.x = .3; panicle.add(grain); }
          }
          shoot.add(panicle);
        }
        group.add(shoot); animated.push(shoot);
      }
      group.visible = phase === 0; model.add(group); growthGroups.push(group);
    }
    model.rotation.y = -.3;
  } else {
    model.rotation.z = -.6;
    const core = mesh(riceShape(.36, 2.15), material(0xf1e8ca, .32)); model.add(core);
    // A thin bran layer is removed in the white-rice stage.
    bran = mesh(riceShape(.385, 2.2), material(0xb78b50)); model.add(bran);
    const hullMaterial = material(0xc9a34b, .8);
    for (const side of [-1, 1]) {
      const hull = mesh(new THREE.SphereGeometry(1, 36, 28, side === 1 ? 0 : Math.PI, Math.PI), hullMaterial);
      hull.scale.set(.43, 1.22, .4); model.add(hull); shellParts.push(hull);
      // Longitudinal ridges are part of the husk, and move with it.
      for (let rib = 0; rib < 5; rib++) {
        const theta = (rib + .5) / 5 * Math.PI + (side === 1 ? 0 : Math.PI);
        const points = Array.from({ length: 19 }, (_, i) => { const p = i / 18; const radius = Math.sin(p * Math.PI); return new THREE.Vector3(Math.cos(theta) * radius * .435, (p - .5) * 2.43, Math.sin(theta) * radius * .405); });
        const ridge = tube(points, .006, material(0x987b38)); model.add(ridge); shellParts.push(ridge);
      }
    }
  }
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = 128; shadowCanvas.height = 128;
  const context = shadowCanvas.getContext('2d')!; const gradient = context.createRadialGradient(64, 64, 1, 64, 64, 64); gradient.addColorStop(0, 'rgba(36,51,24,.27)'); gradient.addColorStop(1, 'rgba(36,51,24,0)'); context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas); const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false }); materials.push(shadowMat);
  const shadow = mesh(new THREE.PlaneGeometry(3.3, 1), shadowMat); shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, mode === 'growth' ? -1.08 : -1.65, 0); scene.add(shadow);
  function size() { const width = viewport.clientWidth; const height = viewport.clientHeight; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); dirty = true; requestRender(); }
  function requestRender() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render); }
  function render(now: number) {
    frame = 0; if (!visible || document.hidden) return;
    if (now - lastTime < 32 && !dirty) { if (motionEnabled) requestRender(); return; }
    lastTime = now;
    angle += (targetAngle - angle) * .13;
    if (mode === 'growth') { model.rotation.y = -.3 + angle + hoverX * .12; if (motionEnabled) animated.forEach((shoot, i) => shoot.rotation.x = Math.sin(now * .00075 + i) * .025); }
    else {
      model.rotation.y = angle + hoverX * .18; model.rotation.x = hoverY * .1;
      model.position.y = motionEnabled ? Math.sin(now * .0006) * .04 : 0;
      shellParts.forEach((part, index) => { const side = index < 6 ? 1 : -1; const target = stage > 0 ? side * .85 : 0; part.position.x += (target - part.position.x) * .1; part.visible = stage < 2; });
      if (bran) bran.visible = stage < 2;
    }
    renderer.render(scene, camera); dirty = false;
    if (motionEnabled || Math.abs(targetAngle - angle) > .002) requestRender();
  }
  function updateStage(next: number) {
    stage = next;
    if (mode === 'growth') growthGroups.forEach((group, index) => group.visible = index === stage);
    if (!motionEnabled && mode === 'grain') shellParts.forEach((part, index) => { part.position.x = stage > 0 ? (index < 6 ? 1 : -1) * .85 : 0; });
    dirty = true; requestRender();
  }
  widget.addEventListener('rice-stage', () => updateStage(Number(widget.dataset.stage || 0)));
  widget.addEventListener('rice-motion', () => { motionEnabled = widget.dataset.motion === 'true'; dirty = true; requestRender(); });
  widget.querySelector<HTMLInputElement>('[data-rotate]')?.addEventListener('input', event => { targetAngle = Number((event.target as HTMLInputElement).value) * Math.PI / 180; dirty = true; requestRender(); });
  if (matchMedia('(pointer: fine)').matches) {
    viewport.addEventListener('pointermove', event => { const rect = viewport.getBoundingClientRect(); hoverX = (event.clientX - rect.left) / rect.width - .5; hoverY = (event.clientY - rect.top) / rect.height - .5; dirty = true; requestRender(); });
    viewport.addEventListener('pointerleave', () => { hoverX = hoverY = 0; dirty = true; requestRender(); });
  }
  const resize = new ResizeObserver(size); resize.observe(viewport);
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) { dirty = true; requestRender(); } else { cancelAnimationFrame(frame); frame = 0; } }, { threshold: .05 }); observer.observe(viewport);
  const visibilityChange = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else { dirty = true; requestRender(); } };
  document.addEventListener('visibilitychange', visibilityChange);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); widget.classList.remove('is-ready'); visible = false; cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener('pagehide', () => { observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', visibilityChange); geometries.forEach(geometry => geometry.dispose()); materials.forEach(mat => mat.dispose()); shadowTexture.dispose(); renderer.dispose(); }, { once: true });
  updateStage(stage); size(); widget.classList.add('is-ready');
}
