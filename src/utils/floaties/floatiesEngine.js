// floatiesEngine.js
// A standalone class that creates and animates floating circles from bottom → top.
// Designed for use in React (attach to a container, clean up on unmount).

/* ---------------- helpers ---------------- */
const rnd = (a = 0, b = 1) => Math.random() * (b - a) + a;
const rndInt = (a, b) => Math.floor(rnd(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function cubicPoint(t, p0, p1, p2, p3) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

const EASE = (t) => -(Math.cos(Math.PI * t) - 1) / 2; // easeInOutSine

/* ---------------- Floatie class ---------------- */
class Floatie {
  constructor(container, config) {
    this.container = container;
    this.config = config;

    this.size = Math.round(rnd(config.SIZE_MIN, config.SIZE_MAX));
    this.noise = rnd(config.NOISE_MIN, config.NOISE_MAX);

    this.el = document.createElement("div");
    this.el.className = "upfloaty";
    this.el.style.width = `${this.size}px`;
    this.el.style.height = `${this.size}px`;
    this.el.style.opacity = "0";
    this.el.style.zIndex = String(1000 + this.size);

    this.setColor();

    container.appendChild(this.el);
    this.reset(true);
  }

  setColor() {
    if (this.config.COLOR_MODE === "random") {
      const arr = this.config.COLORS?.length
        ? this.config.COLORS
        : [this.config.COLOR];
      this.color = arr[rndInt(0, arr.length - 1)];
    } else {
      this.color = this.config.COLOR;
    }
    this.el.style.background = this.color;
  }

  reset(initial = false) {
    const vp = {
      w: this.container.offsetWidth,
      h: this.container.offsetHeight,
    };

    // spawn X is always chosen inside horizontal bounds
    const spawnX = Math.round(
      rnd(
        this.config.EDGE_PAD,
        Math.max(this.config.EDGE_PAD, vp.w - this.size - this.config.EDGE_PAD)
      )
    );

    // spawnY for the logical path start (offscreen bottom)
    const spawnY = vp.h + this.size + this.config.SPAWN_Y_OFFSET;

    const endX = clamp(
      spawnX + rnd(-this.config.HORIZ_DRIFT, this.config.HORIZ_DRIFT),
      this.config.EDGE_PAD,
      Math.max(this.config.EDGE_PAD, vp.w - this.size - this.config.EDGE_PAD)
    );
    const endY = -this.size - this.config.DESPAWN_Y_OFFSET;

    const oneThirdY = spawnY + (endY - spawnY) * 0.33;
    const twoThirdY = spawnY + (endY - spawnY) * 0.66;
    const cpJitterX = 80 + Math.abs(endX - spawnX) * 0.25;
    const cpJitterY = Math.max(60, Math.abs(endY - spawnY) * 0.12);

    const p0 = { x: spawnX, y: spawnY };
    const p3 = { x: endX, y: endY };
    const p1 = {
      x: clamp(
        spawnX + rnd(-cpJitterX, cpJitterX),
        this.config.EDGE_PAD,
        vp.w - this.size - this.config.EDGE_PAD
      ),
      y: oneThirdY + rnd(-cpJitterY, cpJitterY),
    };
    const p2 = {
      x: clamp(
        endX + rnd(-cpJitterX, cpJitterX),
        this.config.EDGE_PAD,
        vp.w - this.size - this.config.EDGE_PAD
      ),
      y: twoThirdY + rnd(-cpJitterY, cpJitterY),
    };

    this.path = { p0, p1, p2, p3 };
    this.duration = rnd(this.config.DURATION_MIN, this.config.DURATION_MAX);

    if (this.config.COLOR_MODE === "random") {
      this.setColor();
    }

    const now = performance.now();

    if (initial) {
      // Seed the floatie at a random progress along the path so the screen looks populated.
      // Avoid extremes: bias t0 into the mid-range so floaties aren't all at the bottom or already faded-out.
      // Use the visible opacity zone (0.12 -> fadeStart) to keep them mostly visible initially.
      const fadeStart = 0.78;
      const tMin = 0.12;
      const tMax = Math.max(0.6, fadeStart - 0.02); // keep most seeds before fade-out
      const t0 = rnd(tMin, tMax);

      // compute the physical position along the bezier for t0
      const pt = cubicPoint(t0, p0, p1, p2, p3);

      // apply small noise offsets consistent with runtime
      const timeScale = 0.0011;
      const nx = Math.sin(now * timeScale * (1.01 + (p1.x % 6))) * this.noise;
      const ny = Math.cos(now * timeScale * (1.27 + (p2.y % 5))) * this.noise;

      this.el.style.transform = `translate3d(${(pt.x + nx).toFixed(2)}px, ${(
        pt.y + ny
      ).toFixed(2)}px, 0)`;

      // set opacity consistent with update() logic
      if (t0 < 0.12) {
        this.el.style.opacity = String(clamp(t0 / 0.12, 0, 1));
      } else {
        if (t0 > fadeStart) {
          this.el.style.opacity = String(
            clamp(1 - (t0 - fadeStart) / (1 - fadeStart), 0, 1)
          );
        } else {
          this.el.style.opacity = "1";
        }
      }

      // Make update() behave as if it has been running already up to t0
      this.startAt = now - t0 * this.duration;
    } else {
      // normal spawn from bottom (offscreen) with tiny initial stagger
      this.startAt = now + rnd(0, 160);
      this.el.style.opacity = "0";
      // position offscreen at spawn so it will animate in
      this.el.style.transform = `translate3d(${p0.x}px, ${p0.y}px, 0)`;
    }

    this.alive = true;
  }

  update(now) {
    if (!this.alive) return;
    if (now < this.startAt) return;

    const tRaw = clamp((now - this.startAt) / this.duration, 0, 1);
    const t = EASE(tRaw);
    const pt = cubicPoint(
      t,
      this.path.p0,
      this.path.p1,
      this.path.p2,
      this.path.p3
    );

    const timeScale = 0.0011;
    const nx =
      Math.sin(now * timeScale * (1.01 + (this.path.p1.x % 6))) * this.noise;
    const ny =
      Math.cos(now * timeScale * (1.27 + (this.path.p2.y % 5))) * this.noise;

    this.el.style.transform = `translate3d(${(pt.x + nx).toFixed(2)}px, ${(
      pt.y + ny
    ).toFixed(2)}px, 0)`;

    if (tRaw < 0.12) {
      this.el.style.opacity = String(clamp(tRaw / 0.12, 0, 1));
    } else {
      const fadeStart = 0.78;
      if (tRaw > fadeStart) {
        this.el.style.opacity = String(
          clamp(1 - (tRaw - fadeStart) / (1 - fadeStart), 0, 1)
        );
      } else {
        this.el.style.opacity = "1";
      }
    }

    if (tRaw >= 1) {
      const delay = rnd(80, 420);
      this.startAt = now + delay;
      this.reset(false);
    }
  }

  remove() {
    this.alive = false;
    this.el.remove();
  }
}

/* ---------------- Engine class ---------------- */
export class FloatiesEngine {
  constructor(container, config) {
    this.container = container;
    this.config = config;
    this.items = [];
    this.running = false;
    this.rafId = null;
  }

  spawn(count) {
    // Instead of instant clear→spawn that can feel jumpy when called repeatedly,
    // we clear and then create the requested set seeded. This keeps first paint nice.
    this.clear();
    const toSpawn = clamp(count, 0, this.config.MAX_ALLOWED || 80);
    for (let i = 0; i < toSpawn; i++) {
      const f = new Floatie(this.container, this.config);
      this.items.push(f);
    }
    if (!this.running) this.start();
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = (now) => {
      for (const it of this.items) it.update(now);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    // apply color changes immediately
    if (newConfig.COLOR || newConfig.COLOR_MODE) {
      for (const it of this.items) it.setColor();
    }
    // If COUNT changed you probably want to re-spawn to match it
    if (typeof newConfig.COUNT === "number") {
      this.spawn(newConfig.COUNT);
    }
  }

  clear() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    for (const it of this.items) it.remove();
    this.items = [];
    this.running = false;
    this.rafId = null;
  }
}
