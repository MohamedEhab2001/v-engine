import React from "react";
import { Img, OffthreadVideo, staticFile } from "remotion";
import type { CompiledScreen } from "../compiler/compile-screens";
import type { MediaScreen as MediaScreenData } from "../schema/video";
import { discordLikeTheme as discord } from "../theme/theme";

// Media screen (migration spec §38): image or video filling the panel
// content area with cover/contain fit. It transitions like every other
// screen (the ScreenTransition wrapper handles enter/exit) and never
// overlays accumulated chat history.
export const MediaScreen: React.FC<{
  compiled: CompiledScreen;
}> = ({ compiled }) => {
  const screen = compiled.screen as MediaScreenData;
  const objectFit = screen.fit === "contain" ? "contain" : "cover";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: discord.secondaryBackground,
      }}
    >
      {screen.mediaType === "image" ? (
        <Img
          src={staticFile(screen.src)}
          style={{ width: "100%", height: "100%", objectFit }}
        />
      ) : (
        <OffthreadVideo
          src={staticFile(screen.src)}
          muted={screen.muted ?? true}
          style={{ width: "100%", height: "100%", objectFit }}
        />
      )}
    </div>
  );
};
