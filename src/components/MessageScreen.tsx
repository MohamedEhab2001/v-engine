import React from "react";
import type { CompiledScreen } from "../compiler/compile-screens";
import type { MessageScreen as MessageScreenData } from "../schema/video";
import { panel, theme } from "../theme/theme";
import { SpeakerHeader } from "./SpeakerHeader";
import { SlackMessage } from "./SlackMessage";

// One speaking turn = one screen (spec §2–§3, §38). The speaker identity
// appears once; every message renders as its own container; all containers
// stay visible together until the screen exits. The panel height comes from
// the compiled layout, so this component is a simple flow layout.
export const MessageScreen: React.FC<{
  compiled: CompiledScreen;
}> = ({ compiled }) => {
  const screen = compiled.screen as MessageScreenData;

  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        inset: 0,
        paddingTop: panel.contentPaddingTop,
        paddingBottom: panel.contentPaddingBottom,
        paddingLeft: panel.contentPaddingX,
        paddingRight: panel.contentPaddingX,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <SpeakerHeader
        person={compiled.person ?? { name: screen.speaker }}
        personId={screen.speaker}
        timestamp={screen.timestamp}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.messageContainerGapPx,
          marginTop: theme.headerToMessagesGapPx,
        }}
      >
        {compiled.timedMessages.map((timed) => (
          <SlackMessage
            key={timed.startFrame}
            timed={timed}
            speakerName={compiled.person?.name ?? screen.speaker}
          />
        ))}
      </div>
    </div>
  );
};
