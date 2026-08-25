import { useEffect, useRef } from "react";
import lottie from "lottie-web";

const ANIMATION_URL = "/gate/name-animation.json";
const NAME_FILL = "#f5f5f5";
const SUBTITLE_FILL = "#8c8c8c";

async function loadCalSans() {
  if (typeof document === "undefined" || !("fonts" in document)) return;

  const sources = [
    'url("/fonts/CalSans-SemiBold.woff2") format("woff2")',
    'url("/fonts/CalSans-SemiBold.woff") format("woff")',
  ];

  const face = new FontFace("Cal Sans SemiBold", sources.join(", "), {
    weight: "600",
    style: "normal",
  });

  const loaded = await face.load();
  document.fonts.add(loaded);
  await document.fonts.load('600 64px "Cal Sans SemiBold"');
}

function fixTextColors(container) {
  container.querySelectorAll("text").forEach((element) => {
    const fontSize = Number.parseFloat(getComputedStyle(element).fontSize);
    if (!fontSize || fontSize >= 100) return;

    element.setAttribute(
      "fill",
      fontSize >= 40 ? NAME_FILL : SUBTITLE_FILL,
    );
  });
}

export default function GateNameAnimation({
  onLoaded,
  onSequenceStart,
  sequenceStartMs = 3500,
}) {
  const containerRef = useRef(null);
  const sequenceStartedRef = useRef(false);
  const onLoadedRef = useRef(onLoaded);
  const onSequenceStartRef = useRef(onSequenceStart);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
    onSequenceStartRef.current = onSequenceStart;
  }, [onLoaded, onSequenceStart]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animation;
    let cancelled = false;
    sequenceStartedRef.current = false;

    function maybeStartSequence() {
      if (!animation || sequenceStartedRef.current) return;
      const frameRate = animation.frameRate || 30;
      const timeMs = (animation.currentFrame / frameRate) * 1000;
      if (timeMs < sequenceStartMs) return;
      sequenceStartedRef.current = true;
      onSequenceStartRef.current?.();
    }

    async function init() {
      try {
        await loadCalSans();
        if (cancelled) return;

        const response = await fetch(ANIMATION_URL);
        const animationData = await response.json();

        animation = lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: false,
          autoplay: true,
          animationData,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            className: "gate-name-lottie-svg",
          },
        });
      } catch {
        if (cancelled) return;

        animation = lottie.loadAnimation({
          container,
          renderer: "svg",
          loop: false,
          autoplay: true,
          path: ANIMATION_URL,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            className: "gate-name-lottie-svg",
          },
        });
      }

      if (!animation || cancelled) return;

      const applyTextColors = () => fixTextColors(container);

      animation.addEventListener("DOMLoaded", () => {
        applyTextColors();
        onLoadedRef.current?.();
      });
      animation.addEventListener("enterFrame", () => {
        applyTextColors();
        maybeStartSequence();
      });
      animation.addEventListener("complete", applyTextColors);
    }

    init();

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, [sequenceStartMs]);

  return <div ref={containerRef} className="gate-name-lottie" aria-hidden="true" />;
}
