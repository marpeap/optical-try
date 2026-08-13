export type DeviceTier =
  | "desktop"
  | "mobile-haut-de-gamme"
  | "mobile-bas-de-gamme"
  | "incompatible";

const MOBILE_UA_REGEX = /Mobi|Android|iPhone|iPad/i;
const HIGH_END_CPU_THRESHOLD = 6;

export function detectDeviceTier(
  nav: { userAgent: string; hardwareConcurrency?: number },
  hasWebGL: boolean
): DeviceTier {
  if (!hasWebGL) return "incompatible";

  const isMobile = MOBILE_UA_REGEX.test(nav.userAgent);
  if (!isMobile) return "desktop";

  const cores = nav.hardwareConcurrency ?? 0;
  return cores >= HIGH_END_CPU_THRESHOLD ? "mobile-haut-de-gamme" : "mobile-bas-de-gamme";
}
