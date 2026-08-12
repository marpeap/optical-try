"""Génère des modèles GLB placeholder pour les montures du catalogue.

Formes géométriques stylisées simples (pas de scan/asset CC0 réel) — à
remplacer par de vrais modèles téléchargés manuellement sur Sketchfab.
Voir docs/superpowers/assets/modeles-3d-sources.md pour la traçabilité.
"""

import trimesh
import numpy as np
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "models", "frames")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Couleurs approximatives par slug (RGBA 0-255), cohérentes avec src/data/frames.ts
COLORS = {
    "orea-noire": (20, 20, 20, 255),
    "orea-ecaille": (120, 80, 40, 255),
    "vireo-titane": (180, 180, 190, 255),
    "vireo-corail": (230, 110, 90, 255),
    "brume-bleu-nuit": (30, 40, 90, 255),
    "brume-verte": (60, 120, 80, 255),
}


def lens_ring(center, radius_outer=0.22, radius_inner=0.17, thickness=0.02):
    """Anneau simple (tore aplati) représentant le cerclage d'un verre."""
    outer = trimesh.creation.cylinder(radius=radius_outer, height=thickness, sections=32)
    inner = trimesh.creation.cylinder(radius=radius_inner, height=thickness * 2, sections=32)
    ring = outer.difference(inner)
    ring.apply_translation(center)
    return ring


def temple(x_start, length=0.5, thickness=0.015):
    """Branche simple (boîte fine) partant du cerclage vers l'arrière."""
    box = trimesh.creation.box(extents=(length, thickness, thickness))
    box.apply_translation((x_start + length / 2, 0, 0))
    return box


def bridge(x_left, x_right, thickness=0.02):
    """Pont reliant les deux cerclages."""
    length = x_right - x_left
    box = trimesh.creation.box(extents=(length, thickness, thickness))
    box.apply_translation(((x_left + x_right) / 2, 0, 0))
    return box


def build_glasses(color):
    left_center = (-0.28, 0, 0)
    right_center = (0.28, 0, 0)

    left_ring = lens_ring(left_center)
    right_ring = lens_ring(right_center)
    bridge_piece = bridge(-0.06, 0.06)
    left_temple = temple(-0.44)
    right_temple = temple(0.44)
    # Miroir de la branche droite pour partir vers l'arrière côté droit
    right_temple.apply_translation((-0.44 - (0.44 + 0.5 / 2) * 2 + (0.44 + 0.5), 0, 0))

    mesh = trimesh.util.concatenate(
        [left_ring, right_ring, bridge_piece, left_temple, right_temple]
    )

    mesh.visual = trimesh.visual.ColorVisuals(
        mesh, vertex_colors=np.tile(color, (len(mesh.vertices), 1))
    )
    return mesh


def main():
    for slug, color in COLORS.items():
        mesh = build_glasses(color)
        output_path = os.path.join(OUTPUT_DIR, f"{slug}.glb")
        mesh.export(output_path)
        size_kb = os.path.getsize(output_path) / 1024
        print(f"OK: {slug}.glb ({size_kb:.1f} Ko)")


if __name__ == "__main__":
    main()
