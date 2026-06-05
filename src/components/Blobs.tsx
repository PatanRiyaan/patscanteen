// Decorative background — 3 CSS blobs + a subtle radial vignette.
// Purely visual, no JS animation loops — zero runtime cost beyond CSS.
export function Blobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="blob gradient-brand"
        style={{ width: 460, height: 460, top: -120, left: -120 }}
      />
      <div
        className="blob"
        style={{
          width: 380, height: 380, bottom: -100, right: -80,
          background: "var(--accent)", animationDelay: "-6s",
        }}
      />
      <div
        className="blob gradient-soft"
        style={{
          width: 340, height: 340, top: "40%", left: "55%",
          animationDelay: "-12s", opacity: 0.4,
        }}
      />
    </div>
  );
}
