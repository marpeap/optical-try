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

/*
  Libellés relevés dans le build du widget (vendor/jeeliz). La liste dépasse
  celle de leur documentation : les cas caméra en particulier se déclinent en
  plusieurs codes qu'il faut distinguer, sans quoi une machine sans webcam
  reçoit le même message qu'une panne du service.
*/
export type JeelizErrorLabel =
  | "WEBCAM_UNAVAILABLE"
  | "NO_VALID_MEDIASTREAM_FALLBACK_CONSTRAINTS"
  | "MEDIASTREAMAPI_NOT_FOUND"
  | "NO_DEVICES_FOUND"
  | "NODEVICESFOUND"
  | "VIDEO_NOT_PROVIDED"
  | "VIDEO_NOTSTARTED"
  | "VIDEO_NULLSIZE"
  | "VIDEO_PLAYPROMISEREJECTED"
  | "GL_INCOMPATIBLE"
  | "INVALID_SKU"
  | "SKU_NOT_FOUND"
  | "CANNOT_LOAD_MODEL"
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
  destroy: () => Promise<void>;
};

/*
  Le widget est un singleton attaché au DOM par identifiants fixes : deux
  démarrages simultanés se marcheraient dessus. Les opérations start et
  destroy passent donc par cette file, ce qui garantit qu'un démarrage
  n'intervient jamais avant la fin de la destruction précédente.

  Nécessaire dès le développement : StrictMode monte les effets deux fois,
  produisant une séquence start / destroy / start en quelques millisecondes.
*/
let file: Promise<unknown> = Promise.resolve();

export function enfilerOperation<T>(operation: () => Promise<T>): Promise<T> {
  const suite = file.then(operation, operation);
  file = suite.catch(() => undefined);
  return suite;
}

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

export type MessageErreur = { texte: string; reessayable: boolean };

/** Message destiné à l'utilisateur pour chaque code d'erreur du widget. */
export function messageForError(
  label: JeelizErrorLabel | "LOAD_FAILED"
): MessageErreur {
  switch (label) {
    case "WEBCAM_UNAVAILABLE":
      return {
        texte: "Autorisez l'accès à votre caméra pour essayer cette monture.",
        reessayable: true,
      };

    /* Aucune caméra exploitable : matériel absent, désactivé au niveau
       système, ou déjà utilisé par une autre application. Réessayer sans
       rien changer ne sert à rien, d'où le conseil explicite. */
    case "NO_VALID_MEDIASTREAM_FALLBACK_CONSTRAINTS":
    case "NO_DEVICES_FOUND":
    case "NODEVICESFOUND":
    case "MEDIASTREAMAPI_NOT_FOUND":
      return {
        texte:
          "Aucune caméra détectée. Vérifiez qu'elle n'est pas désactivée ou utilisée par une autre application.",
        reessayable: true,
      };

    case "VIDEO_NOT_PROVIDED":
    case "VIDEO_NOTSTARTED":
    case "VIDEO_NULLSIZE":
    case "VIDEO_PLAYPROMISEREJECTED":
      return {
        texte: "Le flux vidéo n'a pas démarré. Réessayez.",
        reessayable: true,
      };

    case "GL_INCOMPATIBLE":
      return {
        texte:
          "Votre navigateur ne prend pas en charge l'affichage 3D nécessaire à l'essayage.",
        reessayable: false,
      };

    case "INVALID_SKU":
    case "SKU_NOT_FOUND":
    case "CANNOT_LOAD_MODEL":
      return {
        texte: "Cette monture n'est pas encore disponible à l'essayage.",
        reessayable: false,
      };

    case "PLACEHOLDER_NULL_WIDTH":
    case "PLACEHOLDER_NULL_HEIGHT":
      return {
        texte: "L'essayage n'a pas pu s'afficher correctement. Réessayez.",
        reessayable: true,
      };

    case "LOAD_FAILED":
    case "FATAL":
    default:
      return {
        texte: "L'essayage virtuel n'a pas pu démarrer. Réessayez plus tard.",
        reessayable: true,
      };
  }
}
