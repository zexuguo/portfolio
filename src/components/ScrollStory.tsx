"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Figure, { rigFor, type CameraRig, type Pose } from "./Figure";
import Hero from "./Hero";
import SectionContent from "./SectionContent";
import { SECTIONS } from "@/data/sections";

// Timeline units (1 unit = UNIT_VH of scroll).
//   hero hold | per topic: transition (camera + text swap), then a long hold
// While a topic is held nothing moves except the figure's gesture, so the
// text can be read calmly. When scrolling stops, it settles on the nearest
// topic.
const HERO = 0.9;
const TRANS = 1;
const HOLD = 1.5;
const UNIT_VH = 0.42;
const N = SECTIONS.length;
const topicStart = (i: number) => HERO + i * (TRANS + HOLD);
const label = (i: number) => (i === 0 ? 0 : topicStart(i - 1) + TRANS + HOLD / 2);

export default function ScrollStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const goToRef = useRef<(i: number) => void>(() => {});
  // GSAP tweens these numbers; Figure reads them every frame.
  const rigRef = useRef<CameraRig>(rigFor("intro", "left"));
  const poseRef = useRef<Pose>(null);
  // mobile hero figure: fixed full-body framing
  const mobileRigRef = useRef<CameraRig>(rigFor("intro", null));
  const mobilePoseRef = useRef<Pose>(null);
  const [active, setActive] = useState(0); // 0 = hero, 1..N = topics

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const container = containerRef.current;
        const stage = stageRef.current;
        if (!container || !stage) return;
        const rig = rigRef.current;
        Object.assign(rig, rigFor("intro", "left"));

        const total = topicStart(N - 1) + TRANS + HOLD;
        let jumping = false; // index click in progress: don't fight it with snapping
        const labelProgress = () => Array.from({ length: N + 1 }, (_, i) => label(i) / total);
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: () => "+=" + total * UNIT_VH * window.innerHeight,
            pin: stage,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              // settle on the next topic in the scroll direction, but stay put
              // when already sitting on one (e.g. after a click in the index)
              snapTo: (value: number, self?: ScrollTrigger) => {
                if (jumping) return value;
                const pts = labelProgress();
                const near = pts.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a));
                if (Math.abs(near - value) < 0.004) return near;
                const dir = self?.direction ?? 1;
                const next = dir > 0 ? pts.find((p) => p > value) : [...pts].reverse().find((p) => p < value);
                return next ?? near;
              },
              inertia: false, // judge from where the scroll stopped, not a projection
              duration: { min: 0.35, max: 0.9 },
              delay: 0.12,
              ease: "power2.inOut",
            },
            onUpdate: () => {
              const t = tl.time();
              // topic currently held (the gesture starts as the camera lands)
              let idx = 0;
              for (let i = 0; i < N; i++) {
                if (t >= topicStart(i) + TRANS * 0.85) idx = i + 1;
              }
              const settled = idx > 0 && t <= topicStart(idx - 1) + TRANS + HOLD;
              poseRef.current = settled ? SECTIONS[idx - 1].target : null;
              setActive((prev) => (prev === idx ? prev : idx));
            },
          },
        });
        tl.addLabel("s0", 0);

        SECTIONS.forEach((section, i) => {
          const at = topicStart(i);
          tl.to(rig, { ...rigFor(section.target, section.side), duration: TRANS }, at);
          const prev = i === 0 ? heroRef.current : textRefs.current[i - 1];
          if (prev) tl.to(prev, { autoAlpha: 0, y: -16, duration: TRANS * 0.35, ease: "power1.in" }, at);
          const el = textRefs.current[i];
          if (el) {
            tl.fromTo(
              el,
              { autoAlpha: 0, y: 24 },
              { autoAlpha: 1, y: 0, duration: TRANS * 0.5, ease: "power2.out" },
              at + TRANS * 0.5
            );
          }
          tl.addLabel(`s${i + 1}`, label(i + 1));
        });
        // keep the last hold in the timeline so its length is scrollable
        tl.set({}, {}, total);

        goToRef.current = (i: number) => {
          const st = tl.scrollTrigger;
          if (!st) return;
          jumping = true;
          gsap.to(window, {
            scrollTo: { y: st.start + ((st.end - st.start) * label(i)) / total, autoKill: false },
            duration: 1.2,
            ease: "power2.inOut",
            overwrite: true,
            onComplete: () => {
              jumping = false;
            },
          });
        };

        return () => {
          goToRef.current = () => {};
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      mm.add("(max-width: 767px)", () => {
        const items = gsap.utils.toArray<HTMLElement>(".mobile-section");
        items.forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 32 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
            }
          );
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} id="historia">
      {/* Desktop / tablet: pinned story */}
      <div ref={containerRef} className="hidden md:block relative">
        <div ref={stageRef} className="relative h-screen w-full overflow-hidden">
          <Figure rig={rigRef} pose={poseRef} className="absolute inset-0 h-full w-full" />

          <div
            ref={heroRef}
            className="absolute top-1/2 -translate-y-1/2 left-10 lg:left-20 xl:left-28 w-[min(44vw,32rem)]"
          >
            <Hero />
            <ScrollHint className="mt-12" />
          </div>

          {SECTIONS.map((section, i) => (
            <div
              key={section.id}
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              className={`opacity-0 invisible absolute top-1/2 -translate-y-1/2 pt-8 w-[min(44vw,28rem)] ${
                section.side === "left" ? "left-10 lg:left-20 xl:left-28" : "right-16 lg:right-24 xl:right-32"
              }`}
            >
              <SectionContent section={section} compact />
            </div>
          ))}

          <nav
            aria-label="Temas"
            className="absolute right-4 lg:right-7 top-1/2 -translate-y-1/2 flex flex-col items-end gap-3"
          >
            {SECTIONS.map((section, i) => {
              const on = active === i + 1;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToRef.current(i + 1)}
                  aria-label={section.title}
                  aria-current={on ? "step" : undefined}
                  title={section.title}
                  className="group flex items-center gap-2 py-1 cursor-pointer"
                >
                  <span
                    className={`font-mono text-[10px] tabular-nums transition-colors duration-300 ${
                      on
                        ? "text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`block h-px transition-all duration-500 ${
                      on ? "w-6 bg-neutral-900 dark:bg-neutral-100" : "w-3 bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile: hero with the figure, then stacked sections */}
      <div className="md:hidden">
        <section className="relative min-h-[100svh] flex flex-col justify-end px-6 pt-24 pb-14">
          <Figure
            rig={mobileRigRef}
            pose={mobilePoseRef}
            className="absolute inset-x-0 top-14 h-[62svh] w-full"
          />
          <Hero className="relative" />
        </section>
        {SECTIONS.map((section) => (
          <div key={section.id} className="mobile-section px-6 py-16">
            <SectionContent section={section} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ScrollHint({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-neutral-500 dark:text-neutral-400 ${className}`}>
      <span className="relative block h-9 w-[22px] rounded-full border border-current opacity-70">
        <span className="absolute left-1/2 top-2 h-1.5 w-0.5 -translate-x-1/2 rounded-full bg-current animate-[scroll-dot_1.8s_ease-in-out_infinite]" />
      </span>
      <span className="font-mono text-xs uppercase tracking-[0.18em]">Desliza para conocerme</span>
    </div>
  );
}
