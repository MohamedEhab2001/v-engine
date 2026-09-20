import React from "react";
import { useCurrentFrame } from "remotion";
import {
  getScreenEnterOpacity,
  getScreenEnterTranslateY,
  getScreenExitOpacity,
  getScreenExitTranslateY,
  getScreenScaleFrom,
} from "../animation/presets";

// Shared screen transition: the outgoing screen fades up and out while the
// incoming screen fades in from below (the two overlap — the chat area is
// never empty between screens). One utility for every screen type.
export const ScreenTransition: React.FC<{
  startFrame: number;
  endFrame: number;
  enterFrames: number;
  exitFrames: number;
  scaleFrom?: number;
  children: React.ReactNode;
}> = ({ startFrame, endFrame, enterFrames, exitFrames, scaleFrom, children }) => {
  const frame = useCurrentFrame();

  const opacity = Math.min(
    getScreenEnterOpacity(frame, startFrame, enterFrames),
    getScreenExitOpacity(frame, endFrame, exitFrames),
  );

  const translateY =
    getScreenEnterTranslateY(frame, startFrame, enterFrames) +
    getScreenExitTranslateY(frame, endFrame, exitFrames);

  const scale = scaleFrom
    ? getScreenScaleFrom(frame, startFrame, scaleFrom, enterFrames)
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
};
