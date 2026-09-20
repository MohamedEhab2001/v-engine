// One-off entry file for generating local placeholder media with Remotion:
//   - SampleClip:   rendered to public/videos/sample-clip.mp4
//   - AvatarSample: rendered to public/avatars/*.png (via --props)
// Not part of the main composition; run examples in README / scripts.
import React from "react";
import {
  AbsoluteFill,
  Composition,
  interpolate,
  registerRoot,
  useCurrentFrame,
} from "remotion";
import "./theme/fonts";
import { typography } from "./theme/typography";

const SampleClip: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const hue = 222 + Math.sin(t * 2) * 24;
  const x = 540 + Math.sin(t * 2.6) * 320;
  const y = 960 + Math.cos(t * 1.8) * 420;
  const size = interpolate(Math.sin(t * 3), [-1, 1], [140, 240]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, hsl(${hue} 55% 20%), hsl(${hue + 42} 65% 8%))`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          background: `hsl(${hue + 60} 80% 60% / 0.85)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 200,
          right: 120,
          textAlign: "center",
          fontFamily: typography.family,
          fontWeight: 700,
          fontSize: 84,
          color: "white",
        }}
      >
        مقطع تجريبي
      </div>
    </AbsoluteFill>
  );
};

const AvatarSample: React.FC<{
  initial: string;
  hue: number;
}> = ({ initial, hue }) => {
  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 512,
          height: 512,
          borderRadius: 256,
          background: `hsl(${hue} 42% 30%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: typography.family,
            fontWeight: 700,
            fontSize: 220,
            color: "white",
          }}
        >
          {initial}
        </span>
      </div>
    </AbsoluteFill>
  );
};

const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="SampleClip"
        component={SampleClip}
        durationInFrames={60}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="AvatarSample"
        component={AvatarSample}
        durationInFrames={1}
        fps={30}
        width={512}
        height={512}
        defaultProps={{ initial: "أ", hue: 265 }}
      />
    </>
  );
};

registerRoot(Root);
