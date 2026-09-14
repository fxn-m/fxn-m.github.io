import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router";

// Studies preserved at archive/footer-art-studies. Original drift is the default.
export function FooterArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  // An outer query survives hash-router navigation; route queries work for individual links too.
  const islands =
    (searchParams.get("footer") ?? new URLSearchParams(window.location.search).get("footer")) ===
    "islands";

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchor = anchorRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !anchor) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    let lastFrame = 0;
    let elapsed = 8;
    let ink = getComputedStyle(document.body).getPropertyValue("--foreground").trim();

    function paint() {
      if (!canvas || !context || !anchor) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const top = anchor.getBoundingClientRect().top;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== height * ratio) {
        canvas.width = Math.round(width * ratio);
        canvas.height = height * ratio;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      if (top >= height) return;
      // Keep the art aligned with its document-flow slot, but clip at the viewport,
      // rather than the document bottom, so bounce can reveal more of the contours.
      context.save();
      context.beginPath();
      context.rect(0, Math.max(0, top), width, Math.max(0, height - top));
      context.clip();
      context.translate(0, top);
      context.strokeStyle = ink;
      const contrast = document.body.classList.contains("dark") ? 1 : 5;
      const lineWidth = document.body.classList.contains("dark") ? 0.8 : 1;
      context.lineWidth = lineWidth;
      if (islands) {
        for (let island = 0; island < 3; island++) {
          const cx = width * (island / 2) + Math.sin(elapsed * 0.1 + island) * 18;
          for (let ring = 0; ring < 20; ring++) {
            context.beginPath();
            context.globalAlpha = (0.13 + ring * 0.012) * contrast;
            for (let step = 0; step <= 180; step++) {
              const angle = (step / 180) * Math.PI * 2;
              const radius =
                (22 + ring * 7) *
                (1 +
                  0.12 * Math.sin(angle * 3 + elapsed * 0.12 + island) +
                  0.07 * Math.cos(angle * 5 - elapsed * 0.09));
              const x = cx + Math.cos(angle) * radius * 1.55;
              const y = 187 + Math.sin(angle) * radius * 0.8;
              if (step === 0) context.moveTo(x, y);
              else context.lineTo(x, y);
            }
            context.closePath();
            context.stroke();
          }
        }
        context.restore();
        return;
      }
      const lines = Math.max(25, Math.ceil((height - top) / 5));
      for (let line = 0; line < lines; line++) {
        context.beginPath();
        context.globalAlpha = Math.min(0.408, 0.12 + line * 0.012) * contrast;
        for (let x = -4; x <= width + 4; x += 4) {
          const y =
            95 +
            line * 5 +
            Math.sin(x / 180 + elapsed * 0.13 + line * 0.06) * 30 +
            Math.cos(x / 97 - elapsed * 0.1 + line * 0.09) * 13;
          if (x === -4) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
      context.restore();
    }

    function animate(now: number) {
      if (now - lastFrame >= 40) {
        elapsed += lastFrame ? (now - lastFrame) / 1000 : 0;
        lastFrame = now;
        paint();
      }
      frame = requestAnimationFrame(animate);
    }

    function syncAnimation() {
      cancelAnimationFrame(frame);
      lastFrame = 0;
      paint();
      if (visible && !document.hidden && !motion.matches) {
        frame = requestAnimationFrame(animate);
      }
    }

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    const resize = new ResizeObserver(paint);
    const theme = new MutationObserver(() => {
      ink = getComputedStyle(document.body).getPropertyValue("--foreground").trim();
      paint();
    });
    intersection.observe(anchor);
    resize.observe(canvas);
    resize.observe(document.body);
    theme.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    motion.addEventListener("change", syncAnimation);
    document.addEventListener("visibilitychange", syncAnimation);
    window.addEventListener("scroll", paint, { passive: true });
    window.visualViewport?.addEventListener("scroll", paint);
    paint();

    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resize.disconnect();
      theme.disconnect();
      motion.removeEventListener("change", syncAnimation);
      document.removeEventListener("visibilitychange", syncAnimation);
      window.removeEventListener("scroll", paint);
      window.visualViewport?.removeEventListener("scroll", paint);
    };
  }, [islands]);

  return (
    <div aria-hidden="true" className="mt-auto w-full shrink-0 pt-6">
      <div ref={anchorRef} className="h-45" />
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 block h-full w-full" />
    </div>
  );
}
