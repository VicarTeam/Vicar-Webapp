/**
 * three.js-„Hero"-Effekt für Raserei: ein nach innen ziehender, pulsierender
 * Schwarm glühender Blut-Funken. Lazy (dynamischer import) -> kein Bundle-Bloat.
 * Gibt eine Stop-Funktion zurück, die alles sauber abräumt.
 */
export async function startFrenzy3d(container: HTMLElement, durationMs = 6000): Promise<() => void> {
  const THREE = await import("three")

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  const canvas = renderer.domElement
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;"
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.z = 14

  const COUNT = 1400
  const positions = new Float32Array(COUNT * 3)
  const speeds = new Float32Array(COUNT)
  const seed = (i: number) => {
    const r = 8 + Math.random() * 10
    const t = Math.random() * Math.PI * 2
    const p = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(p) * Math.cos(t)
    positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t)
    positions[i * 3 + 2] = r * Math.cos(p)
    speeds[i] = 0.4 + Math.random() * 0.8
  }
  for (let i = 0; i < COUNT; i++) seed(i)

  const geo = new THREE.BufferGeometry()
  const posAttr = new THREE.BufferAttribute(positions, 3)
  geo.setAttribute("position", posAttr)

  // weiche glühende Punkt-Textur
  const tc = document.createElement("canvas")
  tc.width = tc.height = 64
  const tctx = tc.getContext("2d")!
  const grad = tctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, "rgba(255,255,255,1)")
  grad.addColorStop(0.3, "rgba(255,120,120,0.85)")
  grad.addColorStop(1, "rgba(200,0,0,0)")
  tctx.fillStyle = grad
  tctx.fillRect(0, 0, 64, 64)
  const sprite = new THREE.CanvasTexture(tc)

  const mat = new THREE.PointsMaterial({
    size: 0.55,
    map: sprite,
    color: 0xc8102e,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.9,
  })
  const points = new THREE.Points(geo, mat)
  scene.add(points)

  let raf = 0
  let stopped = false
  const start = performance.now()

  function frame(now: number) {
    if (stopped) return
    const k = Math.min(1, (now - start) / durationMs)
    const pos = posAttr.array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3
      const x = pos[ix]!, y = pos[ix + 1]!, z = pos[ix + 2]!
      const d = Math.sqrt(x * x + y * y + z * z) || 1
      const pull = speeds[i]! * 0.02 * (0.5 + k)
      pos[ix] = x - (x / d) * pull
      pos[ix + 1] = y - (y / d) * pull
      pos[ix + 2] = z - (z / d) * pull
      if (d < 1.5) seed(i)
    }
    posAttr.needsUpdate = true
    points.rotation.y += 0.0016
    points.rotation.x += 0.0008
    mat.opacity = 0.55 + 0.45 * Math.sin(now * 0.006)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
  window.addEventListener("resize", onResize)

  return () => {
    if (stopped) return
    stopped = true
    cancelAnimationFrame(raf)
    window.removeEventListener("resize", onResize)
    geo.dispose()
    mat.dispose()
    sprite.dispose()
    renderer.dispose()
    canvas.remove()
  }
}
