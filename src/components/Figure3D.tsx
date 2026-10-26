"use client";

// Figura 3D low-poly. La cámara no se mueve aquí: ScrollStory anima el
// objeto `rig` con GSAP y este componente lo lee en cada fotograma.
//
// El modelo (public/models/zexu.glb) se genera con scripts/modelo-3d/generar.py.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { SectionId } from "@/data/sections";

const MODEL_URL = "/models/zexu.glb";

/** Altura de la figura en unidades de escena (pies en y=0). */
const HEIGHT = 1.75;

export interface CameraRig {
  /** punto al que mira la cámara */
  tx: number;
  ty: number;
  tz: number;
  /** distancia de la cámara al punto */
  dist: number;
  /** giro de la figura sobre su eje (radianes) */
  turn: number;
}

/** Encuadre de cada zona. `shift` desplaza la figura para dejar sitio al texto. */
export const VIEWS: Record<SectionId | "intro", Omit<CameraRig, "turn">> = {
  intro: { tx: 0, ty: 0.9, tz: 0, dist: 4.2 },
  corazon: { tx: 0, ty: 1.2, tz: 0, dist: 2.6 },
  cerebro: { tx: 0, ty: 1.62, tz: 0, dist: 1.2 },
  manos: { tx: 0, ty: 0.92, tz: 0, dist: 3.9 },
  piernas: { tx: 0, ty: 0.48, tz: 0, dist: 2.6 },
  ojos: { tx: 0, ty: 1.6, tz: 0.05, dist: 0.8 },
};

/** Cuánto se aparta la figura del centro, en fracción de la distancia. */
export const SIDE_SHIFT = 0.2;

export function rigFor(
  zone: SectionId | "intro",
  side: "left" | "right" | null
): CameraRig {
  const v = VIEWS[zone];
  // texto a la derecha -> figura a la izquierda: la cámara mira más a la derecha
  const dir = side === "right" ? 1 : side === "left" ? -1 : 0;
  return {
    ...v,
    tx: v.tx + dir * v.dist * SIDE_SHIFT,
    turn: dir * 0.35,
  };
}

/** Centra y escala un modelo cargado para que mida HEIGHT con los pies en y=0. */
function normalize(obj: THREE.Object3D) {
  // Our own model is already in metres; only rescale something far off.
  const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
  if (size.y < 1.4 || size.y > 2.2) obj.scale.multiplyScalar(HEIGHT / size.y);
  const box2 = new THREE.Box3().setFromObject(obj);
  const c = box2.getCenter(new THREE.Vector3());
  obj.position.x -= c.x;
  obj.position.z -= c.z;
  obj.position.y -= box2.min.y;
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (m && "flatShading" in m) {
        m.flatShading = true;
        m.side = THREE.DoubleSide;
        m.roughness = 0.85;
        m.metalness = 0;
        m.needsUpdate = true;
      }
    }
  });
}

export default function Figure3D({
  rig,
  className,
}: {
  rig: React.RefObject<CameraRig>;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2.5, 3.5, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbfd4ff, 0.9);
    rim.position.set(-3, 2, -2.5);
    scene.add(rim);

    const figure = new THREE.Group();
    scene.add(figure);
    new GLTFLoader().load(MODEL_URL, (gltf) => {
      normalize(gltf.scene);
      figure.add(gltf.scene);
    });

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const target = new THREE.Vector3();
    const clock = new THREE.Clock();
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(host);

    renderer.setAnimationLoop(() => {
      if (!visible) return;
      const r = rig.current;
      const t = clock.getElapsedTime();
      target.set(r.tx, r.ty, r.tz);
      camera.position.set(r.tx, r.ty + r.dist * 0.04, r.tz + r.dist);
      camera.lookAt(target);
      // giro hacia el texto + respiración muy suave
      figure.rotation.y = r.turn + Math.sin(t * 0.6) * 0.04;
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [rig]);

  return <div ref={hostRef} className={className} aria-hidden="true" />;
}
