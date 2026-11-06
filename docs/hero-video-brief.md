# Hero background video — brief

A spec for the ambient video that replaces the 2D illustration behind the
hero. Written to be handed to a videographer, a motion designer, or an
AI video generator.

---

## 1. The one sentence

An unlit studio where a single face is being slowly scanned into a
three-dimensional point cloud, and the face resolves — barely — before
dissolving back into the dark.

That is the whole product: a face becomes a record, a record can be proven.

---

## 2. What it must never be

These are hard constraints, not preferences.

| No | Why |
| --- | --- |
| **No recognisable real person** | The product is about likeness rights. Stock footage of a real face is exactly the thing the registry exists to prevent. Any face must be a 3D scan, a point cloud, a silhouette or a mannequin — abstract enough that nobody could claim it as their likeness. |
| **No smiling office people** | Says "corporate stock", not "on-chain registry". |
| **No sweeping gradients** | The interface has zero gradients; a gradient video would make the UI look pasted on. |
| **No fast camera moves** | This sits behind a headline and a search field. Motion steals focus. |
| **No text, logos or UI in the video** | It is a background, not a screen recording. |
| **No bright white flashes** | Contrasts brutally against `#141415`, and triggers photosensitivity concerns. |
| **No high-saturation colour** | The accent (`#73a6ff`) must stay the only saturated thing on screen. |
| **No faces looking off-camera or making eye contact with the lens** | Both read as an advertisement. The face is data, not a model. |

---

## 3. Look and palette

Locked to the interface tokens so the video and the UI read as one material.

| Role | Value | Use in the video |
| --- | --- | --- |
| Background | `#141415` → `#0e0e0f` | Everywhere. This is 85–95% of the frame. |
| Structure / wireframe | `rgba(255,255,255,0.08)` | The scan lines, grid, depth rules. Barely visible on purpose. |
| Secondary structure | `rgba(255,255,255,0.16)` | Leading edge of the scan sweep, the crispest lines. |
| Accent | `#73a6ff` | **The only colour.** The scan beam, a thin contour highlight, one settling dot. |
| Warm hint | `#fa4b00` | At most 2–3 frames' worth, on a single node. Optional. |
| Live / verified | `#7fb89a` | Only if a match "lands": one small settling confirmation. |

Render the whole thing **dark and low-contrast**. If you squint at a still
frame, you should see one blue line and a shape. Everything else is
scarcely more than texture.

---

## 4. Shot description

**Setting.** A pitch-dark void. No floor, no walls, no horizon — but not
pure black either; a faint volumetric haze so the darkness has depth. The
camera sits at chest height, slightly below the face's centre of mass,
looking very slightly upward. This makes the subject feel recorded from a
position of scrutiny rather than admiration.

**Subject.** A head and shoulders, built from a point cloud. Roughly
40–80 thousand points, cool grey-white at 6–12% opacity, with size
varying a hair so the surface shimmers very slightly like something
sampling itself. No skin texture, no eyes, no mouth — the shape alone
carries the read. Slight turn off-centre, about 12–18° to one side, so it
is unmistakably a 3D object and not a photo.

**The action.** A scan plane — a razor-thin horizontal band of
`#73a6ff` at ~35% opacity — sweeps slowly from the crown to the jaw over
roughly 9–11 seconds, then a second pass in the other direction slightly
faster. Points below the sweep light up from 10% to their full opacity and
hold; points above it stay dim. The leading edge of the band is crisp,
and 3–4px of glow trails it, no more.

**Resolution.** On the second pass, at around the 60% mark, a sparse
wireframe surfaces briefly on the face — a few dozen contour lines that
read as topographic. It holds for about 1.5 seconds, then falls away.
Nothing is ever labelled. Nothing is ever confirmed. The face is
number-like throughout.

**Breathing.** A very slow parallax — 2–3% scale drift over the full loop,
like the camera is mounted on something alive. Not a dolly. Not a push.
Just enough that the frame is never truly still.

**Ending.** The loop must be seamless: last frame equals first frame. The
simplest way is to have the sweep exit the bottom of frame and the
dust settle back to its opening state. No cut, no fade, no wipe.

---

## 5. Technical

| Property | Value |
| --- | --- |
| Duration | 12–16 seconds, perfectly looping |
| Aspect | 16:9 master; also deliver a 9:16 crop and a 1:1 if cheap |
| Resolution | 1920×1080 master at 60 fps (30 fps acceptable); keep files under ~6 MB for the 16:9 web version |
| Codec | H.264 MP4 (H.265 optional), plus a WebM VP9 for better compression |
| Colour | sRGB, in-gamut, no HDR |
| Grain | Light film grain at 2–3% — helps hide compression banding in dark areas |
| Motion | Slow enough that 30 fps is fine; avoid strobing entirely |

**Critical for dark video:** dark footage compresses badly. Deliver a
version with grain added and verify there is no blocking in the blacks.
If banding appears, increase the grain rather than the bitrate.

---

## 6. Composition for the layout

The hero is a two-column grid at ≥1024px. The right column holds the
match-preview panel, so **the face should sit in the right half of the
frame**, around 65–75% across, vertically centred. The left 45% of the
frame sits under the headline and must stay almost empty — darkness and
haze only. Confirm the face's edges never cross into the left 40%.

On mobile the video fills the top of the viewport and the headline sits
over it, so the face needs to be legible at 40% crop. Check the 9:16
version with the head fully inside the frame and the bottom third
falling into darkness for the text to sit on.

**Overlay.** The UI will lay a scrim over the video
(`#141415` at roughly 55–70%, scrim stronger on the left). Design for
that: assume contrast will be cut by half. If the video only works at
full brightness, it will not work.

---

## 7. Safe-to-say summary

> Dark, mostly empty studio void. A head-and-shoulders point cloud, cool
> grey, barely visible. One thin electric-blue scan band sweeps down it
> twice, lighting points as it passes. A brief wireframe appears and
> dissolves. Slow parallax, heavy negative space, seamless 15s loop, no
> recognisable person, no colour other than the blue.

---

## 8. One-line prompt, if generating

> Cinematic 15-second seamless loop, 16:9: a human head and shoulders
> rendered as a sparse grey-white 3D point cloud in a pitch-dark volume of
> faint haze, centred in the right half of frame. A single thin
> electric-blue horizontal scan plane sweeps slowly from crown to jaw over
> ten seconds, points brightening as it crosses them then holding; a second
> faster pass; a few dozen topographic contour lines briefly surface on the
> face and dissolve. Extremely low contrast, 90% of the frame is near-black
> (#141415), one blue accent (#73a6ff), light film grain, slow 3% parallax,
> nothing else in the frame. Abstract, clinical, no eyes, no mouth, no real
> person, no text, no logos, no gradients, no lens flare, no fast moves.

---

## 9. Deliverables checklist

- [ ] 16:9 master, 12–16s, seamless loop, MP4 + WebM
- [ ] 9:16 crop with head fully in frame, bottom third dark
- [ ] Poster frame (JPEG, first frame) for `preload="none"` and reduced-motion
- [ ] Verified: left 40% empty, no banding in blacks, ≤6 MB
- [ ] No real person identifiable in any frame

**Fallback plan.** If the video cannot loop invisibly or compresses
badly, the current `HeroScan.tsx` SVG stays as the poster and as the
`prefers-reduced-motion` state. A background video is decoration; the
registry works without it.
