import React from "react";
import type { CameraState } from "../message/camera-presets";

// Camera layer (spec §26–§28): wraps the composition content with subtle
// deterministic motion. The transform comes from the camera resolver — this
// component never computes motion itself.
export const CameraLayer: React.FC<{
  camera: CameraState;
  children: React.ReactNode;
}> = ({ camera, children }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      transform: `translate(${camera.translateX}px, ${camera.translateY}px) scale(${camera.scale})`,
      transformOrigin: "center center",
    }}
  >
    {children}
  </div>
);
