import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { compileScreens } from "../compiler/compile-screens";
import type { CompiledScreen } from "../compiler/compile-screens";
import { timing } from "../animation/timings";
import {
  getScreenEnterOpacity,
  getScreenExitOpacity,
  getVideoEndFade,
} from "../animation/presets";
import {
  slackTheme as discord,
  panelRegionHeightPx,
} from "../theme/theme";
import { ambienceVolumeAt } from "../message/audio-direction";
import {
  composeCameraStates,
  getCameraKeyFrame,
  getCameraState,
  getMessageZoomState,
  MESSAGE_ZOOM_FRAMES,
} from "../message/camera-presets";
import { Hook } from "../components/Hook";
import { SlackFrame } from "../components/SlackFrame";
import type { ChannelRailItem } from "../components/SlackSidebar";
import { ScreenTransition } from "../components/ScreenTransition";
import { MessageScreen } from "../components/MessageScreen";
import { GroupEventScreen } from "../components/GroupEventScreen";
import { ChannelCreateScreen } from "../components/ChannelCreateScreen";
import { MediaScreen } from "../components/MediaScreen";
import { TimePassageScreen } from "../components/TimePassageScreen";
import { FormInteractionScreen } from "../components/FormInteractionScreen";
import { CallScreen } from "../components/CallScreen";
import { PresenceScreen } from "../components/PresenceScreen";
import { CameraLayer } from "../components/CameraLayer";
import { NotificationOverlayCard } from "../components/NotificationOverlay";
import { Soundtrack } from "../audio/soundtrack";
import { video } from "../videos/current-video";

const compiled = compileScreens(video);

const panelEnterFrame = Math.max(0, timing.firstScreenDelayFrames - 2);

// Sidebar rail data: one entry per channel, in the order it first becomes
// active — the very first channel is present from the start (frame 0), any
// later channel pops in exactly when its channel-create screen starts.
const channelRail: ChannelRailItem[] = (() => {
  const seen = new Set<string>();
  const items: ChannelRailItem[] = [];
  for (const screen of compiled.screens) {
    if (!screen.channelKey || !screen.channel || seen.has(screen.channelKey)) {
      continue;
    }
    seen.add(screen.channelKey);
    items.push({
      key: screen.channelKey,
      channel: screen.channel,
      introducedAtFrame: items.length === 0 ? 0 : screen.startFrame,
    });
  }
  return items;
})();

const renderScreen = (active: CompiledScreen): React.ReactNode => {
  const screen = active.screen;

  if (screen.type === "messages") {
    return <MessageScreen compiled={active} />;
  }
  if (screen.type === "group-event") {
    return (
      <GroupEventScreen
        event={screen.event}
        eventText={active.eventText ?? ""}
        personName={active.person?.name ?? screen.person}
        personId={screen.person}
        avatarSrc={active.person?.avatar}
        timestamp={screen.timestamp}
      />
    );
  }
  if (screen.type === "channel-create") {
    return active.channel ? (
      <ChannelCreateScreen
        channel={active.channel}
        channelKey={active.channelKey ?? screen.channel}
        eventText={active.eventText ?? ""}
        timestamp={screen.timestamp}
      />
    ) : null;
  }
  if (screen.type === "form-interaction") {
    return <FormInteractionScreen compiled={active} />;
  }
  if (screen.type === "time-passage") {
    return <TimePassageScreen compiled={active} />;
  }
  if (screen.type === "call") {
    return <CallScreen compiled={active} />;
  }
  if (screen.type === "presence") {
    return <PresenceScreen compiled={active} />;
  }
  return <MediaScreen compiled={active} />;
};

const scaleFromFor = (active: CompiledScreen): number | undefined =>
  active.screen.type === "group-event" ||
  active.screen.type === "time-passage" ||
  active.screen.type === "channel-create"
    ? 0.94
    : undefined;

const frameGeometry = (
  visible: CompiledScreen[],
  frame: number,
): { height: number; top: number } => {
  let height: number;

  if (visible.length === 0) {
    height = 360;
  } else if (visible.length === 1) {
    height = visible[0].panelHeight;
  } else {
    const [outgoing, incoming] = visible;
    const overlapLength = Math.max(1, outgoing.endFrame - incoming.startFrame);
    const progress = interpolate(
      (frame - incoming.startFrame) / overlapLength,
      [0, 1],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      },
    );
    height = Math.round(
      outgoing.panelHeight +
        (incoming.panelHeight - outgoing.panelHeight) * progress,
    );
  }

  const top = Math.round((panelRegionHeightPx - height) / 2);
  return { height, top };
};

// Camera direction (spec §48): explicit screen camera → beat preset →
// static; reacts to the screen's key message. Channel-create screens don't
// carry a story beat (they're a system moment) but still get a directed
// camera — the "channel-focus" push toward the sidebar reveal.
const cameraFor = (active: CompiledScreen, frame: number) => {
  const preset =
    active.screen.type === "channel-create"
      ? "channel-focus"
      : (active.beat?.camera ?? "static");
  const keyFrame = getCameraKeyFrame(
    active.timedMessages.map((m) => m.enterFrame),
    active.timedMessages.map((m) => m.message.state ?? "normal"),
  );
  const base = getCameraState(
    preset,
    frame,
    active.startFrame,
    active.endFrame,
    keyFrame,
  );

  // Per-message zoom (schema: message.zoom) punctuates the screen's own
  // camera direction rather than replacing it — first flagged message
  // whose window is currently active wins (never stack two pushes).
  const zoomedMessage = active.timedMessages.find(
    (timed) =>
      timed.message.zoom &&
      frame - timed.enterFrame >= 0 &&
      frame - timed.enterFrame < MESSAGE_ZOOM_FRAMES,
  );
  if (!zoomedMessage) {
    return base;
  }
  return composeCameraStates(
    base,
    getMessageZoomState(frame - zoomedMessage.enterFrame),
  );
};

export const ChatStoryVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const visible = compiled.screens.filter(
    (candidate) =>
      frame >= candidate.startFrame && frame < candidate.endFrame,
  );

  const panelScreens = visible.filter(
    (candidate) => candidate.screen.type !== "time-passage",
  );
  const passageScreens = visible.filter(
    (candidate) => candidate.screen.type === "time-passage",
  );

  const panelOpacity = panelScreens.length
    ? Math.max(
        ...panelScreens.map((candidate) =>
          Math.max(
            getScreenEnterOpacity(frame, candidate.startFrame, candidate.enterFrames),
            getScreenExitOpacity(frame, candidate.endFrame, candidate.exitFrames),
          ),
        ),
      )
    : 0;

  const { height, top } = frameGeometry(panelScreens, frame);

  // The topmost (incoming) panel screen directs the header/sidebar, same
  // convention the camera already uses for the two-screen overlap case.
  const topPanelScreen = panelScreens[panelScreens.length - 1] ?? null;
  const activeChannelKey = topPanelScreen?.channelKey ?? channelRail[0]?.key ?? null;
  const activeChannel = topPanelScreen?.channel ?? channelRail[0]?.channel ?? null;

  const endFade = getVideoEndFade(
    frame,
    compiled.totalFrames,
    timing.screenExitFrames + 2,
  );

  // Camera: the topmost visible screen directs; others are entering/exiting.
  const camera = visible.length
    ? cameraFor(visible[visible.length - 1], frame)
    : { scale: 1, translateX: 0, translateY: 0 };

  const ambienceBase = video.ambience?.volume ?? 0.08;

  return (
    <AbsoluteFill style={{ backgroundColor: discord.pageBackground }}>
      <Soundtrack compiled={compiled} />

      {video.ambience ? (
        <Audio
          src={staticFile(video.ambience.src)}
          loop
          volume={(f) =>
            ambienceVolumeAt(compiled.screens, ambienceBase, f) *
            getVideoEndFade(f, compiled.totalFrames, timing.screenExitFrames + 2)
          }
        />
      ) : null}

      <CameraLayer camera={camera}>
        <div
          dir="rtl"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            opacity: endFade,
          }}
        >
          <Hook text={video.hook.text} highlights={video.hook.highlights} />

          <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
            <SlackFrame
              height={height}
              top={top}
              enterFrame={panelEnterFrame}
              opacity={panelOpacity}
              workspaceName={video.workspaceName}
              channelRail={channelRail}
              activeChannelKey={activeChannelKey}
              activeChannel={activeChannel}
            >
              {panelScreens.map((active) => (
                <ScreenTransition
                  key={active.index}
                  startFrame={active.startFrame}
                  endFrame={active.endFrame}
                  enterFrames={active.enterFrames}
                  exitFrames={active.exitFrames}
                  scaleFrom={scaleFromFor(active)}
                >
                  {renderScreen(active)}
                </ScreenTransition>
              ))}
            </SlackFrame>

            {passageScreens.map((active) => (
              <ScreenTransition
                key={active.index}
                startFrame={active.startFrame}
                endFrame={active.endFrame}
                enterFrames={active.enterFrames}
                exitFrames={active.exitFrames}
                scaleFrom={0.97}
              >
                <TimePassageScreen compiled={active} />
              </ScreenTransition>
            ))}

            {/* Notification overlays (spec §19): compact, non-blocking. */}
            {visible.map((active) =>
              active.screen.type === "messages" && active.screen.overlays
                ? active.screen.overlays.map((overlay, overlayIndex) => (
                    <NotificationOverlayCard
                      key={`${active.index}-${overlayIndex}`}
                      overlay={overlay}
                      startFrame={
                        active.startFrame + (overlay.delayFrames ?? 0)
                      }
                    />
                  ))
                : null,
            )}
          </div>
        </div>
      </CameraLayer>
    </AbsoluteFill>
  );
};
