import { describe, it, expect } from "vitest";
import { detectDeviceTier } from "./deviceTier";

describe("detectDeviceTier", () => {
  it("retourne incompatible si WebGL est absent", () => {
    const nav = { userAgent: "desktop-chrome", hardwareConcurrency: 8 };
    expect(detectDeviceTier(nav, false)).toBe("incompatible");
  });

  it("retourne desktop pour un user-agent non mobile", () => {
    const nav = {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
      hardwareConcurrency: 8,
    };
    expect(detectDeviceTier(nav, true)).toBe("desktop");
  });

  it("retourne mobile-haut-de-gamme pour un mobile avec beaucoup de coeurs CPU", () => {
    const nav = {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
      hardwareConcurrency: 6,
    };
    expect(detectDeviceTier(nav, true)).toBe("mobile-haut-de-gamme");
  });

  it("retourne mobile-bas-de-gamme pour un mobile avec peu de coeurs CPU", () => {
    const nav = {
      userAgent: "Mozilla/5.0 (Linux; Android 12; SM-A125F)",
      hardwareConcurrency: 4,
    };
    expect(detectDeviceTier(nav, true)).toBe("mobile-bas-de-gamme");
  });

  it("retourne mobile-bas-de-gamme si hardwareConcurrency est indisponible", () => {
    const nav = { userAgent: "Mozilla/5.0 (Linux; Android 10)" };
    expect(detectDeviceTier(nav, true)).toBe("mobile-bas-de-gamme");
  });
});
