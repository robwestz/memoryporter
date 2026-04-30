import { useRef } from "react";
import { Inline } from "@/lib/layout/Inline";

export function VideoBlockPlayer({ src, poster, captionsSrc, startAt, playbackRate, onTimeUpdate }: {
  src: string; poster?: string; captionsSrc?: string;
  startAt: number; playbackRate: number; onTimeUpdate: (sec: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const started = useRef(false);

  function handleLoadedMetadata() {
    if (!started.current && videoRef.current && startAt > 0) {
      videoRef.current.currentTime = startAt;
      started.current = true;
    }
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }

  return (
    <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <video ref={videoRef} src={src} poster={poster} controls onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={() => videoRef.current && onTimeUpdate(Math.floor(videoRef.current.currentTime))}
        style={{ width: "100%", display: "block", background: "var(--color-surface-inverted)", maxHeight: 480 }}>
        {captionsSrc && <track kind="captions" src={captionsSrc} default />}
        Your browser does not support video playback.
      </video>
    </div>
  );
}

export function PlaybackRatePicker({ options, value, onChange }: { options: number[]; value: number; onChange: (r: number) => void }) {
  return (
    <Inline gap={4} align="center">
      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>Speed:</span>
      {options.map((rate) => (
        <button key={rate} onClick={() => onChange(rate)}
          style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-sm)", border: `1px solid ${value === rate ? "var(--color-accent-default)" : "var(--color-border-default)"}`, background: value === rate ? "var(--color-accent-subtle)" : "transparent", color: value === rate ? "var(--color-text-accent)" : "var(--color-text-secondary)", cursor: "pointer" }}>
          {rate}×
        </button>
      ))}
    </Inline>
  );
}
