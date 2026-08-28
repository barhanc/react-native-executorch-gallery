# Handoff — React Native ExecuTorch Gallery + Next Task (Text-to-Speech)

Date: 2026-08-28 · Repos: `react-native-executorch` (core + example apps), `react-native-executorch-gallery` (this app)

---

## 1. The Big Picture

`react-native-executorch-gallery` is a **production-grade Expo showcase app** that demonstrates
idiomatic on-device ML task usage of the `react-native-executorch` library. Each screen is kept
**thin and minimal** and doubles as the source of truth for the library's docs code examples.

The workspace is monorepo-ish (separate repos, not npm workspace):

- `react-native-executorch/` — the library (`packages/react-native-executorch`) + example apps
  (`apps/computer-vision`, `apps/nlp`, `apps/speech`).
- `react-native-executorch-gallery/` — this showcase app (own git repo). It depends on
  `react-native-executorch` as a **regular npm dependency**, resolved through the **verdaccio
  registry** (`http://localhost:4873`), not an npm workspace.

---

## 2. Established Coding Standards (the "gallery-task-screen" skill)

A skill lives at `react-native-executorch-gallery/.agents/skills/gallery-task-screen/SKILL.md`.
Its rules are **mandatory** for every screen:

1. **Screens are thin wrappers.** `src/app/<task>.tsx` holds only: a `use<Task>()` hook call, a few
   `useState`s, one `run()` handler, and minimal `<TaskScreen>` UI.
2. **Show idiomatic library usage, nothing more.** No tensor/preprocessing/schema internals in screens.
3. **Move extra logic into custom hooks/components** under `src/hooks/` / `src/components/`.
4. **Every custom hook/component must have JSDoc** matching the library's doc style.
5. **Use shared components & theme** (`<TaskScreen>`, `<ScreenWrapper>`, `@/theme`). Never reinvent layout.
6. **No inline colors or raw style values.** Every color from `useTheme()` (`colors.*`); spacing,
   radius, borderWidth from `@/theme`. If a token doesn't exist, add it to `@/theme`.
7. **Typecheck & format** — `npm run typecheck` + `npx prettier --write` after every change.

`lefthook.yml` runs `tsc --noEmit` + `prettier` on pre-commit.

---

## 3. Current Gallery Screens (all `ready: true`)

| Screen                | Hook                            | Model                | Notes                                                 |
| --------------------- | ------------------------------- | -------------------- | ----------------------------------------------------- |
| Object Detection      | `useObjectDetector`             | SSDLite MobileNetV3  | `PhotoPicker` + `DetectionOverlay` (boxes)            |
| Image Classification  | `useClassifier`                 | EfficientNetV2-S     | `ClassificationOverlay` (top-k cards)                 |
| Pose Estimation       | `useKeypointDetector`           | YOLO26 Pose          | `KeypointOverlay` (17 keypoints)                      |
| OCR                   | `useOpticalCharacterRecognizer` | PaddleOCR            | `OcrOverlay` (quads, tap-to-copy)                     |
| Semantic Segmentation | `useSemanticSegmenter`          | DeepLabV3 ResNet50   | inline `overlayImage` (single-canvas rule)            |
| Instance Segmentation | `useInstanceSegmenter`          | YOLO26 Nano          | `InstanceSegmentationOverlay` (Alpha_8 masks)         |
| Style Transfer        | `useStyleTransfer`              | Candy                | `StyleTransferOverlay` (hold-for-original)            |
| Privacy Filter        | `usePrivacyFilter`              | OPENAI PII           | `PromptInput` + `PrivacyFilterResults` + `EmptyState` |
| Text to Image         | `useTextToImage`                | SDXS 512 DreamShaper | `PromptInput` + `GeneratedImage` + `EmptyState`       |

**Shared components:** `TaskScreen` (shell + status banner + footer), `ScreenWrapper`,
`PhotoPicker`, `PromptInput`, `RunButton`, `EmptyState`, `GeneratedImage`, `Icon` (Ionicons),
plus per-task overlays.

**`TaskScreen` API (important):**

- Footer: `footer` prop renders a custom composer **or** the default `<RunButton>`.
- `status={{ ...hook, error }}` → model-load/download/error banner.
- `meta="Inference X ms"` → latency chip in the Ready banner.
- `onDeleteModel` → "Delete model" red badge (confirmed via `Alert`).
- Most CV screens call `deleteCachedFiles(hook.resource)` for `onDeleteModel`.

---

## 4. Shared Composer — `PromptInput` (the reusable input)

`src/components/PromptInput.tsx` is the reusable prompt bar used by Privacy Filter, Text to Image
(and planned: Text to Speech, LLM chat).

Props: `value`, `onChangeText`, `onSubmit`, `suggestions?`, `placeholder?`, `disabled?`, `canSubmit?`.

- Renders a fixed-height (`height: 88`, ~4 lines, `textAlignVertical: 'center'`) multiline
  `TextInput` + circular send button (up-arrow icon / `ActivityIndicator` while disabled).
- Suggestion chips render **above** the bar (fixed `width: 160`, ellipsized), tappable → `onChangeText`.
- Solid `colors.surface` bar with `borderWidth` + soft shadow.

### Keyboard handling (VERY important — doc'd from hard-won lessons)

The composer must sit flush above the keyboard on **iOS and edge-to-edge Android** with no content
showing in the gap.

**Current working solution: `KeyboardStickyView` (from `react-native-keyboard-controller`).**

- Wrapped in `_layout.tsx` by `<KeyboardProvider>`.
- `PromptInput` returns `<KeyboardStickyView offset={{ closed: 0, opened: 0 }}>`.
- **Do NOT** also wrap the screen in `KeyboardAvoidingView` — that caused under-shifts, the composer
  sticking at the top, and "stays high when keyboard disabled."

**What was tried and REJECTED** (kept for reference):

- RN `KeyboardAvoidingView` (behavior padding) → under-shifted on Android.
- keyboard-controller `KeyboardAvoidingView` behavior `padding` → composer partially under keyboard;
  `height` → composer stuck high; `translate-with-padding` + `automaticOffset` → composer jumped to
  top. The `automaticOffset`/`KeyboardAvoidingView` path is broken for this nested-header layout.
- `softwareKeyboardLayoutMode` is `"resize"` in `app.json` (keep it; do not switch to `"pan"`).

**Rules learned:**

- `KeyboardStickyView` keeps the composer above the keyboard but does **not** resize content — so the
  content area can show through the gap. The current accepted trade-off leaves the composer opaque and
  content simple enough that this is acceptable. If a content-gap reappears, prefer a **solid composer
  background over any `KeyboardAvoidingView`** re-introduction.
- `expo-blur` / glass backdrops on the composer were removed — do not reintroduce.

---

## 5. The Next Screen: **Text to Speech (TTS)**

### 5.1 Why

The roadmap's audio batch. TTS is the simplest audio task: text → synthesized speech chunks → playback.
Uses the existing `PromptInput` + `EmptyState`, so the screen stays thin.

### 5.2 Library API (Kokoro — the simpler pipeline)

Hook: `useTextToSpeech(config)` (from `react-native-executorch`). Returns:
`{ isReady, error, downloadProgress, resource, synthesize, synthesizeStop }`.

`models.textToSpeech.KOKORO[language].DEFAULT` where `language` ∈
`EN_US | EN_GB | ES | FR | IT | PT | HI | PL | DE` (each nests per-backend; only `XNNPACK_FP32`).

Model config shape: `{ name: 'kokoro', modelPaths: {...}, phonemizer: {...}, voices: Record<K,string>, ... }`.
`Object.keys(model.voices)` gives the available voice names for that language.

`synthesize(text, { voice, speed })` returns an **`AsyncGenerator<KokoroTtsChunk>`** where each chunk:

```ts
{
  audio: Float32Array;
  duration: number;
  chunkIndex: number;
  totalChunks: number;
  sampleRate: number;
}
```

`KOKORO_SAMPLE_RATE` is `24000`. `synthesizeStop()` cancels in-flight synthesis.

### 5.3 Playback dependency — `react-native-audio-api`

**Installed** (`react-native-audio-api@^0.9.0`, via `--legacy-peer-deps` because it peers on
`react-native-worklets@~0.6` while the gallery has `0.10.1`). It is a **native module → needs a
native rebuild** (`npx expo prebuild --clean && pod install`).

Usage (from `apps/speech` examples):

```ts
import { AudioContext, type AudioBufferQueueSourceNode } from 'react-native-audio-api';
const ctx = new AudioContext({ sampleRate: KOKORO_SAMPLE_RATE });
const source = ctx.createBufferQueueSource();
source.connect(ctx.destination);
source.onBufferEnded = (e) => {
  if (e.isLastBufferInQueue) setIsPlaying(false);
};
for await (const chunk of synthesize(text, { voice, speed })) {
  const buf = ctx.createBuffer(1, chunk.audio.length, chunk.sampleRate ?? KOKORO_SAMPLE_RATE);
  buf.copyToChannel(chunk.audio as Float32Array<ArrayBuffer>, 0);
  source.enqueueBuffer(buf);
  if (!started) {
    started = true;
    setIsPlaying(true);
    source.start(0, 0);
  }
}
```

Release pattern: keep `audioCtxRef` + `queueSourceRef`; on stop/unmount, `synthesizeStop()`,
`source.clearBuffers(); source.stop();`, and `ctx.close()`. AudioContext must be created/resumed
inside a user gesture (the Play button handler).

### 5.4 Reference implementations (MUST read before coding)

- `apps/speech/app/kokoro-text-to-speech/index.tsx` — simplest (language + voice + speed + stream/play).
- `apps/speech/app/text-to-speech/index.tsx` — SuperTonic (adds voice/language/steps pickers; heavier; **not** the first target).

### 5.5 Suggested minimal screen

- `useTextToSpeech(models.textToSpeech.KOKORO.EN_US.DEFAULT)` (or a small language row).
- A compact language/voice selector (keep minimal — a horizontal chip row like `SUGGESTIONS`, or a
  simple two-button toggle; resist building the 5-picker form of the reference app).
- `PromptInput` (footer) for the text + `synthesize`.
- A Play/Stop control + chunk progress + total-duration readout (reuse `EmptyState` before first run,
  show "Playing…" while active).
- `onDeleteModel` → `deleteCachedFiles(tts.resource)`.

### 5.6 Menu entry

`src/app/index.tsx`, section `Audio & Speech`. The route `/text-to-speech` currently exists with
`ready: false`. Flip `ready: true` once the screen works; update `model` label (e.g. "Kokoro 82M").

---

## 6. Other Pending Tasks (lower priority)

- **LLM Chat** (`/llm-chat`) — full chat UI with streaming; the heaviest. Use `PromptInput`;
  consider `KeyboardChatScrollView` (see below).
- **Speech to Text** (`/speech-to-text`) — needs mic recording.
- **Voice Activity Detection** (`/voice-activity-detection`).
- **Text Embeddings / Multimodal Search** (mostly deferred; user said "not interesting").

---

## 7. Key Engineering Pitfalls Encountered (do not repeat)

1. **Single Skia Canvas rule** — bitmap overlays (masks, generated images) must render in the **same**
   `<Canvas>` as the base image (via `PhotoPicker.overlayImage` or `GeneratedImage`). A second `<Canvas>`
   in the hierarchy causes Fabric GPU hang / `SIGSEGV`. Decode `SkImage` once in `run()`, never in a
   `useMemo`.
2. **`react-native-keyboard-controller` native module** — must be rebuilt (`prebuild --clean`) or the
   JS import throws → RedBox → secondary `SIGABRT`. When using it, always `KeyboardProvider` at root.
3. **`react-native-audio-api`** — same native-rebuild requirement; install with `--legacy-peer-deps`.
4. **Inline colors** — all via `@/theme` (`colors.*`, `spacing`, `radius`, `borderWidth`, `overlay`,
   `tints`, `modelTag`, `piiColors`). Added `onAccent`, `surface`, etc.
5. **Border widths** — unified to theme `borderWidth` (= 1). Geometric annotation boxes drawn over
   images keep their own visibility widths.
6. **Re-entrancy** — guard `run()` with a `busy` state (per skill) so static tensors aren't corrupted.

---

## 8. Environment / Tooling Notes

- npm registry is **verdaccio at `localhost:4873`** (often down). For any install use:
  `npm install --registry https://registry.npmjs.org <pkg>` (+ `--legacy-peer-deps` if peer conflicts).
- `lefthook` is installed (`pre-commit`: typecheck + prettier).
- Prettier: `printWidth: 100`, single quotes, trailing comma es5.
- App name: "RN ExecuTorch Gallery"; dark-mode enabled (`userInterfaceStyle: automatic`), full
  `light`/`dark` palettes in `@/theme`.
- App icon / splash use the official flame logo assets (white-text vertical logo for splash on the
  dark `#0B0D12` splash).

---

## 9. Immediate Next Step

1. `npx expo prebuild --clean && npx expo run:ios` (and `run:android`) to link `react-native-audio-api`.
2. Implement `src/app/text-to-speech.tsx` using the Kokoro pipeline + `PromptInput` + `react-native-audio-api`.
3. Flip `/text-to-speech` to `ready: true` in `src/app/index.tsx`.
4. `npm run typecheck` + `npx prettier --write`.
