const VENDOR_SCRIPTS = [
  "/vendor/webarrocksface/libs/three/v136/build/three.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/loaders/GLTFLoader.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/loaders/RGBELoader.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/postprocessing/EffectComposer.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/postprocessing/ShaderPass.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/postprocessing/RenderPass.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/shaders/CopyShader.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/postprocessing/UnrealBloomPassTweaked.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/shaders/LuminosityHighPassShader.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/postprocessing/SSAARenderPass.js",
  "/vendor/webarrocksface/libs/three/v136/examples/js/postprocessing/TAARenderPass.js",
  "/vendor/webarrocksface/dist/WebARRocksFace.js",
  "/vendor/webarrocksface/helpers/WebARRocksFaceThreeHelper.js",
  "/vendor/webarrocksface/helpers/WebARRocksMirror.js",
  "/vendor/webarrocksface/helpers/landmarksStabilizers/OneEuroLMStabilizer.js",
] as const;

let loaded: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Échec de chargement du script vendor: ${src}`));
    document.body.appendChild(script);
  });
}

export function loadVendorScripts(): Promise<void> {
  if (!loaded) {
    loaded = VENDOR_SCRIPTS.reduce(
      (chain, src) => chain.then(() => loadScript(src)),
      Promise.resolve()
    );
  }
  return loaded;
}
