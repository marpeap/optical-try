/*
  Chargement du widget Jeeliz VTO.

  Le widget est distribué en script classique qui expose window.JEELIZVTOWIDGET,
  et il lit sa structure dans le DOM par identifiants fixes (#JeelizVTOWidget,
  #JeelizVTOWidgetCanvas, ...). D'où le chargement par balise script plutôt que
  par import ES : le module doit être présent globalement au moment du start.

  Licence : palier gratuit tant que le catalogue reste sous 10 modèles
  (vendor/jeeliz/LICENSE). Le catalogue en compte 7.
*/

const SCRIPT_SRC = "/vendor/jeeliz/JeelizVTOWidget.js";

export type JeelizErrorLabel =
  | "WEBCAM_UNAVAILABLE"
  | "INVALID_SKU"
  | "PLACEHOLDER_NULL_WIDTH"
  | "PLACEHOLDER_NULL_HEIGHT"
  | "FATAL";

export type JeelizWidget = {
  start: (spec: {
    sku: string;
    isShadow?: boolean;
    searchImageMask?: string;
    searchImageColor?: number;
    callbackReady?: () => void;
    onError?: (label: JeelizErrorLabel) => void;
  }) => void;
  load: (sku: string) => void;
  destroy?: () => void;
};

let loader: Promise<JeelizWidget> | null = null;

export function loadJeelizWidget(): Promise<JeelizWidget> {
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );

    const onReady = () => {
      const widget = (window as unknown as { JEELIZVTOWIDGET?: JeelizWidget })
        .JEELIZVTOWIDGET;
      if (widget) resolve(widget);
      else reject(new Error("JEELIZVTOWIDGET absent après chargement"));
    };

    if (existing) {
      onReady();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = onReady;
    script.onerror = () => {
      loader = null;
      reject(new Error("Échec de chargement du widget Jeeliz"));
    };
    document.body.appendChild(script);
  });

  return loader;
}

/** Message destiné à l'utilisateur pour chaque code d'erreur du widget. */
export function messageForError(label: JeelizErrorLabel | "LOAD_FAILED"): string {
  switch (label) {
    case "WEBCAM_UNAVAILABLE":
      return "Autorisez l'accès à votre caméra pour essayer cette monture.";
    case "INVALID_SKU":
      return "Cette monture n'est pas encore disponible à l'essayage.";
    case "PLACEHOLDER_NULL_WIDTH":
    case "PLACEHOLDER_NULL_HEIGHT":
      return "L'essayage n'a pas pu s'afficher correctement. Réessayez.";
    case "LOAD_FAILED":
    case "FATAL":
    default:
      return "L'essayage virtuel n'a pas pu démarrer. Réessayez plus tard.";
  }
}
