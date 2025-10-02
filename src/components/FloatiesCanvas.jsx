// src/components/FloatiesCanvas.jsx
import { useEffect, useRef, useReducer, useCallback } from "react";
import {
  floatiesReducer,
  initialState,
} from "../utils/floaties/floatiesReducer";
import { FloatiesEngine } from "../utils/floaties/floatiesEngine";
import "../utils/floaties/floaties.css";

export default function FloatiesCanvas() {
  const [state] = useReducer(floatiesReducer, initialState);
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  // map reducer state to engine config
  const buildEngineConfig = useCallback(() => {
    return {
      COUNT: window.innerWidth / 32,
      SIZE_MIN: 1,
      SIZE_MAX: 8,
      DURATION_MIN: state.durationMin,
      DURATION_MAX: state.durationMax,
      HORIZ_DRIFT: 120,
      EDGE_PAD: 6,
      SPAWN_Y_OFFSET: 24,
      DESPAWN_Y_OFFSET: 24,
      NOISE_MIN: 0.6,
      NOISE_MAX: 2.6,
      MAX_ALLOWED: 80,
      COLOR_MODE: state.colorMode,
      COLOR: "rgba(255, 255, 255, 1)",
      COLORS: state.colors,
    };
  }, [state]);

  useEffect(() => {
    if (!containerRef.current) return;

    const cfg = buildEngineConfig();
    engineRef.current = new FloatiesEngine(containerRef.current, cfg);
    engineRef.current.spawn(cfg.COUNT || 30);

    return () => {
      engineRef.current?.clear();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount once

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const cfg = buildEngineConfig();
    engine.updateConfig(cfg);
    if (typeof cfg.COUNT === "number") {
      engine.spawn(cfg.COUNT);
    }
  }, [state, buildEngineConfig]);

  return <div ref={containerRef} className="floaties-container" />;
}
