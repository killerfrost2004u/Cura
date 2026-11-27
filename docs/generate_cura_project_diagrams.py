"""Generate the CURA Whole-Project Client Flowchart and System/Clean/Hardware Architecture Diagrams.

Reuses the 2x supersampled vector-style gradient/shadow/orthogonal-routing engine from
``generate_cura_ai_flowchart.py`` to produce three high-resolution PNG diagrams:
  1. ``CURA_Whole_Project_Client_Flowchart.png`` (1600x2000)
  2. ``CURA_System_Architecture_Diagram.png`` (2200x1500)
  3. ``CURA_Clean_Hardware_Architecture.png`` (2200x1350)
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from generate_cura_ai_flowchart import (
    ARROW_COLOR,
    BG_COLOR,
    DOCS_DIR,
    PALETTE,
    RGB,
    RGBA,
    SCALE,
    BoxStyle,
    FontManager,
    Point,
    TextLine,
    draw_gradient_diamond,
    draw_gradient_rounded_rect,
    draw_grid_background,
    draw_multiline_centered_text,
    draw_orthogonal_arrow,
    remove_exterior_white_background,
)

ECOSYSTEM_ICON_PATH = DOCS_DIR / "assets" / "cura_ecosystem_icon.png"
OUT_CLIENT_FLOWCHART = DOCS_DIR / "CURA_Whole_Project_Client_Flowchart.png"
OUT_SYSTEM_ARCH = DOCS_DIR / "CURA_System_Architecture_Diagram.png"
OUT_CLEAN_HW_ARCH = DOCS_DIR / "CURA_Clean_Hardware_Architecture.png"


@dataclass(frozen=True)
class MemorySegment:
    """Represents one slice of the Raspberry Pi 4GB RAM budget bar."""

    label: str
    gb_label: str
    fraction: float
    fill_rgb: RGB
    border_rgb: RGB
    text_rgb: RGB


def draw_swimlane_panel(
    canvas: Image.Image,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    radius: float,
    fill_rgba: RGBA,
    border_rgb: RGB,
    pill_bounds: tuple[float, float, float, float],
    pill_text: str,
    pill_style: BoxStyle,
    fonts: FontManager,
    pill_font_size: int = 14,
) -> None:
    """Draw a tinted container swimlane with a top-left header badge."""
    sx1, sy1 = int(round(x1 * SCALE)), int(round(y1 * SCALE))
    sx2, sy2 = int(round(x2 * SCALE)), int(round(y2 * SCALE))
    w, h = sx2 - sx1, sy2 - sy1
    r_px = min(int(round(radius * SCALE)), w // 2, h // 2)

    panel_2x = Image.new("RGBA", (w * 2, h * 2), (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel_2x)
    bw = int(round(2.0 * SCALE))
    pd.rounded_rectangle(
        (bw, bw, w * 2 - 1 - bw, h * 2 - 1 - bw),
        radius=r_px * 2,
        fill=fill_rgba,
        outline=border_rgb + (255,),
        width=bw * 2,
    )
    canvas.alpha_composite(
        panel_2x.resize((w, h), Image.Resampling.LANCZOS), dest=(sx1, sy1)
    )

    px1, py1, px2, py2 = pill_bounds
    draw_gradient_rounded_rect(
        canvas,
        px1,
        py1,
        px2,
        py2,
        radius=(py2 - py1) / 2.0,
        style=pill_style,
        lines=[TextLine(pill_text, pill_font_size, bold=True)],
        fonts=fonts,
        padding_x=12.0,
    )


def draw_bidirectional_arrow(
    canvas: Image.Image,
    points: Sequence[Point],
    color: RGBA = ARROW_COLOR,
    width: float = 2.4,
    head_len: float = 11.0,
    head_half_w: float = 5.5,
) -> None:
    """Draw an orthogonal connector with crisp arrowheads at both ends."""
    if len(points) < 2:
        return
    draw_orthogonal_arrow(
        canvas,
        points,
        color=color,
        width=width,
        arrow_end=True,
        head_len=head_len,
        head_half_w=head_half_w,
    )
    # Add arrowhead pointing into points[0] using the first two vertices
    draw = ImageDraw.Draw(canvas)
    p0 = np.array([points[0][0] * SCALE, points[0][1] * SCALE], dtype=np.float64)
    p1 = np.array([points[1][0] * SCALE, points[1][1] * SCALE], dtype=np.float64)
    vec = p0 - p1
    norm = float(np.linalg.norm(vec))
    if norm > 1e-3:
        u = vec / norm
        hl = head_len * SCALE
        hw = head_half_w * SCALE
        perp = np.array([-u[1], u[0]])
        left_pt = p0 - u * hl + perp * hw
        right_pt = p0 - u * hl - perp * hw
        draw.polygon(
            [
                (float(p0[0]), float(p0[1])),
                (float(left_pt[0]), float(left_pt[1])),
                (float(right_pt[0]), float(right_pt[1])),
            ],
            fill=color,
        )


def draw_arrow_label(
    canvas: Image.Image,
    center: Point,
    text: str,
    fonts: FontManager,
    bg_rgba: RGBA = (255, 255, 255, 240),
    border_rgb: RGB = (148, 163, 184),
    text_rgb: RGB = (30, 41, 59),
    size: int = 12,
) -> None:
    """Render a compact pill tag centered over an arrow without obscuring endpoints."""
    draw = ImageDraw.Draw(canvas)
    font = fonts.get(size, bold=True)
    bb = draw.textbbox((0, 0), text, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    pad_x, pad_y = 8 * SCALE, 4 * SCALE
    cx, cy = center[0] * SCALE, center[1] * SCALE
    x1, y1 = int(round(cx - tw / 2 - pad_x)), int(round(cy - th / 2 - pad_y))
    x2, y2 = int(round(cx + tw / 2 + pad_x)), int(round(cy + th / 2 + pad_y))

    draw.rounded_rectangle(
        (x1, y1, x2, y2),
        radius=(y2 - y1) // 2,
        fill=bg_rgba,
        outline=border_rgb + (255,),
        width=max(1, int(round(1.2 * SCALE))),
    )
    tx = cx - tw / 2 - bb[0]
    ty = cy - th / 2 - bb[1]
    draw.text((tx, ty), text, font=font, fill=text_rgb + (255,))


def draw_fallback_ecosystem_icon(target_w: int, target_h: int) -> Image.Image:
    """Clean vector fallback showing Hub + Phone + Laptop if external PNG is absent."""
    img = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = target_w // 2, int(target_h * 0.64)

    # Laptop right-back
    d.rounded_rectangle(
        (int(cx + 20), int(cy - 110), int(cx + 235), int(cy + 35)),
        radius=16,
        fill=(51, 65, 85, 255),
        outline=(30, 41, 59, 255),
        width=4,
    )
    d.rounded_rectangle(
        (int(cx - 5), int(cy + 35), int(cx + 255), int(cy + 55)),
        radius=8,
        fill=(226, 232, 240, 255),
        outline=(51, 65, 85, 255),
        width=3,
    )
    # Hub left-front
    d.rounded_rectangle(
        (int(cx - 245), int(cy - 55), int(cx - 60), int(cy + 55)),
        radius=28,
        fill=(248, 250, 252, 255),
        outline=(51, 65, 85, 255),
        width=4,
    )
    d.rounded_rectangle(
        (int(cx - 222), int(cy - 35), int(cx - 83), int(cy + 35)),
        radius=16,
        fill=(30, 41, 59, 255),
        outline=(78, 161, 158, 255),
        width=3,
    )
    # Phone center
    d.rounded_rectangle(
        (int(cx - 48), int(cy - 95), int(cx + 42), int(cy + 65)),
        radius=18,
        fill=(78, 161, 158, 255),
        outline=(30, 41, 59, 255),
        width=4,
    )
    return img


def composite_icon_asset(
    canvas: Image.Image,
    box: tuple[float, float, float, float],
    asset_path: Path,
) -> None:
    """Key exterior white from PNG icon and alpha-composite smoothly into ``box``."""
    x1, y1, x2, y2 = box
    max_w = int(round((x2 - x1) * SCALE))
    max_h = int(round((y2 - y1) * SCALE))

    if asset_path.exists():
        with Image.open(asset_path) as raw:
            cleaned = remove_exterior_white_background(raw)
        scale_ratio = min(max_w / cleaned.width, max_h / cleaned.height)
        new_size = (
            max(1, int(round(cleaned.width * scale_ratio))),
            max(1, int(round(cleaned.height * scale_ratio))),
        )
        resized = cleaned.resize(new_size, Image.Resampling.LANCZOS)
    else:
        resized = draw_fallback_ecosystem_icon(max_w, max_h)

    dest_x = int(round(x1 * SCALE + (max_w - resized.width) / 2.0))
    dest_y = int(round(y1 * SCALE + (max_h - resized.height) / 2.0))
    canvas.alpha_composite(resized, dest=(dest_x, dest_y))


def draw_memory_bar(
    canvas: Image.Image,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    segments: Sequence[MemorySegment],
    fonts: FontManager,
) -> None:
    """Draw a proportional horizontal stacked RAM allocation bar with clean labels."""
    sx1, sy1 = int(round(x1 * SCALE)), int(round(y1 * SCALE))
    sx2, sy2 = int(round(x2 * SCALE)), int(round(y2 * SCALE))
    total_w = sx2 - sx1
    h = sy2 - sy1
    r_px = 12 * SCALE

    # Build internal bar layer with crisp vertical dividers, then clip to rounded mask
    bar_img = Image.new("RGBA", (total_w, h), (255, 255, 255, 255))
    bd = ImageDraw.Draw(bar_img)

    cursor = 0
    slice_bounds: list[tuple[int, int, MemorySegment]] = []
    for idx, seg in enumerate(segments):
        seg_w = (
            total_w - cursor
            if idx == len(segments) - 1
            else int(round(total_w * seg.fraction))
        )
        bd.rectangle((cursor, 0, cursor + seg_w, h), fill=seg.fill_rgb + (255,))
        if idx > 0:
            bd.line([(cursor, 0), (cursor, h)], fill=(71, 85, 105, 255), width=2 * SCALE)
        slice_bounds.append((cursor, cursor + seg_w, seg))
        cursor += seg_w

    mask_2x = Image.new("L", (total_w * 2, h * 2), 0)
    ImageDraw.Draw(mask_2x).rounded_rectangle(
        (0, 0, total_w * 2 - 1, h * 2 - 1), radius=r_px * 2, fill=255
    )
    mask = mask_2x.resize((total_w, h), Image.Resampling.LANCZOS)

    # Drop shadow
    pad = 12 * SCALE
    sh = Image.new("RGBA", (total_w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    sh.paste(Image.new("RGBA", (total_w, h), (15, 23, 42, 48)), (pad, pad), mask)
    sh = sh.filter(ImageFilter.GaussianBlur(radius=3.5 * SCALE))
    canvas.alpha_composite(sh, dest=(sx1 - pad + 2 * SCALE, sy1 - pad + 4 * SCALE))

    bar_img.putalpha(mask)
    canvas.alpha_composite(bar_img, dest=(sx1, sy1))

    # Crisp outer border
    bw = 2 * SCALE
    border_2x = Image.new("RGBA", (total_w * 2, h * 2), (0, 0, 0, 0))
    ImageDraw.Draw(border_2x).rounded_rectangle(
        (bw, bw, total_w * 2 - 1 - bw, h * 2 - 1 - bw),
        radius=max(2, r_px * 2 - bw),
        outline=(71, 85, 105, 255),
        width=bw * 2,
    )
    canvas.alpha_composite(
        border_2x.resize((total_w, h), Image.Resampling.LANCZOS), dest=(sx1, sy1)
    )

    # Labels inside wide segments and staggered callouts above narrow segments
    draw = ImageDraw.Draw(canvas)
    above_toggle = 0
    for seg_l, seg_r, seg in slice_bounds:
        seg_cx = (sx1 + (seg_l + seg_r) / 2.0) / SCALE
        seg_w_logical = (seg_r - seg_l) / SCALE
        if seg_w_logical >= 115:
            draw_multiline_centered_text(
                canvas,
                center=(seg_cx, (y1 + y2) / 2.0),
                max_width=seg_w_logical - 12,
                lines=[
                    TextLine(seg.label, 14, bold=True, color=seg.text_rgb),
                    TextLine(seg.gb_label, 12, bold=False, color=seg.text_rgb),
                ],
                style=PALETTE["cream"],
                fonts=fonts,
                line_gap=3.0,
            )
        else:
            # Spread adjacent narrow callouts left/right via clean L-shaped leaders
            is_right = (above_toggle % 2) == 1
            above_toggle += 1
            label_y = y1 - 36
            elbow_y = y1 - 15
            target_cx = seg_cx + (82 if is_right else -68)
            draw.line(
                [
                    (seg_cx * SCALE, y1 * SCALE),
                    (seg_cx * SCALE, elbow_y * SCALE),
                    (target_cx * SCALE, elbow_y * SCALE),
                    (target_cx * SCALE, (label_y + 10) * SCALE),
                ],
                fill=(71, 85, 105, 255),
                width=2 * SCALE,
            )
            draw_arrow_label(
                canvas,
                center=(target_cx, label_y),
                text=f"{seg.label}: {seg.gb_label}",
                fonts=fonts,
                bg_rgba=seg.fill_rgb + (255,),
                border_rgb=seg.border_rgb,
                text_rgb=seg.text_rgb,
                size=11,
            )


# ==============================================================================
# Diagram A: Whole-Project Client Flowchart (1600x2000)
# ==============================================================================
def render_whole_project_client_flowchart() -> Image.Image:
    """Render the client-facing CURA Complete Project Flowchart matching IMG-20261127-WA0029 style."""
    base_w, base_h = 1600, 2000
    canvas = Image.new("RGBA", (base_w * SCALE, base_h * SCALE), BG_COLOR)
    draw_grid_background(canvas)
    fonts = FontManager(SCALE)

    # --- Arrows ---
    draw_orthogonal_arrow(canvas, [(800, 215), (800, 250)])
    draw_orthogonal_arrow(canvas, [(800, 394), (800, 474)])
    draw_orthogonal_arrow(canvas, [(800, 434), (250, 434), (250, 474)])
    draw_orthogonal_arrow(canvas, [(800, 434), (1295, 434), (1295, 474)])

    # Left column arrows
    draw_orthogonal_arrow(canvas, [(230, 558), (230, 605)])
    draw_orthogonal_arrow(
        canvas, [(365, 637), (420, 637), (420, 922)], arrow_end=False
    )
    draw_orthogonal_arrow(canvas, [(420, 732), (365, 732)])
    draw_orthogonal_arrow(canvas, [(420, 827), (365, 827)])
    draw_orthogonal_arrow(canvas, [(420, 922), (365, 922)])

    # Center column arrows
    draw_orthogonal_arrow(canvas, [(800, 558), (800, 605)])
    draw_orthogonal_arrow(canvas, [(800, 680), (800, 705)])
    draw_orthogonal_arrow(canvas, [(800, 780), (800, 805)])
    draw_orthogonal_arrow(canvas, [(800, 880), (800, 905)])
    draw_orthogonal_arrow(canvas, [(800, 980), (800, 1038)])
    draw_orthogonal_arrow(
        canvas, [(615, 642), (565, 642), (565, 942)], arrow_end=False
    )
    draw_orthogonal_arrow(canvas, [(565, 742), (615, 742)])
    draw_orthogonal_arrow(canvas, [(565, 842), (615, 842)])
    draw_orthogonal_arrow(canvas, [(565, 942), (615, 942)])

    # Right column arrows
    draw_orthogonal_arrow(canvas, [(1162, 558), (1162, 605)])
    draw_orthogonal_arrow(canvas, [(1412, 558), (1412, 605)])
    draw_orthogonal_arrow(canvas, [(1288, 558), (1288, 710)])

    draw_orthogonal_arrow(canvas, [(1145, 795), (1145, 840)])
    draw_orthogonal_arrow(canvas, [(1145, 910), (1145, 1110), (945, 1110)])

    draw_orthogonal_arrow(canvas, [(1395, 795), (1395, 840)])
    draw_orthogonal_arrow(canvas, [(1395, 905), (1395, 930)])
    draw_orthogonal_arrow(canvas, [(1395, 995), (1395, 1020)])

    # Bottom-left YES -> Emergency SOS -> End
    draw_orthogonal_arrow(canvas, [(655, 1110), (440, 1110), (440, 1170)])
    draw_orthogonal_arrow(canvas, [(440, 1212), (440, 1272)])
    draw_orthogonal_arrow(canvas, [(440, 1342), (440, 1388)])
    draw_orthogonal_arrow(canvas, [(440, 1463), (440, 1493)])
    draw_orthogonal_arrow(canvas, [(440, 1568), (440, 1842)])
    draw_orthogonal_arrow(canvas, [(440, 1785), (635, 1785)])
    draw_orthogonal_arrow(
        canvas, [(590, 1425), (635, 1425), (635, 1710), (440, 1710)]
    )

    # Bottom-center spine & Bottom-right Daily Care Experience
    draw_orthogonal_arrow(canvas, [(800, 1182), (800, 1755)])
    draw_orthogonal_arrow(canvas, [(800, 1212), (940, 1212)])
    draw_orthogonal_arrow(canvas, [(1115, 1246), (1115, 1295)])
    draw_orthogonal_arrow(canvas, [(1115, 1363), (1115, 1405)])
    draw_orthogonal_arrow(canvas, [(1115, 1475), (1115, 1500)])
    draw_orthogonal_arrow(canvas, [(1115, 1570), (1115, 1595)])

    draw_orthogonal_arrow(
        canvas, [(800, 1630), (930, 1630), (930, 1440)], arrow_end=False
    )
    draw_orthogonal_arrow(canvas, [(930, 1440), (965, 1440)])
    draw_orthogonal_arrow(canvas, [(930, 1535), (965, 1535)])
    draw_orthogonal_arrow(canvas, [(930, 1630), (965, 1630)])

    # --- Nodes ---
    draw_gradient_rounded_rect(
        canvas,
        160,
        45,
        1440,
        130,
        radius=16,
        style=PALETTE["title"],
        lines=[TextLine("CURA — Complete Project Flowchart", 34, bold=True)],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        695,
        160,
        905,
        215,
        radius=27,
        style=PALETTE["coral"],
        lines=[TextLine("Start", 21, bold=True)],
        fonts=fonts,
    )
    draw_gradient_diamond(
        canvas,
        cx=800,
        cy=322,
        rx=150,
        ry=72,
        style=PALETTE["diamond"],
        lines=[
            TextLine("User Connects", 20, bold=True),
            TextLine("(Voice, App or Hub)", 15, bold=False),
        ],
        fonts=fonts,
    )

    # Left Column — Client Apps & Mini CURA Hub
    draw_gradient_rounded_rect(
        canvas,
        95,
        474,
        405,
        558,
        radius=12,
        style=PALETTE["header_teal"],
        lines=[
            TextLine("Client Apps &", 20, bold=True),
            TextLine("Mini CURA Hub", 20, bold=True),
        ],
        fonts=fonts,
    )
    left_boxes = [
        (
            605,
            670,
            [
                TextLine("Web Portal", 18, bold=True),
                TextLine("(Browser Dashboard)", 14, bold=False),
            ],
        ),
        (
            695,
            770,
            [
                TextLine("Mobile App (Flutter)", 18, bold=True),
                TextLine("(Patient & Caregiver)", 14, bold=False),
            ],
        ),
        (
            795,
            860,
            [
                TextLine("Desktop Assistant", 18, bold=True),
                TextLine("(Workstation & Focus)", 14, bold=False),
            ],
        ),
        (
            885,
            960,
            [
                TextLine("Mini CURA Hub", 18, bold=True),
                TextLine("(Pi 4 Speaker, LCD, SOS)", 14, bold=False),
            ],
        ),
    ]
    for y1, y2, lines in left_boxes:
        draw_gradient_rounded_rect(
            canvas, 95, y1, 365, y2, radius=9, style=PALETTE["cream"], lines=lines, fonts=fonts
        )

    # Center Column — CURA Adaptive AI & Care Modes
    draw_gradient_rounded_rect(
        canvas,
        590,
        474,
        1010,
        558,
        radius=12,
        style=PALETTE["header_teal"],
        lines=[
            TextLine("CURA Adaptive AI", 20, bold=True),
            TextLine("& Care Modes", 20, bold=True),
        ],
        fonts=fonts,
    )
    center_boxes = [
        (
            605,
            680,
            PALETTE["gold_highlight"],
            [
                TextLine("Adaptive Mode Engine", 18, bold=True),
                TextLine("(Personalized Care Profile)", 14, bold=False),
            ],
        ),
        (
            705,
            780,
            PALETTE["cream"],
            [
                TextLine("Alzheimer's Care Mode", 18, bold=True),
                TextLine("(Pills, Memory Book & Calm UI)", 14, bold=False),
            ],
        ),
        (
            805,
            880,
            PALETTE["cream"],
            [
                TextLine("ADHD Focus Coach", 18, bold=True),
                TextLine("(2-Min Steps & Sprint Timer)", 14, bold=False),
            ],
        ),
        (
            905,
            980,
            PALETTE["cream"],
            [
                TextLine("Everyday Smart Assistant", 18, bold=True),
                TextLine("(Live Web Search & Voice)", 14, bold=False),
            ],
        ),
    ]
    for y1, y2, style, lines in center_boxes:
        draw_gradient_rounded_rect(
            canvas, 615, y1, 985, y2, radius=9, style=style, lines=lines, fonts=fonts
        )

    # Right Column — Cloud, Edge & Data Platform
    draw_gradient_rounded_rect(
        canvas,
        1135,
        474,
        1455,
        558,
        radius=12,
        style=PALETTE["header_teal"],
        lines=[
            TextLine("Cloud, Edge &", 20, bold=True),
            TextLine("Data Platform", 20, bold=True),
        ],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        1045,
        605,
        1270,
        675,
        radius=9,
        style=PALETTE["cream"],
        lines=[
            TextLine("Cloud AI Engine", 17, bold=True),
            TextLine("(Fast Online Replies)", 13, bold=False),
        ],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        1305,
        605,
        1530,
        675,
        radius=9,
        style=PALETTE["cream"],
        lines=[
            TextLine("Offline Edge AI", 17, bold=True),
            TextLine("(Private Pi 4 Mode)", 13, bold=False),
        ],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        1115,
        710,
        1460,
        795,
        radius=12,
        style=PALETTE["header_teal"],
        lines=[
            TextLine("Caregiver & Data Hub", 20, bold=True),
            TextLine("(Neon Cloud + S3)", 17, bold=True),
        ],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        1050,
        840,
        1235,
        910,
        radius=9,
        style=PALETTE["cream"],
        lines=[
            TextLine("Real-Time", 17, bold=True),
            TextLine("Care Sync", 17, bold=True),
        ],
        fonts=fonts,
    )
    right_boxes = [
        (
            840,
            905,
            [
                TextLine("Medication Tracking", 17, bold=True),
                TextLine("(Visual Pill Confirmation)", 13, bold=False),
            ],
        ),
        (
            930,
            995,
            [
                TextLine("Memory Book & Media", 17, bold=True),
                TextLine("(Family Photos & Audio)", 13, bold=False),
            ],
        ),
        (
            1020,
            1085,
            [
                TextLine("Caregiver Reports", 17, bold=True),
                TextLine("(Daily Health Insights)", 13, bold=False),
            ],
        ),
    ]
    for y1, y2, lines in right_boxes:
        draw_gradient_rounded_rect(
            canvas,
            1260,
            y1,
            1530,
            y2,
            radius=9,
            style=PALETTE["cream"],
            lines=lines,
            fonts=fonts,
        )

    # Lower Decision Diamond
    draw_gradient_diamond(
        canvas,
        cx=800,
        cy=1110,
        rx=145,
        ry=72,
        style=PALETTE["diamond"],
        lines=[
            TextLine("Emergency SOS", 19, bold=True),
            TextLine("Triggered?", 19, bold=True),
        ],
        fonts=fonts,
    )

    # Bottom-Left Branch
    draw_gradient_rounded_rect(
        canvas,
        395,
        1170,
        485,
        1212,
        radius=8,
        style=PALETTE["yes_badge"],
        lines=[TextLine("YES", 17, bold=True)],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        275,
        1272,
        605,
        1342,
        radius=12,
        style=PALETTE["header_teal"],
        lines=[TextLine("Emergency SOS System", 20, bold=True)],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        290,
        1388,
        590,
        1463,
        radius=9,
        style=PALETTE["cream"],
        lines=[
            TextLine("Instant GPS & SOS", 18, bold=True),
            TextLine("(Button / 1-Tap Alert)", 14, bold=False),
        ],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        290,
        1493,
        590,
        1568,
        radius=9,
        style=PALETTE["cream"],
        lines=[
            TextLine("Notify Family & Doctor", 18, bold=True),
            TextLine("(Priority Escalation)", 14, bold=False),
        ],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        340,
        1842,
        540,
        1902,
        radius=30,
        style=PALETTE["coral"],
        lines=[TextLine("End", 21, bold=True)],
        fonts=fonts,
    )

    # Bottom-Right Branch
    draw_gradient_rounded_rect(
        canvas,
        940,
        1178,
        1290,
        1246,
        radius=12,
        style=PALETTE["action_teal"],
        lines=[TextLine("Deliver Personalized Care", 19, bold=True)],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        925,
        1295,
        1305,
        1363,
        radius=12,
        style=PALETTE["gold_highlight"],
        lines=[TextLine("Multi-Channel Experience", 20, bold=True)],
        fonts=fonts,
    )
    bottom_right_boxes = [
        (
            1405,
            1475,
            [
                TextLine("Natural Voice Reply", 18, bold=True),
                TextLine("(Warm Egyptian AR / EN)", 14, bold=False),
            ],
        ),
        (
            1500,
            1570,
            [
                TextLine("Adaptive Interface", 18, bold=True),
                TextLine("(High-Contrast / Focus UI)", 14, bold=False),
            ],
        ),
        (
            1595,
            1665,
            [
                TextLine("Live Family Sync", 18, bold=True),
                TextLine("(Adherence & Activity Logs)", 14, bold=False),
            ],
        ),
    ]
    for y1, y2, lines in bottom_right_boxes:
        draw_gradient_rounded_rect(
            canvas,
            965,
            y1,
            1265,
            y2,
            radius=9,
            style=PALETTE["cream"],
            lines=lines,
            fonts=fonts,
        )

    # Bottom-Center Pill & Bottom-Right Connected Ecosystem Icon
    draw_gradient_rounded_rect(
        canvas,
        635,
        1755,
        965,
        1815,
        radius=30,
        style=PALETTE["action_teal"],
        lines=[TextLine("Continuous Daily Care", 20, bold=True)],
        fonts=fonts,
    )
    composite_icon_asset(canvas, (1045, 1690, 1500, 1960), ECOSYSTEM_ICON_PATH)

    return canvas.resize((base_w, base_h), Image.Resampling.LANCZOS)


# ==============================================================================
# Diagram B: CURA Hybrid Cloud & Edge System Architecture (2200x1500)
# ==============================================================================
def render_system_architecture_diagram() -> Image.Image:
    """Render the 4-tier CURA Hybrid Cloud & Edge System Architecture diagram."""
    base_w, base_h = 2200, 1500
    canvas = Image.new("RGBA", (base_w * SCALE, base_h * SCALE), BG_COLOR)
    draw_grid_background(canvas)
    fonts = FontManager(SCALE)

    # Title Banner
    draw_gradient_rounded_rect(
        canvas,
        140,
        35,
        2060,
        112,
        radius=16,
        style=PALETTE["title"],
        lines=[TextLine("CURA — Hybrid Cloud & Edge System Architecture", 34, bold=True)],
        fonts=fonts,
    )

    # Swimlane Panels (drawn first so cross-tier arrows pass cleanly over background corridors)
    draw_swimlane_panel(
        canvas,
        60,
        145,
        2140,
        348,
        radius=16,
        fill_rgba=(240, 249, 255, 220),
        border_rgb=(125, 211, 252),
        pill_bounds=(85, 128, 495, 162),
        pill_text="1. CLIENT SURFACES & HARDWARE",
        pill_style=PALETTE["title"],
        fonts=fonts,
    )
    draw_swimlane_panel(
        canvas,
        60,
        412,
        2140,
        546,
        radius=16,
        fill_rgba=(240, 253, 250, 220),
        border_rgb=(94, 234, 212),
        pill_bounds=(85, 395, 515, 429),
        pill_text="2. API GATEWAY & TRANSPORT LAYER",
        pill_style=PALETTE["action_teal"],
        fonts=fonts,
    )
    draw_swimlane_panel(
        canvas,
        60,
        608,
        1385,
        1128,
        radius=16,
        fill_rgba=(255, 253, 244, 230),
        border_rgb=(212, 180, 106),
        pill_bounds=(85, 591, 565, 625),
        pill_text="3A. CLOUD AI & CLEAN ARCHITECTURE",
        pill_style=PALETTE["action_teal"],
        fonts=fonts,
    )
    draw_swimlane_panel(
        canvas,
        1425,
        608,
        2140,
        1128,
        radius=16,
        fill_rgba=(245, 243, 255, 230),
        border_rgb=(167, 139, 250),
        pill_bounds=(1450, 591, 1920, 625),
        pill_text="3B. EDGE OFFLINE AI (PI 4 — 4GB RAM)",
        pill_style=PALETTE["action_teal"],
        fonts=fonts,
    )
    draw_swimlane_panel(
        canvas,
        60,
        1190,
        2140,
        1460,
        radius=16,
        fill_rgba=(240, 253, 244, 230),
        border_rgb=(110, 231, 183),
        pill_bounds=(85, 1173, 595, 1207),
        pill_text="4. PERSISTENCE, S3 STORAGE & OFFLINE SYNC",
        pill_style=PALETTE["title"],
        fonts=fonts,
    )

    # --- Arrows between and inside Tiers ---
    # Tier 1 -> Tier 2 (all positioned safely to the right of Tier 2 pill x=85..515)
    draw_orthogonal_arrow(canvas, [(540, 324), (540, 446)])
    draw_orthogonal_arrow(canvas, [(843, 324), (843, 446)])
    draw_orthogonal_arrow(canvas, [(1355, 324), (1355, 446)])
    draw_orthogonal_arrow(canvas, [(1540, 324), (1540, 446)])
    draw_bidirectional_arrow(canvas, [(1868, 324), (1868, 446)])

    # Tier 2 -> Tier 3A & Tier 3B (safely right of Pill 3A 85..565 and Pill 3B 1450..1920)
    draw_orthogonal_arrow(canvas, [(625, 526), (625, 650)])
    draw_orthogonal_arrow(canvas, [(1040, 526), (1040, 650)])
    draw_bidirectional_arrow(canvas, [(2010, 526), (2010, 650)])

    # Internal Tier 3A horizontal bridges across x=680..735 & vertical steps
    draw_orthogonal_arrow(canvas, [(680, 699), (735, 699)])
    draw_orthogonal_arrow(canvas, [(680, 817), (735, 817)])
    draw_orthogonal_arrow(canvas, [(680, 935), (735, 935)])
    draw_orthogonal_arrow(canvas, [(680, 1053), (735, 1053)])
    draw_orthogonal_arrow(canvas, [(1042, 748), (1042, 768)])
    draw_orthogonal_arrow(canvas, [(1042, 866), (1042, 886)])
    draw_orthogonal_arrow(canvas, [(1042, 984), (1042, 1004)])

    # Internal Tier 3B vertical pipeline & Cloud <-> Edge hardware bridge
    draw_orthogonal_arrow(canvas, [(1782, 748), (1782, 768)])
    draw_orthogonal_arrow(canvas, [(1782, 866), (1782, 886)])
    draw_orthogonal_arrow(canvas, [(1782, 984), (1782, 1004)])
    draw_bidirectional_arrow(canvas, [(1350, 1053), (1465, 1053)])

    # Tier 3A & Tier 3B -> Tier 4 Persistence (safely right of Pill 4 85..595)
    draw_bidirectional_arrow(canvas, [(760, 1102), (760, 1230)])
    draw_bidirectional_arrow(canvas, [(1175, 1102), (1175, 1230)])
    draw_bidirectional_arrow(canvas, [(1817, 1102), (1817, 1230)])

    # Bidirectional offline cloud sync corridor (above Tier 4 cards, clearing Pill 4)
    draw_bidirectional_arrow(
        canvas, [(690, 1230), (690, 1158), (1960, 1158), (1960, 1230)]
    )

    # Arrow Labels
    draw_arrow_label(canvas, (540, 380), "HTTPS", fonts)
    draw_arrow_label(canvas, (843, 380), "REST", fonts)
    draw_arrow_label(canvas, (1355, 380), "REST", fonts)
    draw_arrow_label(canvas, (1540, 380), "WSS", fonts)
    draw_arrow_label(canvas, (1868, 380), "WSS Stream", fonts)
    draw_arrow_label(canvas, (1325, 1158), "sync_batches (Offline -> Cloud Sync)", fonts)

    # --- Tier 1 Cards ---
    tier1_cards = [
        (
            95,
            567,
            PALETTE["header_teal"],
            [
                TextLine("Web Portal & Cockpits", 18, bold=True),
                TextLine("Next.js 14 • Vercel", 14, bold=True),
                TextLine("Normal • Alzheimer • ADHD", 13, bold=False),
            ],
        ),
        (
            607,
            1079,
            PALETTE["header_teal"],
            [
                TextLine("Mobile App (Flutter)", 18, bold=True),
                TextLine("Patient & Caregiver", 14, bold=True),
                TextLine("GPS Safe Nav • Memory Book • SOS", 13, bold=False),
            ],
        ),
        (
            1119,
            1591,
            PALETTE["header_teal"],
            [
                TextLine("Desktop GUI (MVVM)", 18, bold=True),
                TextLine("PyQt6 / Flutter Desktop", 14, bold=True),
                TextLine("Ambient Widget • Focus Shield", 13, bold=False),
            ],
        ),
        (
            1631,
            2105,
            PALETTE["gold_highlight"],
            [
                TextLine("Mini CURA Hardware", 18, bold=True),
                TextLine("Raspberry Pi 4 (4GB) • I2S Audio", 14, bold=True),
                TextLine('WS2812B LED • 4" LCD • GPIO-17 SOS', 13, bold=False),
            ],
        ),
    ]
    for x1, x2, style, lines in tier1_cards:
        draw_gradient_rounded_rect(
            canvas, x1, 178, x2, 324, radius=12, style=style, lines=lines, fonts=fonts
        )

    # --- Tier 2 Gateway Bars ---
    tier2_bars = [
        (
            95,
            740,
            [
                TextLine("Vercel Serverless API", 17, bold=True),
                TextLine("POST /api/chat • /api/transcribe • /api/tts", 13, bold=False),
            ],
        ),
        (
            790,
            1435,
            [
                TextLine("FastAPI Core REST API (/api/v1)", 17, bold=True),
                TextLine("voice • patient • medication • emergency • health", 13, bold=False),
            ],
        ),
        (
            1485,
            2105,
            [
                TextLine("Full-Duplex WebSocket Hub", 17, bold=True),
                TextLine("/ws/v1/hardware/stream • /ws/v1/voice/stream", 13, bold=False),
            ],
        ),
    ]
    for x1, x2, lines in tier2_bars:
        draw_gradient_rounded_rect(
            canvas,
            x1,
            446,
            x2,
            526,
            radius=10,
            style=PALETTE["cream"],
            lines=lines,
            fonts=fonts,
        )

    # --- Tier 3A Cloud Intelligence & Clean Architecture ---
    tier3a_left = [
        (
            650,
            748,
            PALETTE["gold_highlight"],
            [
                TextLine("Cloudflare Workers AI (GPU)", 17, bold=True),
                TextLine("Llama 3.3 70B FP8-Fast • Native Tool Calling", 13, bold=False),
            ],
        ),
        (
            768,
            866,
            PALETTE["cream"],
            [
                TextLine("Cloud Speech Pipeline (STT / TTS)", 17, bold=True),
                TextLine("Whisper Large v3 Turbo • ElevenLabs / Edge TTS", 13, bold=False),
            ],
        ),
        (
            886,
            984,
            PALETTE["cream"],
            [
                TextLine("5-Tier Live Web Search", 17, bold=True),
                TextLine("Serper • Tavily • Google News RSS • Wiki • DDG", 13, bold=False),
            ],
        ),
        (
            1004,
            1102,
            PALETTE["header_teal"],
            [
                TextLine("Prompt & Safety Guardrails", 17, bold=True),
                TextLine("Claude Fable 5.2 • ADRD-Bench • MIT Corpus", 13, bold=False),
            ],
        ),
    ]
    for y1, y2, style, lines in tier3a_left:
        draw_gradient_rounded_rect(
            canvas, 95, y1, 680, y2, radius=10, style=style, lines=lines, fonts=fonts
        )

    tier3a_right = [
        (
            650,
            748,
            PALETTE["header_teal"],
            [
                TextLine("Domain & Core Use Cases", 17, bold=True),
                TextLine("VoiceInteraction • EmergencyAlert • RepetitionTrack", 13, bold=False),
            ],
        ),
        (
            768,
            866,
            PALETTE["gold_highlight"],
            [
                TextLine("Clinical Tool Router (10 Functions)", 17, bold=True),
                TextLine("Alzheimer Care (4) • ADHD Coach (3) • Research/SOS (3)", 13, bold=False),
            ],
        ),
        (
            886,
            984,
            PALETTE["cream"],
            [
                TextLine("Reasoning & Egyptian Phonology", 17, bold=True),
                TextLine("Global <think> Strip • Harakat & Pause Injection", 13, bold=False),
            ],
        ),
        (
            1004,
            1102,
            PALETTE["action_teal"],
            [
                TextLine("Caregiver Escalation & Alerts", 17, bold=True),
                TextLine("Priority SOS Broadcast • Confusion Logs • Summaries", 13, bold=False),
            ],
        ),
    ]
    for y1, y2, style, lines in tier3a_right:
        draw_gradient_rounded_rect(
            canvas, 735, y1, 1350, y2, radius=10, style=style, lines=lines, fonts=fonts
        )

    # --- Tier 3B Edge Offline AI (Raspberry Pi 4) ---
    tier3b_nodes = [
        (
            650,
            748,
            PALETTE["cream"],
            [
                TextLine("Local STT — Whisper.cpp (Q5_0)", 17, bold=True),
                TextLine("On-Device Egyptian AR / EN (~150–250 MB RAM)", 13, bold=False),
            ],
        ),
        (
            768,
            866,
            PALETTE["gold_highlight"],
            [
                TextLine("Local LLM — Qwen 2.5 1.5B-Instruct", 17, bold=True),
                TextLine("GGUF Q4_K_M • 8–10 tok/s (~1.0 GB RAM)", 13, bold=False),
            ],
        ),
        (
            886,
            984,
            PALETTE["cream"],
            [
                TextLine("Local TTS — Piper Neural ONNX", 17, bold=True),
                TextLine("AR / EN Synthesis • <0.2s Latency (~65 MB RAM)", 13, bold=False),
            ],
        ),
        (
            1004,
            1102,
            PALETTE["header_teal"],
            [
                TextLine("Hardware Bridge & FSM Daemon", 17, bold=True),
                TextLine("systemd • Boot → Idle → Listen → Process → Speak → SOS", 13, bold=False),
            ],
        ),
    ]
    for y1, y2, style, lines in tier3b_nodes:
        draw_gradient_rounded_rect(
            canvas, 1465, y1, 2100, y2, radius=10, style=style, lines=lines, fonts=fonts
        )

    # --- Tier 4 Persistence & Sync ---
    tier4_cards = [
        (
            95,
            820,
            PALETTE["cream"],
            [
                TextLine("Neon Serverless PostgreSQL 16 (Frankfurt)", 17, bold=True),
                TextLine("PgBouncer Pooled • 13 Seeded Clinical Tables", 14, bold=True),
                TextLine(
                    "users • medications • schedules • logs • family • adhd_tasks • emergency_events",
                    12,
                    bold=False,
                ),
            ],
        ),
        (
            865,
            1485,
            PALETTE["cream"],
            [
                TextLine("Neon S3 Object Storage (uploads Bucket)", 17, bold=True),
                TextLine("eu-central-1 Encrypted Clinical Media", 14, bold=True),
                TextLine("Alzheimer's Memory Book Photos • Visual Pill Identification Images", 12, bold=False),
            ],
        ),
        (
            1530,
            2105,
            PALETTE["header_teal"],
            [
                TextLine("Edge SQLite Local Cache (Pi 4)", 17, bold=True),
                TextLine("Air-Gapped Offline Persistence", 14, bold=True),
                TextLine("Zero-Outage Care Logs • Auto-Reconciles via sync_batches", 12, bold=False),
            ],
        ),
    ]
    for x1, x2, style, lines in tier4_cards:
        draw_gradient_rounded_rect(
            canvas, x1, 1230, x2, 1430, radius=12, style=style, lines=lines, fonts=fonts
        )

    return canvas.resize((base_w, base_h), Image.Resampling.LANCZOS)


# ==============================================================================
# Diagram C: Clean Software Architecture & Mini CURA Hardware Blueprint (2200x1350)
# ==============================================================================
def render_clean_and_hardware_architecture() -> Image.Image:
    """Render Concentric Clean Architecture Layers + Mini CURA Hardware & RAM Budget."""
    base_w, base_h = 2200, 1350
    canvas = Image.new("RGBA", (base_w * SCALE, base_h * SCALE), BG_COLOR)
    draw_grid_background(canvas)
    fonts = FontManager(SCALE)

    # Top Title Banner
    draw_gradient_rounded_rect(
        canvas,
        140,
        35,
        2060,
        112,
        radius=16,
        style=PALETTE["title"],
        lines=[
            TextLine(
                "CURA — Clean Software Architecture & Mini CURA Hardware Blueprint",
                32,
                bold=True,
            )
        ],
        fonts=fonts,
    )

    # ==========================================================================
    # LEFT PANEL: Concentric Clean Architecture Layers (Dependency Inversion)
    # ==========================================================================
    draw_swimlane_panel(
        canvas,
        60,
        145,
        1075,
        1310,
        radius=16,
        fill_rgba=(248, 250, 252, 235),
        border_rgb=(148, 163, 184),
        pill_bounds=(85, 128, 555, 162),
        pill_text="1. CLEAN ARCHITECTURE LAYERS (DIP)",
        pill_style=PALETTE["title"],
        fonts=fonts,
    )

    # Layer 4 (Outer Ring)
    draw_gradient_rounded_rect(
        canvas,
        90,
        185,
        1045,
        1278,
        radius=18,
        style=BoxStyle(
            top_rgb=(230, 244, 243),
            bottom_rgb=(210, 234, 232),
            border_rgb=(66, 137, 134),
            text_rgb=(17, 24, 39),
            subtext_rgb=(31, 41, 55),
            shadow_alpha=50,
            border_width=2.0,
        ),
        lines=[],
        fonts=fonts,
    )
    draw_multiline_centered_text(
        canvas,
        center=(567, 234),
        max_width=910,
        lines=[
            TextLine("Layer 4: Presentation & Infrastructure Adapters", 19, bold=True),
            TextLine(
                "FastAPI Routers • WebSockets • Cloudflare AI • Ollama • Neon Postgres • S3 • ElevenLabs • 10 Tools",
                14,
                bold=False,
            ),
        ],
        style=PALETTE["cream"],
        fonts=fonts,
    )

    # Layer 3
    draw_gradient_rounded_rect(
        canvas,
        135,
        282,
        1000,
        1182,
        radius=16,
        style=BoxStyle(
            top_rgb=(232, 250, 253),
            bottom_rgb=(204, 242, 248),
            border_rgb=(8, 145, 178),
            text_rgb=(17, 24, 39),
            subtext_rgb=(31, 41, 55),
            shadow_alpha=44,
            border_width=1.8,
        ),
        lines=[],
        fonts=fonts,
    )
    draw_multiline_centered_text(
        canvas,
        center=(567, 328),
        max_width=820,
        lines=[
            TextLine("Layer 3: Interfaces / Abstract Ports", 19, bold=True),
            TextLine(
                "ILLMEngine • ISTTEngine • ITTSEngine • IToolRouter • IRepositories",
                14,
                bold=False,
            ),
        ],
        style=PALETTE["cream"],
        fonts=fonts,
    )

    # Layer 2
    draw_gradient_rounded_rect(
        canvas,
        185,
        376,
        950,
        1088,
        radius=14,
        style=BoxStyle(
            top_rgb=(254, 249, 231),
            bottom_rgb=(248, 236, 194),
            border_rgb=(201, 164, 59),
            text_rgb=(17, 24, 39),
            subtext_rgb=(31, 41, 55),
            shadow_alpha=44,
            border_width=1.8,
        ),
        lines=[],
        fonts=fonts,
    )
    draw_multiline_centered_text(
        canvas,
        center=(567, 424),
        max_width=720,
        lines=[
            TextLine("Layer 2: Application Use Cases", 19, bold=True),
            TextLine(
                "ProcessVoiceInteraction • HandleEmergencyAlert • TrackRepetition • SummarizeLog",
                13,
                bold=False,
            ),
        ],
        style=PALETTE["cream"],
        fonts=fonts,
    )

    # Layer 1 Core
    draw_gradient_rounded_rect(
        canvas,
        240,
        472,
        895,
        988,
        radius=14,
        style=PALETTE["gold_highlight"],
        lines=[],
        fonts=fonts,
    )
    draw_multiline_centered_text(
        canvas,
        center=(567, 522),
        max_width=610,
        lines=[
            TextLine("Layer 1: Pure Domain Entities & Business Rules", 19, bold=True),
            TextLine("(Zero External Framework or Database Dependencies)", 14, bold=False),
        ],
        style=PALETTE["gold_highlight"],
        fonts=fonts,
    )

    entity_cards = [
        (
            272,
            572,
            554,
            694,
            [
                TextLine("CognitiveMode", 17, bold=True),
                TextLine("Normal • Alzheimer • ADHD", 13, bold=False),
            ],
        ),
        (
            580,
            572,
            862,
            694,
            [
                TextLine("VoiceCommand", 17, bold=True),
                TextLine("STT • Intent • SynthesizedAudio", 13, bold=False),
            ],
        ),
        (
            272,
            716,
            554,
            838,
            [
                TextLine("Medication", 17, bold=True),
                TextLine("Schedules • Physical Visuals", 13, bold=False),
            ],
        ),
        (
            580,
            716,
            862,
            838,
            [
                TextLine("EmergencyEvent", 17, bold=True),
                TextLine("SOS Trigger • GPS • Escalation", 13, bold=False),
            ],
        ),
        (
            360,
            862,
            775,
            960,
            [
                TextLine("ClinicalIntent & Validation Rules", 16, bold=True),
                TextLine("Caregiver Audits & Repetition Safety", 13, bold=False),
            ],
        ),
    ]
    for ex1, ey1, ex2, ey2, lines in entity_cards:
        draw_gradient_rounded_rect(
            canvas, ex1, ey1, ex2, ey2, radius=10, style=PALETTE["cream"], lines=lines, fonts=fonts
        )

    # Inward DIP arrows & legend banner at bottom of Layer 4
    draw_orthogonal_arrow(
        canvas, [(355, 1182), (355, 988)], color=(43, 98, 88, 255), width=3.0
    )
    draw_orthogonal_arrow(
        canvas, [(780, 1182), (780, 988)], color=(43, 98, 88, 255), width=3.0
    )
    draw_orthogonal_arrow(
        canvas, [(567, 1182), (567, 988)], color=(43, 98, 88, 255), width=3.0
    )
    draw_gradient_rounded_rect(
        canvas,
        245,
        1202,
        890,
        1256,
        radius=27,
        style=PALETTE["action_teal"],
        lines=[TextLine("DIP Rule: All Dependencies Point Strictly Inward", 17, bold=True)],
        fonts=fonts,
    )

    # ==========================================================================
    # RIGHT PANEL TOP: Mini CURA Embedded Hardware (Raspberry Pi 4)
    # ==========================================================================
    draw_swimlane_panel(
        canvas,
        1120,
        145,
        2140,
        875,
        radius=16,
        fill_rgba=(240, 253, 250, 230),
        border_rgb=(94, 234, 212),
        pill_bounds=(1145, 128, 1665, 162),
        pill_text="2. MINI CURA HARDWARE (RASPBERRY PI 4 — 4GB)",
        pill_style=PALETTE["action_teal"],
        fonts=fonts,
    )

    # Hardware Wiring Arrows (drawn behind boxes)
    draw_orthogonal_arrow(canvas, [(1415, 258), (1442, 258), (1442, 388), (1470, 388)])
    draw_orthogonal_arrow(canvas, [(1415, 452), (1470, 452)])
    draw_bidirectional_arrow(
        canvas, [(1415, 646), (1442, 646), (1442, 518), (1470, 518)]
    )
    draw_orthogonal_arrow(canvas, [(1790, 388), (1817, 388), (1817, 258), (1845, 258)])
    draw_orthogonal_arrow(canvas, [(1790, 452), (1845, 452)])
    draw_orthogonal_arrow(canvas, [(1790, 518), (1817, 518), (1817, 646), (1845, 646)])
    draw_orthogonal_arrow(canvas, [(1630, 254), (1630, 336)])

    # Top Supervisor & Central Pi 4 Compute Box
    draw_gradient_rounded_rect(
        canvas,
        1490,
        192,
        1770,
        254,
        radius=10,
        style=PALETTE["cream"],
        lines=[
            TextLine("Edge systemd Daemon", 16, bold=True),
            TextLine("hardware/firmware/daemon.py", 12, bold=False),
        ],
        fonts=fonts,
    )
    draw_gradient_rounded_rect(
        canvas,
        1470,
        336,
        1790,
        572,
        radius=14,
        style=PALETTE["header_teal"],
        lines=[
            TextLine("Raspberry Pi 4 Model B", 19, bold=True),
            TextLine("4GB RAM • 64-bit OS", 15, bold=True),
            TextLine("Active Fan • 64GB A2 SD", 14, bold=False),
            TextLine("Camera Excluded (100% AI)", 14, bold=True),
        ],
        fonts=fonts,
    )

    # Left Peripherals
    left_hw = [
        (
            208,
            308,
            PALETTE["cream"],
            [
                TextLine("Far-Field Mic Array", 16, bold=True),
                TextLine("USB / I2S Audio Capture", 13, bold=False),
            ],
        ),
        (
            402,
            502,
            PALETTE["coral"],
            [
                TextLine("Physical SOS Button", 16, bold=True),
                TextLine("GPIO 17 • 250ms Debounce", 13, bold=False),
            ],
        ),
        (
            596,
            696,
            PALETTE["action_teal"],
            [
                TextLine("Wi-Fi Cloud Bridge", 16, bold=True),
                TextLine("/ws/v1/hardware/stream", 13, bold=False),
            ],
        ),
    ]
    for y1, y2, style, lines in left_hw:
        draw_gradient_rounded_rect(
            canvas, 1150, y1, 1415, y2, radius=10, style=style, lines=lines, fonts=fonts
        )

    # Right Peripherals
    right_hw = [
        (
            208,
            308,
            PALETTE["cream"],
            [
                TextLine("MAX98357A I2S Amp", 16, bold=True),
                TextLine("3W 4-Ohm Speaker Output", 13, bold=False),
            ],
        ),
        (
            402,
            502,
            PALETTE["gold_highlight"],
            [
                TextLine("16x WS2812B LED Ring", 16, bold=True),
                TextLine("Blue / Green / Yellow / Red", 13, bold=False),
            ],
        ),
        (
            596,
            696,
            PALETTE["cream"],
            [
                TextLine('4.0" TFT LCD Screen', 16, bold=True),
                TextLine("Clock, Meds & Sprint Timer", 13, bold=False),
            ],
        ),
    ]
    for y1, y2, style, lines in right_hw:
        draw_gradient_rounded_rect(
            canvas, 1845, y1, 2110, y2, radius=10, style=style, lines=lines, fonts=fonts
        )

    # Bottom FSM Strip
    draw_multiline_centered_text(
        canvas,
        center=(1345, 744),
        max_width=400,
        lines=[TextLine("Hardware Finite State Machine (FSM):", 15, bold=True)],
        style=PALETTE["cream"],
        fonts=fonts,
    )
    fsm_states = [
        ("Boot", PALETTE["cream"]),
        ("Idle", PALETTE["cream"]),
        ("Listen", PALETTE["header_teal"]),
        ("Process", PALETTE["gold_highlight"]),
        ("Speak", PALETTE["header_teal"]),
        ("SOS", PALETTE["coral"]),
    ]
    state_w, state_gap = 130, 26
    start_x = 1175
    for idx, (label, style) in enumerate(fsm_states):
        sx = start_x + idx * (state_w + state_gap)
        if idx < len(fsm_states) - 1:
            draw_orthogonal_arrow(
                canvas,
                [(sx + state_w, 804), (sx + state_w + state_gap, 804)],
                head_len=9.0,
                head_half_w=4.5,
            )
        draw_gradient_rounded_rect(
            canvas,
            sx,
            772,
            sx + state_w,
            836,
            radius=28,
            style=style,
            lines=[TextLine(label, 16, bold=True)],
            fonts=fonts,
        )

    # ==========================================================================
    # RIGHT PANEL BOTTOM: Edge AI Memory Budget (4.0 GB Total)
    # ==========================================================================
    draw_swimlane_panel(
        canvas,
        1120,
        915,
        2140,
        1310,
        radius=16,
        fill_rgba=(255, 253, 244, 235),
        border_rgb=(212, 180, 106),
        pill_bounds=(1145, 898, 1755, 932),
        pill_text="3. EDGE AI MEMORY BUDGET (~2.2–2.8 GB / 4.0 GB TOTAL)",
        pill_style=PALETTE["gold_highlight"],
        fonts=fonts,
    )

    segments = [
        MemorySegment(
            label="Qwen 2.5 1.5B",
            gb_label="~1.0 GB",
            fraction=0.25,
            fill_rgb=(250, 219, 118),
            border_rgb=(201, 164, 59),
            text_rgb=(17, 24, 39),
        ),
        MemorySegment(
            label="Whisper.cpp",
            gb_label="~0.25 GB",
            fraction=0.0625,
            fill_rgb=(133, 204, 201),
            border_rgb=(66, 137, 134),
            text_rgb=(17, 24, 39),
        ),
        MemorySegment(
            label="Piper",
            gb_label="65 MB",
            fraction=0.03,
            fill_rgb=(167, 139, 250),
            border_rgb=(109, 40, 217),
            text_rgb=(255, 255, 255),
        ),
        MemorySegment(
            label="FastAPI + OS + Audio",
            gb_label="~1.20 GB",
            fraction=0.30,
            fill_rgb=(253, 241, 198),
            border_rgb=(212, 180, 106),
            text_rgb=(31, 41, 55),
        ),
        MemorySegment(
            label="Free OOM Headroom",
            gb_label="~1.48 GB Safe",
            fraction=0.3575,
            fill_rgb=(78, 155, 140),
            border_rgb=(43, 98, 88),
            text_rgb=(255, 255, 255),
        ),
    ]
    # Draw proportional bar with generous top space for staggered compact callouts
    draw_memory_bar(canvas, 1160, 1015, 2100, 1086, segments, fonts)

    # Stagger Piper slightly higher than Whisper so their two callouts never touch horizontally
    # Wait: let's inspect widths after drawing — let's adjust Whisper & Piper x centers cleanly or use bottom cards:
    mem_cards = [
        (
            1150,
            1375,
            PALETTE["gold_highlight"],
            [
                TextLine("Qwen 2.5 1.5B", 16, bold=True),
                TextLine("GGUF Q4_K_M", 13, bold=False),
                TextLine("~1.0 GB • 8–10 tok/s", 13, bold=True),
            ],
        ),
        (
            1395,
            1620,
            PALETTE["cream"],
            [
                TextLine("Whisper.cpp", 16, bold=True),
                TextLine("base / small Q5_0", 13, bold=False),
                TextLine("~150–250 MB • Local STT", 13, bold=True),
            ],
        ),
        (
            1640,
            1865,
            PALETTE["cream"],
            [
                TextLine("Piper Neural TTS", 16, bold=True),
                TextLine("Arabic / English ONNX", 13, bold=False),
                TextLine("~65 MB • <0.2s ARM", 13, bold=True),
            ],
        ),
        (
            1885,
            2110,
            PALETTE["action_teal"],
            [
                TextLine("Zero-OOM Target", 16, bold=True),
                TextLine("~2.2–2.8 GB Peak", 13, bold=False),
                TextLine(">1.2 GB Free Headroom", 13, bold=True),
            ],
        ),
    ]
    for cx1, cx2, style, lines in mem_cards:
        draw_gradient_rounded_rect(
            canvas, cx1, 1122, cx2, 1272, radius=10, style=style, lines=lines, fonts=fonts
        )

    return canvas.resize((base_w, base_h), Image.Resampling.LANCZOS)


def main() -> None:
    """Generate and persist all three CURA project and architecture diagrams."""
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    targets = [
        (OUT_CLIENT_FLOWCHART, render_whole_project_client_flowchart),
        (OUT_SYSTEM_ARCH, render_system_architecture_diagram),
        (OUT_CLEAN_HW_ARCH, render_clean_and_hardware_architecture),
    ]
    for path, renderer in targets:
        img = renderer()
        img.convert("RGB").save(path, format="PNG", optimize=True)
        print(f"Generated: {path} ({img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    main()
