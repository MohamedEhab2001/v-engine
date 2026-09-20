import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Deterministic font loading (spec §7): the TTFs live in public/fonts and are
// registered through @remotion/fonts, which delays rendering until every face
// is loaded. No network request happens at render time.
const family = "ArabicPrimary";

loadFont({
  family,
  url: staticFile("fonts/IBMPlexSansArabic-Regular.ttf"),
  weight: "400",
});

loadFont({
  family,
  url: staticFile("fonts/IBMPlexSansArabic-Medium.ttf"),
  weight: "500",
});

loadFont({
  family,
  url: staticFile("fonts/IBMPlexSansArabic-SemiBold.ttf"),
  weight: "600",
});

loadFont({
  family,
  url: staticFile("fonts/IBMPlexSansArabic-Bold.ttf"),
  weight: "700",
});

export const fontFamily = family;
