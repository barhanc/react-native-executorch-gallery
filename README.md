<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/software-mansion/react-native-executorch/raw/main/docs/static/img/logo-vertical-dark.svg">
    <img src="https://github.com/software-mansion/react-native-executorch/raw/main/docs/static/img/logo-vertical.svg" alt="React Native ExecuTorch" width="260">
  </picture>
</div>

# React Native ExecuTorch Gallery

**React Native ExecuTorch Gallery** is a showcase app demonstrating on-device
machine learning tasks built with
[`react-native-executorch`](https://github.com/software-mansion/react-native-executorch).
Each screen is a real, standalone example of idiomatic library usage, so it can
be lifted straight into your own app.

<div align="center">

|                              LLM Chat (LFM 2.5)                               |                                 Text to Image (SDXS)                                  |                         Text to Speech (Kokoro)                         |                        OCR Text Recognition                         |
| :---------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------: | :---------------------------------------------------------------------: | :-----------------------------------------------------------------: |
|          <img src="media/llm-chat.gif" width="180" alt="LLM Chat" />          |         <img src="media/text-to-image.gif" width="180" alt="Text to Image" />         | <img src="media/text-to-speech.gif" width="180" alt="Text to Speech" /> |    <img src="media/ocr.gif" width="180" alt="OCR Recognition" />    |
|                         **Multimodal Search (CLIP)**                          |                               **Instance Segmentation**                               |                        **Privacy Filter (PII)**                         |                        **Gallery Overview**                         |
| <img src="media/multimodal-search.gif" width="180" alt="Multimodal Search" /> | <img src="media/instance-segmentation.gif" width="180" alt="Instance Segmentation" /> | <img src="media/privacy-filter.gif" width="180" alt="Privacy Filter" /> | <img src="media/gallery-menu.gif" width="180" alt="Gallery Menu" /> |

</div>

## Getting Started

```bash
npm install
npm run ios       # or npm run android
```

> The app requires a development build (Expo Go is not supported). Models are
> downloaded on first use and then run fully offline.

## Requirements

- React Native with the **New Architecture**
- Expo SDK 57+ or React Native 0.74+

## Development & Local Linking

This showcase app is developed against the `rne-rewrite` branch of [`react-native-executorch`](https://github.com/software-mansion/react-native-executorch).

Because the gallery consumes `react-native-executorch` as a standard npm dependency with native modules rather than an npm workspace symlink, local development uses a local [Verdaccio](https://verdaccio.org/) registry (`http://localhost:4873`):

1. **Start Verdaccio and publish the library** (from the `react-native-executorch` repository on the `rne-rewrite` branch):

   ```bash
   git checkout rne-rewrite
   # publish to local verdaccio
   npm run local-publish # or verdaccio publish workflow
   ```

2. **Install in the gallery**:

   ```bash
   # configure npm to fetch react-native-executorch from local verdaccio
   npm install react-native-executorch@0.0.0 --registry http://localhost:4873
   ```

3. **Rebuild Native Code**:
   ```bash
   npx pod-install   # or npm run ios / npm run android
   ```

## Documentation

The full library documentation lives in
[`react-native-executorch`](https://github.com/software-mansion/react-native-executorch).
Each task screen in this repository maps directly to a page in the docs.

## Created by Software Mansion

This project is developed by [Software Mansion](https://swmansion.com/).
