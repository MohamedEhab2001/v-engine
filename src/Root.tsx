import React from "react";
import { Composition } from "remotion";
import { ChatStoryVideo } from "./compositions/ChatStoryVideo";
import { compileScreens } from "./compiler/compile-screens";
import { format } from "./theme/base";
import { video } from "./videos/current-video";

// Duration is derived from the compiled screens, never hard-coded.
const compiled = compileScreens(video);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ChatStoryVideo"
        component={ChatStoryVideo}
        durationInFrames={compiled.totalFrames}
        fps={format.fps}
        width={format.width}
        height={format.height}
      />
    </>
  );
};
