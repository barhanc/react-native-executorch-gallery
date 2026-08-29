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

## Showcase

<div align="center">

|                                  LLM Chat (LFM 2.5)                                  |                                     Text to Image (SDXS)                                     |                            Text to Speech (Kokoro)                             |                            OCR Text Recognition                            |
| :----------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------: | :------------------------------------------------------------------------: |
|          <img src="assets/demos/llm-chat.gif" width="180" alt="LLM Chat" />          |         <img src="assets/demos/text-to-image.gif" width="180" alt="Text to Image" />         | <img src="assets/demos/text-to-speech.gif" width="180" alt="Text to Speech" /> |    <img src="assets/demos/ocr.gif" width="180" alt="OCR Recognition" />    |
|                             **Multimodal Search (CLIP)**                             |                                  **Instance Segmentation**                                   |                            **Privacy Filter (PII)**                            |                            **Gallery Overview**                            |
| <img src="assets/demos/multimodal-search.gif" width="180" alt="Multimodal Search" /> | <img src="assets/demos/instance-segmentation.gif" width="180" alt="Instance Segmentation" /> | <img src="assets/demos/privacy-filter.gif" width="180" alt="Privacy Filter" /> | <img src="assets/demos/gallery-menu.gif" width="180" alt="Gallery Menu" /> |

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

## Documentation

The full library documentation lives in
[`react-native-executorch`](https://github.com/software-mansion/react-native-executorch).
Each task screen in this repository maps directly to a page in the docs.

## Created by Software Mansion

This project is developed by [Software Mansion](https://swmansion.com/).
