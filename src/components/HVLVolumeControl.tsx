"use client";

import { useCallback, useRef, useState } from "react";

export type HVLVolumeControlProps = {
  volume: number; // 0 to 1
  isMuted: boolean;
  onVolumeChange: (newVolume: number) => void;
  onToggleMute: () => void;
  className?: string;
};

export function HVLVolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  className = "",
}: HVLVolumeControlProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const effectiveVolume = isMuted ? 0 : volume;
  const percent = Math.round(effectiveVolume * 100);

  const updateVolumeFromClientX = useCallback(
    (clientX: number, target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (clientX - rect.left) / rect.width;
      const clamped = Math.max(0, Math.min(1, ratio));
      onVolumeChange(Math.round(clamped * 100) / 100);
    },
    [onVolumeChange],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateVolumeFromClientX(event.clientX, event.currentTarget);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    event.stopPropagation();
    event.preventDefault();
    updateVolumeFromClientX(event.clientX, event.currentTarget);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    event.stopPropagation();
    event.preventDefault();
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    event.stopPropagation();
    event.preventDefault();
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const delta = event.deltaY < 0 ? 0.05 : -0.05;
    const nextVol = Math.max(0, Math.min(1, Math.round((effectiveVolume + delta) * 100) / 100));
    onVolumeChange(nextVol);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      onVolumeChange(Math.min(1, Math.round((effectiveVolume + 0.05) * 100) / 100));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      onVolumeChange(Math.max(0, Math.round((effectiveVolume - 0.05) * 100) / 100));
    } else if (event.key === "Home") {
      event.preventDefault();
      event.stopPropagation();
      onVolumeChange(0);
    } else if (event.key === "End") {
      event.preventDefault();
      event.stopPropagation();
      onVolumeChange(1);
    } else if (event.key === "m" || event.key === "M") {
      event.preventDefault();
      event.stopPropagation();
      onToggleMute();
    }
  };

  return (
    <div
      className={`floating-player__volume ${isDragging ? "is-dragging" : ""} ${className}`}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onWheel={handleWheel}
      aria-label="Bộ điều khiển âm lượng"
    >
      <button
        type="button"
        className={`floating-player__volume-btn ${effectiveVolume === 0 ? "is-muted" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          onToggleMute();
        }}
        aria-label={effectiveVolume === 0 ? "Bật âm thanh (Phím M)" : "Tắt âm thanh (Phím M)"}
        title={effectiveVolume === 0 ? "Bật âm thanh (M)" : "Tắt âm thanh (M)"}
      >
        {effectiveVolume === 0 ? (
          /* Muted Icon */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : effectiveVolume <= 0.4 ? (
          /* Low Volume Icon */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          /* High Volume Icon */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>

      <div
        ref={sliderRef}
        className={`floating-player__volume-slider ${isDragging ? "is-dragging" : ""}`}
        role="slider"
        aria-label="Thanh trượt âm lượng"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        <div className="floating-player__volume-track">
          <div
            className="floating-player__volume-fill"
            style={{ width: `${percent}%` }}
          />
          <div
            className="floating-player__volume-thumb"
            style={{ left: `${percent}%` }}
          />
        </div>
      </div>

      <span
        className={`floating-player__volume-value ${isHovered || isDragging ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        {effectiveVolume === 0 ? "0%" : `${percent}%`}
      </span>
    </div>
  );
}
