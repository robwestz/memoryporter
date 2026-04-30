import type { ReactNode } from "react";
import { useState, useCallback } from "react";
import { Stack } from "@/lib/layout/Stack";
import { Inline } from "@/lib/layout/Inline";
import { useKeyboardShortcut } from "@/lib/hooks/useKeyboardShortcut";
import { VideoBlockPlayer, PlaybackRatePicker } from "./VideoBlockPlayer";
import type { Lesson, Block, ProgressState } from "../types";

export interface LessonPlayerProps {
  lesson: Lesson;
  progress: ProgressState;
  onProgress: (p: ProgressState) => void;
  onComplete: () => void;
  renderBlock: (b: Block) => ReactNode;
  playbackRateOptions?: number[];
}

export function LessonPlayer({ lesson, progress, onProgress, onComplete, renderBlock, playbackRateOptions = [1] }: LessonPlayerProps) {
  const [playbackRate, setPlaybackRate] = useState(1);

  const markDone = useCallback((blockId: string) => {
    if (progress.completedBlocks.includes(blockId)) return;
    const updated: ProgressState = { ...progress, completedBlocks: [...progress.completedBlocks, blockId], lastAccessedAt: new Date() };
    const allDone = lesson.blocks.every((b) => updated.completedBlocks.includes(b.id));
    onProgress({ ...updated, completed: allDone });
    if (allDone) onComplete();
  }, [progress, lesson.blocks, onProgress, onComplete]);

  const handleTime = useCallback((sec: number) => {
    onProgress({ ...progress, videoPositionSec: sec, lastAccessedAt: new Date() });
  }, [progress, onProgress]);

  useKeyboardShortcut({ key: " " }, (e) => {
    const v = document.querySelector("video");
    if (v) { e.preventDefault(); v.paused ? v.play() : v.pause(); }
  });

  const done = progress.completedBlocks.length;
  const total = lesson.blocks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <Stack gap={0} style={{ height: "100%", background: "var(--color-surface-base)" }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: "var(--color-surface-sunken)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-accent-default)", transition: `width var(--motion-base)` }} />
      </div>

      {/* Header */}
      <Inline gap={16} align="center" justify="between" style={{ padding: `var(--space-16) var(--space-24)`, borderBottom: `1px solid var(--color-border-subtle)` }}>
        <Stack gap={4}>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--color-text-primary)" }}>{lesson.title}</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {done}/{total} sections complete{lesson.durationMin && ` · ${lesson.durationMin} min`}
          </div>
        </Stack>
        {playbackRateOptions.length > 1 && <PlaybackRatePicker options={playbackRateOptions} value={playbackRate} onChange={setPlaybackRate} />}
      </Inline>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-24)" }}>
        <Stack gap={24}>
          {lesson.blocks.map((block) => {
            const isDone = progress.completedBlocks.includes(block.id);
            return (
              <div key={block.id} style={{ borderRadius: "var(--radius-lg)", border: `1px solid ${isDone ? "var(--color-success)" : "var(--color-border-subtle)"}`, overflow: "hidden", transition: `border-color var(--motion-fast)` }}>
                <Inline gap={8} align="center" justify="between" style={{ padding: `var(--space-8) var(--space-16)`, background: "var(--color-surface-sunken)", borderBottom: `1px solid var(--color-border-subtle)` }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", textTransform: "capitalize" }}>{block.type}</span>
                  {isDone
                    ? <span style={{ fontSize: "var(--text-xs)", color: "var(--color-success)" }}>✓ Done</span>
                    : <button onClick={() => markDone(block.id)} style={{ fontSize: "var(--text-xs)", padding: `var(--space-4) var(--space-8)`, borderRadius: "var(--radius-sm)", border: `1px solid var(--color-border-default)`, background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer" }}>Mark done</button>
                  }
                </Inline>
                <div style={{ padding: "var(--space-16)" }}>
                  {block.type === "video"
                    ? <VideoBlockPlayer src={block.src} poster={block.poster} captionsSrc={block.captionsSrc} startAt={progress.videoPositionSec ?? 0} playbackRate={playbackRate} onTimeUpdate={handleTime} />
                    : renderBlock(block)
                  }
                </div>
              </div>
            );
          })}
        </Stack>
      </div>

      {/* Bottom bar */}
      {!progress.completed ? (
        <Inline gap={16} align="center" justify="between" style={{ padding: `var(--space-12) var(--space-24)`, borderTop: `1px solid var(--color-border-subtle)`, background: "var(--color-surface-raised)" }}>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>{total - done} section{total - done !== 1 ? "s" : ""} remaining</span>
          <button onClick={onComplete} style={{ fontSize: "var(--text-sm)", fontWeight: 600, padding: `var(--space-8) var(--space-24)`, borderRadius: "var(--radius-md)", border: "none", background: "var(--color-accent-default)", color: "var(--color-text-inverted)", cursor: "pointer" }}>Complete lesson</button>
        </Inline>
      ) : (
        <Inline gap={8} align="center" justify="center" style={{ padding: "var(--space-12)", borderTop: `1px solid var(--color-border-subtle)`, background: "var(--color-success)" }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-inverted)" }}>Lesson complete</span>
        </Inline>
      )}
    </Stack>
  );
}
