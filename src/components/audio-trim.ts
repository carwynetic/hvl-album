export type AudioTrimBounds = {
  start: number;
  end: number | null;
};

export type EffectiveTrackBounds = {
  start: number;
  end: number;
  duration: number;
  triggerTime: number;
};

export const DEFAULT_END_PADDING_SECONDS = 0.05;
export const GAPLESS_TRANSITION_LEAD_SECONDS = 0.035;
export const SILENT_WAV_DATA_URI =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export function getAudioFileName(audioUrl: string): string {
  return audioUrl.split("?")[0].split("/").pop()?.toLowerCase() ?? "audio.mp3";
}

export const AUDIO_TRIM_BY_FILE: Readonly<Record<string, AudioTrimBounds>> = {
  "hvl.mp3": { start: 0, end: null },
  "elegie.mp3": { start: 0.5, end: 86.87 },
  "idk.mp3": { start: 0, end: 194.3 },
  "wtf-bby-im-lit.mp3": { start: 0.58, end: 164.26 },
  "anh-khong-muon-no-de-dang.mp3": { start: 0.62, end: 163.27 },
  "baby.mp3": { start: 0.44, end: 171.86 },
  "yeu-anh-giet-anh.mp3": { start: 0.44, end: 164.62 },
  "mat-moi-tay-chan.mp3": { start: 0.48, end: 191.05 },
  "dao-cua-anh-vua.mp3": { start: 0.34, end: 124.08 },
  "la-gi-cua-nhau.mp3": { start: 0.1, end: 137.44 },
  "night-in-prague.mp3": { start: 0.56, end: 212.27 },
  "mot-cai-om.mp3": { start: 1.14, end: 199.81 },
  "liem.mp3": { start: 1.24, end: 229.83 },
  "neu-nhu-ta-chang-con.mp3": { start: 0, end: 312.57 },
  "ai-moi-la-ke-xau-xa.mp3": { start: 0.14, end: 191.12 },
  "slippery.mp3": { start: 0.28, end: 208.64 },
  "intepol.mp3": { start: 0.88, end: 53.49 },
  "tay-thi.mp3": { start: 0, end: 104.16 },
  "hut-va-hut.mp3": { start: 0, end: 130.76 },
  "dua-chua.mp3": { start: 0.1, end: 182.44 },
  "xa-xoi.mp3": { start: 0, end: 214.9 },
  "che-phu.mp3": { start: 0.2, end: 153.91 },
  "oanh-m-=-thuoc.mp3": { start: 1.48, end: 201.94 },
  "ghet-xog-lai-thik.mp3": { start: 0.74, end: 109.64 },
  "nhin-ke-thu-cua-tao.mp3": { start: 0.76, end: 234.22 },
  "envy.mp3": { start: 0, end: 227.04 },
  "cam-on.mp3": { start: 0, end: 156.6 },
  "khong-can-lo-cho-tao.mp3": { start: 0.18, end: 156.29 },
  "huh.mp3": { start: 0, end: 244.08 },
  "nguyen-van-muoi.mp3": { start: 1.28, end: 236.08 },
  "thit-lon.mp3": { start: 0.14, end: 221.81 },
};

export function getTrackAudioTrim(audioUrl?: string | null): AudioTrimBounds {
  if (!audioUrl) return { start: 0, end: null };
  return AUDIO_TRIM_BY_FILE[getAudioFileName(audioUrl)] ?? { start: 0, end: null };
}

export function getEffectiveTrackBounds(
  rawDuration: number,
  trim: AudioTrimBounds,
): EffectiveTrackBounds {
  if (!Number.isFinite(rawDuration) || rawDuration <= 0) {
    const start = Math.max(0, trim.start);
    const end = trim.end != null && trim.end > start ? trim.end : 0;
    const duration = end > start ? end - start : 0;
    const triggerTime =
      end > start ? Math.max(start, end - GAPLESS_TRANSITION_LEAD_SECONDS) : 0;
    return { start, end, duration, triggerTime };
  }

  const start = Math.min(Math.max(0, trim.start), Math.max(0, rawDuration - 0.5));
  const fallbackEnd = Math.max(start, rawDuration - DEFAULT_END_PADDING_SECONDS);
  const end =
    trim.end != null && trim.end > start + 0.25 && trim.end < rawDuration
      ? trim.end
      : fallbackEnd;
  const duration = Math.max(0, end - start);
  const triggerTime = Math.max(start + 0.1, end - GAPLESS_TRANSITION_LEAD_SECONDS);
  return { start, end, duration, triggerTime };
}
