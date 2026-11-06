"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  ImageSquare,
  UploadSimple,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react/ssr";
import { Button } from "./Button";

/**
 * Live reference capture.
 *
 * This is the part of the product that has to be true: the image never leaves
 * the device. So the shape is deliberate —
 *
 *   camera frame  ->  canvas  ->  raw bytes  ->  SHA-256
 *                                       |
 *                                       +--> only the hash is ever sent
 *
 * The bytes stay in memory for the session so the embedding step (Wave 3) can
 * use them without a second capture; they are never written to disk, never
 * uploaded, and are dropped when this component unmounts or a new frame is
 * taken. The hash is shown on screen precisely so the privacy claim is
 * something the user can see rather than something we assert.
 *
 * A file picker sits beside the camera because judging happens on laptops that
 * often have no webcam. Same pipeline either way: whatever comes in is hashed
 * and the hash is what leaves.
 *
 * Camera access needs a secure context. It works on http://localhost, and
 * silently fails on a plain-HTTP deployed URL — so that failure is caught and
 * named, instead of leaving a dead black box.
 */

export type CapturedReference = {
  /** Hex SHA-256 of the raw frame bytes. This is the only thing that leaves. */
  hash: string;
  /** Object URL for the preview. Revoked on replace/unmount. */
  previewUrl: string;
  /** Source, so the UI can say where the reference came from. */
  source: "camera" | "file";
};

export function ReferenceCapture({
  onCapture,
  captured,
  onClear,
}: {
  onCapture: (ref: CapturedReference, bytes: ArrayBuffer) => void;
  captured?: CapturedReference | null;
  onClear?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [cameraState, setCameraState] = useState<"idle" | "starting" | "live" | "error">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  // Always release the camera on unmount: a live camera light left on after
  // navigating away is a privacy failure the user will notice.
  useEffect(() => stopStream, [stopStream]);

  /**
   * Attach the stream once the <video> element actually exists.
   *
   * The element only renders when `cameraState` is "starting" or "live", so at
   * the moment getUserMedia resolves the ref can still be null. Assigning
   * srcObject inside startCamera therefore silently did nothing and left an
   * empty black preview. Binding it here runs after the element mounts, which
   * is the only point the ref is guaranteed to be present.
   */
  useEffect(() => {
    if (cameraState !== "starting" && cameraState !== "live") return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream || video.srcObject === stream) return;
    video.srcObject = stream;
    void video.play().catch(() => {});
  }, [cameraState]);

  async function startCamera() {
    setCameraState("starting");
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("no-api");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      // Flip to "live" so the <video> mounts; the effect above attaches the
      // stream to it on the next commit.
      setCameraState("live");
    } catch (err) {
      const name = (err as { name?: string })?.name ?? "";
      setCameraState("error");
      setCameraError(
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow it in the browser, or use a photo file instead."
          : name === "NotFoundError"
            ? "No camera was found on this device. Use a photo file instead."
            : window.isSecureContext === false
              ? "The camera needs a secure (HTTPS) page. Use a photo file instead."
              : "The camera could not start. Use a photo file instead.",
      );
    }
  }

  /** Hash the bytes, build a preview URL, hand both back. */
  const emit = useCallback(
    async (bytes: ArrayBuffer, mime: string, source: "camera" | "file") => {
      if (bytes.byteLength === 0) return;
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hash = [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const previewUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
      onCapture({ hash, previewUrl, source }, bytes);
    },
    [onCapture],
  );

  function captureFrame() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    // Cap the working size: a 1280x720 frame is plenty for a reference and
    // keeps the hash and the later embedding cheap.
    const scale = Math.min(1, 1024 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const bytes = await blob.arrayBuffer();
        await emit(bytes, blob.type || "image/jpeg", "camera");
        stopStream();
        setCameraState("idle");
      },
      "image/jpeg",
      0.92,
    );
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = await file.arrayBuffer();
    await emit(bytes, file.type || "image/jpeg", "file");
    // Reset so choosing the same file twice still fires change.
    e.target.value = "";
  }

  /* ── captured: show the reference and its hash ─────────────────────────── */
  if (captured) {
    return (
      <div className="rounded-xl border border-line bg-surface3 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element -- a blob: URL, not an optimisable asset */}
          <img
            src={captured.previewUrl}
            alt="Captured reference"
            className="aspect-square w-full max-w-[180px] shrink-0 rounded-lg border border-line object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 body-4 text-ink">
              <CheckCircle size={16} weight="fill" aria-hidden="true" className="text-accent" />
              Reference captured
              <span className="caption-5 font-mono uppercase tracking-[0.06em] text-ink3">
                {captured.source === "camera" ? "camera" : "file"}
              </span>
            </p>
            <p className="body-6 mt-2 text-ink2">
              This is the hash that leaves the device. The image itself stays here.
            </p>
            <dl className="mt-3 rounded-md border border-line bg-surface2 px-3 py-2.5">
              <dt className="caption-5 font-mono uppercase tracking-[0.08em] text-ink3">
                SHA-256
              </dt>
              <dd className="mt-1 break-all font-mono text-[0.75rem] leading-relaxed text-ink">
                {captured.hash}
              </dd>
            </dl>
            {onClear && (
              <Button variant="ghost" size="sm" className="mt-3" onClick={onClear}>
                Retake
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── idle: camera + file, side by side ─────────────────────────────────── */
  return (
    <div className="rounded-xl border border-dashed border-linestrong bg-surface3 p-4">
      <div className="relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-lg bg-surface2">
        <span aria-hidden="true" className="absolute left-3 top-3 size-4 border-l-2 border-t-2 border-accent/70" />
        <span aria-hidden="true" className="absolute right-3 top-3 size-4 border-r-2 border-t-2 border-accent/70" />
        <span aria-hidden="true" className="absolute bottom-3 left-3 size-4 border-b-2 border-l-2 border-accent/70" />
        <span aria-hidden="true" className="absolute bottom-3 right-3 size-4 border-b-2 border-r-2 border-accent/70" />

        {cameraState === "live" || cameraState === "starting" ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            aria-label="Camera preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="px-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface4 text-accent">
              <Camera size={22} aria-hidden="true" />
            </span>
            <p className="body-4 mt-3 text-ink">Capture a straight-on reference</p>
            <p className="body-6 mt-1 text-ink3">
              One well-lit photo. Only its hash is written.
            </p>
          </div>
        )}
      </div>

      {cameraState === "error" && cameraError && (
        <p role="alert" className="body-6 mt-3 flex items-start gap-2 text-[var(--state-disputed)]">
          <Warning size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
          {cameraError}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {cameraState === "live" ? (
          <Button size="sm" onClick={captureFrame}>
            <Camera size={15} aria-hidden="true" />
            Capture frame
          </Button>
        ) : cameraState === "starting" ? (
          <Button size="sm" disabled>
            <Camera size={15} aria-hidden="true" />
            Starting…
          </Button>
        ) : (
          <Button size="sm" onClick={startCamera}>
            <Camera size={15} aria-hidden="true" />
            Use camera
          </Button>
        )}

        {/* The file path is not a fallback footnote: judging happens on laptops
            with no webcam, so it is offered as an equal action. */}
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
          <UploadSimple size={15} aria-hidden="true" />
          Use a photo file
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          className="sr-only"
          aria-label="Choose a reference photo"
        />
      </div>

      <p className="body-6 mt-3 flex items-start gap-2 text-ink2">
        <ImageSquare size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-ink3" />
        The image never leaves this device. A SHA-256 of the frame is computed
        here and that hash is what goes to the registry.
      </p>
    </div>
  );
}
