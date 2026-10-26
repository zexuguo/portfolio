"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Silhouette from "./Silhouette";
import SectionContent from "./SectionContent";
import { SECTIONS, type SectionId } from "@/data/sections";

const ZONES: SectionId[] = ["corazon", "cerebro", "manos", "piernas", "ojos"];
const VIEWBOX_W = 400;
const VIEWBOX_H = 800;

export default function ScrollStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const container = containerRef.current;
        const stage = stageRef.current;
        const svg = stage?.querySelector<SVGSVGElement>("svg") ?? null;
        if (!svg || !container || !stage) return;

        const camera = svg.querySelector<SVGGElement>("#camera");
        if (!camera) return;

        const zoneEls: Record<string, SVGGElement | null> = {};
        ZONES.forEach((z) => {
          zoneEls[z] = svg.querySelector<SVGGElement>(`#${z}`);
        });
        const baseEl = svg.querySelector<SVGGElement>("#figura-base");

        // GSAP anchors an SVG element's transformOrigin relative to that
        // element's own getBBox(), not the SVG's viewBox origin. Compensate
        // so "0,0" in our zoom math really means the viewBox's (0,0).
        const camBBox = camera.getBBox();
        const origin = `${-camBBox.x}px ${-camBBox.y}px`;

        gsap.set(camera, { x: 0, y: 0, scale: 1, transformOrigin: origin });
        gsap.set(ZONES.map((z) => zoneEls[z]).filter(Boolean) as SVGGElement[], {
          opacity: 1,
          filter: "blur(0px)",
        });

        // Each section owns one unit of timeline (= one viewport of scroll):
        //   0.00-0.60  camera travels to the target
        //   0.35-0.65  text slides in
        //   0.65-0.90  hold: camera still, text fully visible (snap lands here)
        //   0.90-1.00  text fades out before the next move
        const N = SECTIONS.length;
        const CAMERA = 0.6;
        const TEXT_IN = 0.35;
        const TEXT_OUT = 0.9;
        const REST = 0.78;
        const NUDGE = 0.15;
        const snapPoints = [0, ...SECTIONS.map((_, i) => (i + REST) / N), 1];

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=" + N * window.innerHeight,
            scrub: 1,
            pin: stage,
            anticipatePin: 1,
            // Settle on each point of interest instead of flying past it.
            snap: {
              // Snap from where the user actually stopped, not GSAP's
              // velocity-projected end, so a fast fling or an anchor jump
              // doesn't overshoot several sections. One point per gesture.
              snapTo: (projected: number, self?: ScrollTrigger) => {
                const p = self?.progress ?? projected;
                const dir = self?.direction ?? 1;
                // Last point behind the user and next one ahead, in scroll direction.
                const behind =
                  dir > 0
                    ? [...snapPoints].reverse().find((s) => s <= p) ?? 0
                    : snapPoints.find((s) => s >= p) ?? 1;
                const ahead =
                  dir > 0
                    ? snapPoints.find((s) => s > p) ?? 1
                    : [...snapPoints].reverse().find((s) => s < p) ?? 0;
                // A nudge (< ~15% of a section) settles back; anything more
                // carries on to the next point of interest.
                return Math.abs(p - behind) < NUDGE / N ? behind : ahead;
              },
              duration: { min: 0.25, max: 0.7 },
              delay: 0.12,
              ease: "power2.inOut",
            },
          },
          defaults: { ease: "power2.inOut" },
        });

        SECTIONS.forEach((section, i) => {
          const targetEl = zoneEls[section.target];
          if (!targetEl) return;
          const bbox = targetEl.getBBox();
          const cx = bbox.x + bbox.width / 2;
          const cy = bbox.y + bbox.height / 2;
          const S = section.zoom;
          const tx = VIEWBOX_W / 2 - S * cx;
          const ty = VIEWBOX_H / 2 - S * cy;

          tl.to(
            camera,
            { x: tx, y: ty, scale: S, transformOrigin: origin, duration: CAMERA },
            i
          );

          ZONES.forEach((z) => {
            const el = zoneEls[z];
            if (!el) return;
            if (z === section.target) {
              tl.to(el, { opacity: 1, filter: "blur(0px)", duration: 0.4 }, i);
            } else {
              tl.to(el, { opacity: 0.12, filter: "blur(5px)", duration: 0.4 }, i);
            }
          });
          if (baseEl) {
            tl.to(baseEl, { opacity: 0.35, duration: 0.4 }, i);
          }

          const textEl = textRefs.current[i];
          if (textEl) {
            const dir = section.side === "left" ? -32 : 32;
            tl.fromTo(
              textEl,
              { autoAlpha: 0, x: dir },
              { autoAlpha: 1, x: 0, duration: 0.3 },
              i + TEXT_IN
            );
            if (i < N - 1) {
              // keep the final section's content (with the CTA) visible instead
              // of fading it out — there's nothing left to scroll to after it.
              tl.to(textEl, { autoAlpha: 0, duration: 1 - TEXT_OUT }, i + TEXT_OUT);
            }
          }
        });

        // Pad the timeline to exactly N units so snap points map 1:1 to sections.
        tl.set({}, {}, N);

        return () => {
          tl.kill();
        };
      });

      mm.add("(max-width: 767px)", () => {
        const items = gsap.utils.toArray<HTMLElement>(".mobile-section");
        items.forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 40 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} id="historia">
      {/* Desktop / tablet: pinned scroll-zoom story */}
      <div
        ref={containerRef}
        className="hidden md:block relative"
        style={{ height: `${(SECTIONS.length + 1) * 100}vh` }}
      >
        <div
          ref={stageRef}
          className="h-screen w-full overflow-hidden flex items-center justify-center"
        >
          <Silhouette className="h-[80vh] w-auto text-neutral-800 dark:text-neutral-100" />
          {SECTIONS.map((section, i) => (
            <div
              key={section.id}
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              className={`opacity-0 invisible absolute top-1/2 -translate-y-1/2 w-[min(90vw,28rem)] ${
                section.side === "left"
                  ? "left-6 lg:left-16"
                  : "right-6 lg:right-16"
              }`}
            >
              <SectionContent section={section} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: normal stacked flow, fade/slide reveals, no pin/zoom */}
      <div className="md:hidden">
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            className="mobile-section min-h-screen flex flex-col justify-center px-6 py-20"
          >
            <SectionContent section={section} />
          </div>
        ))}
      </div>
    </div>
  );
}
