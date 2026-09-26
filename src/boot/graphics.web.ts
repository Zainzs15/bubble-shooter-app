import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

export function prepareGraphics(): Promise<void> {
  return LoadSkiaWeb({
    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.0/bin/full/${file}`,
  });
}
