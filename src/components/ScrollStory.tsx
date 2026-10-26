"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import Figure, { rigFor, type CameraRig, type Pose } from "./Figure";
import SectionContent from "./SectionContent";
import { SECTIONS } from "@/data/sections";

export default function ScrollStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  // GSAP tweens these numbers; Figure reads them every frame.
  const rigRef = useRef<CameraRig>(rigFor("intro", null));
  // which topic the figure is acting out (null = idle)
  const poseRef = useRef<Pose>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Observer, ScrollToPlugin);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const container = containerRef.current;
        const stage = stageRef.current;
        if (!container || !stage) return;
        const rig = rigRef.current;
        Object.assign(rig, rigFor("intro", null));

        // Step-by-step story. The page scroll only pins the stage; inside it,
        // one wheel/swipe/key gesture moves exactly one topic forward or
        // back, and input is locked until the move finishes AND the gesture
        // (including trackpad momentum) has died down. That gives a real
        // stop on every topic instead of sliding past it.
        //
        // Timeline: one unit per topic.
        //   0.00-0.60  camera travels to the target
        //   0.35-0.65  text slides in
        //   0.78       rest point (label "s{i+1}")
        //   0.90-1.00  text fades out before the next move
        const N = SECTIONS.length;
        const CAMERA = 0.6;
        const TEXT_IN = 0.35;
        const TEXT_OUT = 0.9;
        const REST = 0.78;
        const STEP_TIME = 1.1; // seconds per move
        const QUIET_MS = 260; // gesture must pause this long before the next step
        const STEPS = N + 1; // 0 = full body intro, 1..N = topics

        const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
        tl.addLabel("s0", 0);

        SECTIONS.forEach((section, i) => {
          tl.to(rig, { ...rigFor(section.target, section.side), duration: CAMERA }, i);
          tl.addLabel(`s${i + 1}`, i + REST);

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
              // the last topic keeps its CTA on screen
              tl.to(textEl, { autoAlpha: 0, duration: 1 - TEXT_OUT }, i + TEXT_OUT);
            }
          }
        });

        let index = 0;
        let animating = false;
        let unlockAt = 0;
        let pinStart = 0;
        let pinEnd = 0;

        // stay 1px inside the pinned range so ScrollTrigger doesn't see us "leave"
        const posFor = (i: number) =>
          Math.min(pinEnd - 1, Math.max(pinStart + 1, pinStart + ((pinEnd - pinStart) * i) / (STEPS - 1)));

        const setPose = (i: number) => {
          poseRef.current = i === 0 ? null : SECTIONS[i - 1].target;
        };

        const goTo = (i: number, instant = false) => {
          index = Math.max(0, Math.min(STEPS - 1, i));
          poseRef.current = null; // stop acting while the camera moves
          const done = () => {
            animating = false;
            unlockAt = Math.max(unlockAt, performance.now() + QUIET_MS);
            setPose(index);
          };
          if (instant) {
            tl.seek(`s${index}`);
            window.scrollTo(0, posFor(index));
            done();
            return;
          }
          animating = true;
          tl.tweenTo(`s${index}`, { duration: STEP_TIME, ease: "power2.inOut", onComplete: done });
          gsap.to(window, {
            scrollTo: { y: posFor(index), autoKill: false },
            duration: STEP_TIME,
            ease: "power2.inOut",
            overwrite: true,
          });
        };

        const step = (dir: 1 | -1) => {
          const now = performance.now();
          const ready = !animating && now >= unlockAt;
          // every input while locked extends the lock: momentum can't chain steps
          unlockAt = Math.max(unlockAt, now + QUIET_MS);
          if (!ready) return;
          const next = index + dir;
          if (next < 0 || next >= STEPS) {
            // past either end: hand scrolling back to the page
            release();
            return;
          }
          goTo(next);
        };

        const observer = Observer.create({
          target: window,
          type: "wheel,touch",
          tolerance: 12,
          preventDefault: true,
          // wheel down = next topic; a finger dragging up = next topic
          onDown: (self) => step(self.event.type.startsWith("touch") ? -1 : 1),
          onUp: (self) => step(self.event.type.startsWith("touch") ? 1 : -1),
        });
        observer.disable();

        const onKey = (e: KeyboardEvent) => {
          if (!observer.isEnabled) return;
          const fwd = ["ArrowDown", "PageDown", " ", "Spacebar"];
          const back = ["ArrowUp", "PageUp"];
          if (fwd.includes(e.key) || back.includes(e.key)) {
            e.preventDefault();
            if (!e.repeat) step(fwd.includes(e.key) ? 1 : -1);
          }
        };
        window.addEventListener("keydown", onKey);

        const capture = (i: number) => {
          if (observer.isEnabled) return;
          observer.enable();
          unlockAt = performance.now() + QUIET_MS; // swallow the arriving momentum
          goTo(i, true);
        };
        const release = () => {
          observer.disable();
          poseRef.current = index === 0 ? null : poseRef.current;
        };

        const st = ScrollTrigger.create({
          trigger: container,
          start: "top top",
          end: "+=" + N * window.innerHeight,
          pin: stage,
          anticipatePin: 1,
          onRefresh: (self) => {
            pinStart = self.start;
            pinEnd = self.end;
          },
          onEnter: () => capture(0),
          onEnterBack: () => capture(STEPS - 1),
          onLeave: () => observer.disable(),
          onLeaveBack: () => observer.disable(),
        });
        pinStart = st.start;
        pinEnd = st.end;
        // page loaded (or refreshed) somewhere inside the story
        if (st.isActive) capture(Math.round(st.progress * (STEPS - 1)));

        return () => {
          window.removeEventListener("keydown", onKey);
          observer.kill();
          st.kill();
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
          className="relative h-screen w-full overflow-hidden flex items-center justify-center"
        >
          <Figure rig={rigRef} pose={poseRef} className="absolute inset-0" />
          {SECTIONS.map((section, i) => (
            <div
              key={section.id}
              ref={(el) => {
                textRefs.current[i] = el;
              }}
              className={`opacity-0 invisible absolute top-1/2 -translate-y-1/2 w-[min(90vw,26rem)] ${
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
