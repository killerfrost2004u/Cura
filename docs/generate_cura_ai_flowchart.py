"""Generate the CURA AI Model Architecture Flowchart in high-resolution PNG.

Renders at 2x supersampling (3200x4000) with smooth vertical linear gradients,
soft Gaussian drop shadows, orthogonal connector buses, and the Nano Banana
Mini CURA Smart Assistant vector illustration, then downsamples cleanly via
Lanczos resampling to 1600x2000.
"""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# Canvas dimensions (logical 1600x2000 rendered at 2x supersampling)
BASE_W = 1600
BASE_H = 2000
SCALE = 2
OUT_W = 1600
OUT_H = 2000

DOCS_DIR = Path(__file__).resolve().parent
ICON_ASSET_PATH = DOCS_DIR / "assets" / "cura_ai_hub_icon.png"
OUTPUT_PATH = DOCS_DIR / "CURA_AI_Model_Flowchart.png"

RGB = tuple[int, int, int]
RGBA = tuple[int, int, int, int]
Point = tuple[float, float]


@dataclass(frozen=True)
class BoxStyle:
    """Visual styling tokens for flowchart nodes."""

    top_rgb: RGB
    bottom_rgb: RGB
    border_rgb: RGB
    text_rgb: RGB
    subtext_rgb: RGB
    shadow_alpha: int = 58
    border_width: float = 1.6


@dataclass(frozen=True)
class TextLine:
    """Single line of typography within a node."""

    text: str
    size: int
    bold: bool = True
    color: RGB | None = None


PALETTE: dict[str, BoxStyle] = {
    "title": BoxStyle(
        top_rgb=(89, 174, 169),
        bottom_rgb=(62, 140, 136),
        border_rgb=(51, 118, 114),
        text_rgb=(255, 255, 255),
        subtext_rgb=(240, 253, 252),
        shadow_alpha=68,
        border_width=1.8,
    ),
    "header_teal": BoxStyle(
        top_rgb=(133, 204, 201),
        bottom_rgb=(82, 163, 159),
        border_rgb=(66, 137, 134),
        text_rgb=(17, 24, 39),
        subtext_rgb=(17, 24, 39),
        shadow_alpha=56,
        border_width=1.6,
    ),
    "cream": BoxStyle(
        top_rgb=(254, 246, 219),
        bottom_rgb=(245, 226, 166),
        border_rgb=(212, 180, 106),
        text_rgb=(31, 41, 55),
        subtext_rgb=(55, 65, 81),
        shadow_alpha=48,
        border_width=1.5,
    ),
    "gold_highlight": BoxStyle(
        top_rgb=(252, 230, 148),
        bottom_rgb=(236, 200, 92),
        border_rgb=(201, 164, 59),
        text_rgb=(17, 24, 39),
        subtext_rgb=(31, 41, 55),
        shadow_alpha=56,
        border_width=1.6,
    ),
    "diamond": BoxStyle(
        top_rgb=(252, 227, 115),
        bottom_rgb=(239, 195, 61),
        border_rgb=(201, 159, 40),
        text_rgb=(17, 24, 39),
        subtext_rgb=(31, 41, 55),
        shadow_alpha=60,
        border_width=1.7,
    ),
    "action_teal": BoxStyle(
        top_rgb=(78, 155, 140),
        bottom_rgb=(54, 122, 109),
        border_rgb=(43, 98, 88),
        text_rgb=(255, 255, 255),
        subtext_rgb=(235, 250, 246),
        shadow_alpha=62,
        border_width=1.6,
    ),
    "yes_badge": BoxStyle(
        top_rgb=(106, 178, 155),
        bottom_rgb=(77, 145, 123),
        border_rgb=(59, 119, 100),
        text_rgb=(255, 255, 255),
        subtext_rgb=(255, 255, 255),
        shadow_alpha=50,
        border_width=1.4,
    ),
    "coral": BoxStyle(
        top_rgb=(235, 128, 128),
        bottom_rgb=(205, 81, 86),
        border_rgb=(179, 62, 67),
        text_rgb=(255, 255, 255),
        subtext_rgb=(255, 240, 240),
        shadow_alpha=62,
        border_width=1.6,
    ),
}

ARROW_COLOR: RGBA = (74, 85, 104, 255)
BG_COLOR: RGBA = (250, 251, 252, 255)
GRID_COLOR: RGBA = (238, 241, 244, 255)


class FontManager:
    """Loads and caches TrueType fonts scaled for supersampled rendering."""

    BOLD_CANDIDATES = (
        r"C:\Windows\Fonts\segoeuib.ttf",
        r"C:\Windows\Fonts\calibrib.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
    )
    REGULAR_CANDIDATES = (
        r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\calibri.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    )

    def __init__(self, scale: int) -> None:
        self._scale = scale
        self._bold_path = self._find_font(self.BOLD_CANDIDATES)
        self._reg_path = self._find_font(self.REGULAR_CANDIDATES)
        self._cache: dict[tuple[int, bool], ImageFont.FreeTypeFont] = {}

    @staticmethod
    def _find_font(paths: tuple[str, ...]) -> str | None:
        for path in paths:
            if Path(path).exists():
                return path
        return None

    def get(self, size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
        key = (size, bold)
        if key not in self._cache:
            px = max(10, int(round(size * self._scale)))
            font_path = self._bold_path if bold else self._reg_path
            if font_path:
                self._cache[key] = ImageFont.truetype(font_path, px)
            else:
                self._cache[key] = ImageFont.load_default(size=px)
        return self._cache[key]


def _make_vertical_gradient(
    width: int, height: int, top_rgb: RGB, bottom_rgb: RGB
) -> Image.Image:
    """Create an RGB image with a smooth top-to-bottom linear gradient."""
    t = np.linspace(0.0, 1.0, max(1, height), dtype=np.float32)[:, None, None]
    top = np.array(top_rgb, dtype=np.float32).reshape((1, 1, 3))
    bot = np.array(bottom_rgb, dtype=np.float32).reshape((1, 1, 3))
    grad = np.clip(top * (1.0 - t) + bot * t, 0, 255).astype(np.uint8)
    grad_full = np.broadcast_to(grad, (height, width, 3)).copy()
    return Image.fromarray(grad_full, mode="RGB")


def _composite_shadow_and_fill(
    canvas: Image.Image,
    bbox: tuple[int, int, int, int],
    mask_2x: Image.Image,
    style: BoxStyle,
) -> None:
    """Composite blurred drop shadow, anti-aliased gradient fill, and mask clip."""
    x1, y1, x2, y2 = bbox
    w, h = x2 - x1, y2 - y1
    mask = mask_2x.resize((w, h), Image.Resampling.LANCZOS)

    # Drop shadow
    pad = 16 * SCALE
    shadow_img = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    shadow_color = (15, 23, 42, style.shadow_alpha)
    solid_shadow = Image.new("RGBA", (w, h), shadow_color)
    shadow_img.paste(solid_shadow, (pad, pad), mask)
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=4.5 * SCALE))
    canvas.alpha_composite(
        shadow_img,
        dest=(x1 - pad + 3 * SCALE, y1 - pad + 5 * SCALE),
    )

    # Clipped vertical gradient interior
    grad_rgb = _make_vertical_gradient(w, h, style.top_rgb, style.bottom_rgb)
    grad_rgba = grad_rgb.convert("RGBA")
    grad_rgba.putalpha(mask)
    canvas.alpha_composite(grad_rgba, dest=(x1, y1))


def draw_multiline_centered_text(
    canvas: Image.Image,
    center: Point,
    max_width: float,
    lines: Sequence[TextLine],
    style: BoxStyle,
    fonts: FontManager,
    line_gap: float = 5.0,
) -> None:
    """Center one or more typographic lines optically within max_width."""
    if not lines:
        return

    draw = ImageDraw.Draw(canvas)
    cx = center[0] * SCALE
    cy = center[1] * SCALE
    usable_w = max_width * SCALE
    gap_px = line_gap * SCALE

    resolved_fonts: list[ImageFont.FreeTypeFont] = []
    bboxes: list[tuple[int, int, int, int]] = []

    for item in lines:
        size = item.size
        font = fonts.get(size, item.bold)
        bb = draw.textbbox((0, 0), item.text, font=font)
        while (bb[2] - bb[0]) > usable_w and size > 10:
            size -= 1
            font = fonts.get(size, item.bold)
            bb = draw.textbbox((0, 0), item.text, font=font)
        resolved_fonts.append(font)
        bboxes.append(bb)

    line_heights = [bb[3] - bb[1] for bb in bboxes]
    total_h = sum(line_heights) + gap_px * (len(lines) - 1)
    cursor_y = cy - total_h / 2.0

    for idx, item in enumerate(lines):
        font = resolved_fonts[idx]
        bb = bboxes[idx]
        text_w = bb[2] - bb[0]
        text_h = bb[3] - bb[1]
        tx = cx - text_w / 2.0 - bb[0]
        ty = cursor_y - bb[1]
        default_col = style.text_rgb if idx == 0 else style.subtext_rgb
        fill_col = item.color if item.color is not None else default_col
        draw.text((tx, ty), item.text, font=font, fill=fill_col + (255,))
        cursor_y += text_h + gap_px


def draw_gradient_rounded_rect(
    canvas: Image.Image,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    radius: float,
    style: BoxStyle,
    lines: Sequence[TextLine],
    fonts: FontManager,
    padding_x: float = 14.0,
) -> None:
    """Draw a rounded rectangle with vertical gradient, shadow, crisp border, and text."""
    sx1, sy1 = int(round(x1 * SCALE)), int(round(y1 * SCALE))
    sx2, sy2 = int(round(x2 * SCALE)), int(round(y2 * SCALE))
    w, h = sx2 - sx1, sy2 - sy1
    r_px = min(int(round(radius * SCALE)), w // 2, h // 2)

    # 2x internal mask for subpixel edge anti-aliasing
    mask_2x = Image.new("L", (w * 2, h * 2), 0)
    md = ImageDraw.Draw(mask_2x)
    md.rounded_rectangle((0, 0, w * 2 - 1, h * 2 - 1), radius=r_px * 2, fill=255)

    _composite_shadow_and_fill(canvas, (sx1, sy1, sx2, sy2), mask_2x, style)

    # Crisp vector-AA border via 2x overlay
    bw = max(2, int(round(style.border_width * SCALE)))
    border_2x = Image.new("RGBA", (w * 2, h * 2), (0, 0, 0, 0))
    bd = ImageDraw.Draw(border_2x)
    bd.rounded_rectangle(
        (bw, bw, w * 2 - 1 - bw, h * 2 - 1 - bw),
        radius=max(2, r_px * 2 - bw),
        outline=style.border_rgb + (255,),
        width=bw * 2,
    )
    canvas.alpha_composite(
        border_2x.resize((w, h), Image.Resampling.LANCZOS), dest=(sx1, sy1)
    )

    draw_multiline_centered_text(
        canvas,
        center=((x1 + x2) / 2.0, (y1 + y2) / 2.0),
        max_width=(x2 - x1) - 2 * padding_x,
        lines=lines,
        style=style,
        fonts=fonts,
    )


def draw_gradient_diamond(
    canvas: Image.Image,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    style: BoxStyle,
    lines: Sequence[TextLine],
    fonts: FontManager,
) -> None:
    """Draw a diamond decision node with vertical gold gradient, shadow, and border."""
    x1, y1 = int(round((cx - rx) * SCALE)), int(round((cy - ry) * SCALE))
    x2, y2 = int(round((cx + rx) * SCALE)), int(round((cy + ry) * SCALE))
    w, h = x2 - x1, y2 - y1

    pts_2x = [
        (w, 2),
        (w * 2 - 2, h),
        (w, h * 2 - 2),
        (2, h),
    ]
    mask_2x = Image.new("L", (w * 2, h * 2), 0)
    ImageDraw.Draw(mask_2x).polygon(pts_2x, fill=255)

    _composite_shadow_and_fill(canvas, (x1, y1, x2, y2), mask_2x, style)

    bw = max(2, int(round(style.border_width * SCALE)))
    inset = bw + 1
    border_pts_2x = [
        (w, inset),
        (w * 2 - inset, h),
        (w, h * 2 - inset),
        (inset, h),
    ]
    border_2x = Image.new("RGBA", (w * 2, h * 2), (0, 0, 0, 0))
    ImageDraw.Draw(border_2x).polygon(
        border_pts_2x, outline=style.border_rgb + (255,), width=bw * 2
    )
    canvas.alpha_composite(
        border_2x.resize((w, h), Image.Resampling.LANCZOS), dest=(x1, y1)
    )

    draw_multiline_centered_text(
        canvas,
        center=(cx, cy),
        max_width=rx * 1.32,
        lines=lines,
        style=style,
        fonts=fonts,
    )


def draw_orthogonal_arrow(
    canvas: Image.Image,
    points: Sequence[Point],
    color: RGBA = ARROW_COLOR,
    width: float = 2.4,
    arrow_end: bool = True,
    head_len: float = 11.0,
    head_half_w: float = 5.5,
) -> None:
    """Draw an orthogonal polyline with rounded joins and a crisp triangular arrowhead."""
    if len(points) < 2:
        return

    draw = ImageDraw.Draw(canvas)
    scaled = [(p[0] * SCALE, p[1] * SCALE) for p in points]
    line_w = max(2, int(round(width * SCALE)))

    # Shorten final segment slightly so line ends cleanly inside arrowhead base
    poly_pts = list(scaled)
    tip = np.array(scaled[-1], dtype=np.float64)
    prev = np.array(scaled[-2], dtype=np.float64)
    vec = tip - prev
    norm = float(np.linalg.norm(vec))

    if arrow_end and norm > 1e-3:
        u = vec / norm
        hl = head_len * SCALE
        hw = head_half_w * SCALE
        base_center = tip - u * (hl * 0.72)
        poly_pts[-1] = (float(base_center[0]), float(base_center[1]))

        perp = np.array([-u[1], u[0]])
        left_pt = tip - u * hl + perp * hw
        right_pt = tip - u * hl - perp * hw

        # Draw segments with clean corner caps
        for i in range(len(poly_pts) - 1):
            draw.line([poly_pts[i], poly_pts[i + 1]], fill=color, width=line_w)
        r_joint = line_w / 2.0
        for px, py in poly_pts[1:-1]:
            draw.ellipse(
                (px - r_joint, py - r_joint, px + r_joint, py + r_joint), fill=color
            )

        draw.polygon(
            [
                (float(tip[0]), float(tip[1])),
                (float(left_pt[0]), float(left_pt[1])),
                (float(right_pt[0]), float(right_pt[1])),
            ],
            fill=color,
        )
    else:
        for i in range(len(poly_pts) - 1):
            draw.line([poly_pts[i], poly_pts[i + 1]], fill=color, width=line_w)
        r_joint = line_w / 2.0
        for px, py in poly_pts[1:-1]:
            draw.ellipse(
                (px - r_joint, py - r_joint, px + r_joint, py + r_joint), fill=color
            )


def draw_grid_background(canvas: Image.Image) -> None:
    """Fill off-white paper canvas with a subtle 24px technical micro-grid."""
    draw = ImageDraw.Draw(canvas)
    step = 24 * SCALE
    line_w = max(1, SCALE // 2)
    for x in range(0, canvas.width, step):
        draw.line([(x, 0), (x, canvas.height)], fill=GRID_COLOR, width=line_w)
    for y in range(0, canvas.height, step):
        draw.line([(0, y), (canvas.width, y)], fill=GRID_COLOR, width=line_w)


def remove_exterior_white_background(
    icon: Image.Image, white_threshold: int = 240
) -> Image.Image:
    """Remove only the exterior near-white background via edge BFS flood fill.

    Preserves interior white surfaces of the device casing at 100% opacity while
    smoothly anti-aliasing the exterior boundary.
    """
    rgba = icon.convert("RGBA")
    arr = np.array(rgba, dtype=np.uint8)
    h, w, _ = arr.shape

    rgb = arr[:, :, :3]
    is_near_white = (
        (rgb[:, :, 0] >= white_threshold)
        & (rgb[:, :, 1] >= white_threshold)
        & (rgb[:, :, 2] >= white_threshold)
    )

    exterior = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    # Seed perimeter pixels
    for x in range(w):
        for y in (0, h - 1):
            if is_near_white[y, x] and not exterior[y, x]:
                exterior[y, x] = True
                queue.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if is_near_white[y, x] and not exterior[y, x]:
                exterior[y, x] = True
                queue.append((y, x))

    while queue:
        cy, cx = queue.popleft()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if 0 <= ny < h and 0 <= nx < w:
                if not exterior[ny, nx] and is_near_white[ny, nx]:
                    exterior[ny, nx] = True
                    queue.append((ny, nx))

    alpha = arr[:, :, 3].copy()
    alpha[exterior] = 0

    # Soften 1px fringe pixels directly adjacent to exterior background
    padded = np.pad(exterior, 1, mode="constant", constant_values=False)
    touches_ext = (
        padded[:-2, 1:-1] | padded[2:, 1:-1] | padded[1:-1, :-2] | padded[1:-1, 2:]
    ) & (~exterior)
    luminance = (
        0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    )
    fringe = touches_ext & (luminance > 210.0)
    ramp = np.clip((255.0 - luminance) / (255.0 - 210.0) * 255.0, 0, 255).astype(
        np.uint8
    )
    alpha[fringe] = np.minimum(alpha[fringe], ramp[fringe])

    arr[:, :, 3] = alpha
    result = Image.fromarray(arr, mode="RGBA")
    bbox = result.getbbox()
    return result.crop(bbox) if bbox else result


def draw_fallback_cura_hub(target_w: int, target_h: int) -> Image.Image:
    """Clean vector fallback for the Mini CURA AI hub if the external asset is missing."""
    img = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx, cy = target_w // 2, int(target_h * 0.62)
    bw, bh = int(target_w * 0.68), int(target_h * 0.52)

    # Wi-Fi signal arcs above hub
    for idx, r_arc in enumerate((38, 62, 86)):
        stroke = max(3, int(target_w * 0.015))
        bbox = (
            cx - r_arc,
            int(target_h * 0.28) - r_arc,
            cx + r_arc,
            int(target_h * 0.28) + r_arc,
        )
        d.arc(bbox, start=220, end=320, fill=(92, 138, 145, 220 - idx * 35), width=stroke)

    # Device outer shell
    d.rounded_rectangle(
        (cx - bw // 2, cy - bh // 2, cx + bw // 2, cy + bh // 2),
        radius=36,
        fill=(248, 250, 252, 255),
        outline=(51, 65, 85, 255),
        width=5,
    )
    # Dark OLED faceplate
    sw, sh = int(bw * 0.74), int(bh * 0.64)
    d.rounded_rectangle(
        (cx - sw // 2, cy - sh // 2, cx + sw // 2, cy + sh // 2),
        radius=22,
        fill=(30, 41, 59, 255),
        outline=(78, 161, 158, 255),
        width=4,
    )
    # Cyan audio wave
    wave_pts = [
        (cx - sw * 0.32 + i * (sw * 0.64 / 24), cy + np.sin(i * 0.65) * sh * 0.18)
        for i in range(25)
    ]
    d.line(wave_pts, fill=(96, 239, 235, 255), width=5)
    return img


def composite_bottom_right_illustration(
    canvas: Image.Image, box: tuple[float, float, float, float]
) -> None:
    """Composite the Mini CURA Smart Assistant icon seamlessly in bottom-right."""
    x1, y1, x2, y2 = box
    max_w = int(round((x2 - x1) * SCALE))
    max_h = int(round((y2 - y1) * SCALE))

    if ICON_ASSET_PATH.exists():
        with Image.open(ICON_ASSET_PATH) as raw:
            cleaned = remove_exterior_white_background(raw)
        scale_ratio = min(max_w / cleaned.width, max_h / cleaned.height)
        new_size = (
            max(1, int(round(cleaned.width * scale_ratio))),
            max(1, int(round(cleaned.height * scale_ratio))),
        )
        resized = cleaned.resize(new_size, Image.Resampling.LANCZOS)
    else:
        resized = draw_fallback_cura_hub(max_w, max_h)

    dest_x = int(round(x1 * SCALE + (max_w - resized.width) / 2.0))
    dest_y = int(round(y1 * SCALE + (max_h - resized.height) / 2.0))
    canvas.alpha_composite(resized, dest=(dest_x, dest_y))


def render_flowchart() -> Image.Image:
    """Render the complete CURA AI Model Flowchart onto a supersampled canvas."""
    canvas = Image.new("RGBA", (BASE_W * SCALE, BASE_H * SCALE), BG_COLOR)
    draw_grid_background(canvas)
    fonts = FontManager(SCALE)

    # --- 1. Arrows & Orthogonal Distribution Buses (Drawn behind shapes) ---
    # Top flow
    draw_orthogonal_arrow(canvas, [(800, 215), (800, 250)])
    draw_orthogonal_arrow(canvas, [(800, 394), (800, 474)])
    draw_orthogonal_arrow(canvas, [(800, 434), (250, 434), (250, 474)])
    draw_orthogonal_arrow(canvas, [(800, 434), (1295, 434), (1295, 474)])

    # Left Column: Speech & Input Pipeline (STT)
    draw_orthogonal_arrow(canvas, [(230, 558), (230, 605)])
    draw_orthogonal_arrow(
        canvas, [(365, 637), (420, 637), (420, 922)], arrow_end=False
    )
    draw_orthogonal_arrow(canvas, [(420, 732), (365, 732)])
    draw_orthogonal_arrow(canvas, [(420, 827), (365, 827)])
    draw_orthogonal_arrow(canvas, [(420, 922), (365, 922)])

    # Center Column: Main AI Reasoning Core
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

    # Right Column: Knowledge & Tools System
    draw_orthogonal_arrow(canvas, [(1162, 558), (1162, 605)])
    draw_orthogonal_arrow(canvas, [(1412, 558), (1412, 605)])
    draw_orthogonal_arrow(canvas, [(1288, 558), (1288, 710)])

    draw_orthogonal_arrow(canvas, [(1145, 795), (1145, 840)])
    draw_orthogonal_arrow(canvas, [(1145, 910), (1145, 1110), (945, 1110)])

    draw_orthogonal_arrow(canvas, [(1395, 795), (1395, 840)])
    draw_orthogonal_arrow(canvas, [(1395, 905), (1395, 930)])
    draw_orthogonal_arrow(canvas, [(1395, 995), (1395, 1020)])

    # Bottom-Left Branch (YES -> Voice Synthesis -> End)
    draw_orthogonal_arrow(canvas, [(655, 1110), (440, 1110), (440, 1170)])
    draw_orthogonal_arrow(canvas, [(440, 1212), (440, 1272)])
    draw_orthogonal_arrow(canvas, [(440, 1342), (440, 1388)])
    draw_orthogonal_arrow(canvas, [(440, 1463), (440, 1493)])
    draw_orthogonal_arrow(canvas, [(440, 1568), (440, 1842)])
    draw_orthogonal_arrow(canvas, [(440, 1785), (635, 1785)])
    draw_orthogonal_arrow(
        canvas, [(590, 1425), (635, 1425), (635, 1710), (440, 1710)]
    )

    # Bottom Center Spine & Bottom-Right Branch
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

    # --- 2. Nodes ---
    # Top Title & Entry
    draw_gradient_rounded_rect(
        canvas,
        180,
        45,
        1420,
        130,
        radius=16,
        style=PALETTE["title"],
        lines=[TextLine("CURA AI Model Flowchart", 34, bold=True)],
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
        rx=145,
        ry=72,
        style=PALETTE["diamond"],
        lines=[
            TextLine("Receive Input", 20, bold=True),
            TextLine("(Voice / Text)", 16, bold=False),
        ],
        fonts=fonts,
    )

    # Left Column — Speech & Input Pipeline (STT)
    draw_gradient_rounded_rect(
        canvas,
        95,
        474,
        405,
        558,
        radius=12,
        style=PALETTE["header_teal"],
        lines=[
            TextLine("Speech & Input", 20, bold=True),
            TextLine("Pipeline (STT)", 20, bold=True),
        ],
        fonts=fonts,
    )
    left_boxes = [
        (605, 670, [TextLine("Web / Mini CURA Mic", 18, bold=True)]),
        (
            695,
            770,
            [
                TextLine("Whisper STT Engine", 18, bold=True),
                TextLine("(Large v3 / Whisper.cpp)", 14, bold=False),
            ],
        ),
        (795, 860, [TextLine("Hallucination Filter", 18, bold=True)]),
        (
            885,
            960,
            [
                TextLine("Language & Dialect ID", 18, bold=True),
                TextLine("(Egyptian AR / EN)", 14, bold=False),
            ],
        ),
    ]
    for y1, y2, lines in left_boxes:
        draw_gradient_rounded_rect(
            canvas, 95, y1, 365, y2, radius=9, style=PALETTE["cream"], lines=lines, fonts=fonts
        )

    # Center Column — Main AI Reasoning Core
    draw_gradient_rounded_rect(
        canvas,
        590,
        474,
        1010,
        558,
        radius=12,
        style=PALETTE["header_teal"],
        lines=[
            TextLine("Main AI Reasoning Core", 20, bold=True),
            TextLine("(Cloudflare / Edge LLM)", 17, bold=True),
        ],
        fonts=fonts,
    )
    center_boxes = [
        (
            605,
            680,
            PALETTE["gold_highlight"],
            [
                TextLine("Cognitive Mode Router", 18, bold=True),
                TextLine("(Normal / Alzheimer / ADHD)", 14, bold=False),
            ],
        ),
        (
            705,
            780,
            PALETTE["cream"],
            [
                TextLine("Prompt & Safety Engine", 18, bold=True),
                TextLine("(Claude Fable 5.2 / ADRD / MIT)", 14, bold=False),
            ],
        ),
        (
            805,
            880,
            PALETTE["cream"],
            [
                TextLine("Hybrid LLM Inference", 18, bold=True),
                TextLine("(Llama 3.3 70B / Qwen 2.5)", 14, bold=False),
            ],
        ),
        (
            905,
            980,
            PALETTE["cream"],
            [
                TextLine("Reasoning (<think>) Parser", 18, bold=True),
                TextLine("(Extract & Strip CoT)", 14, bold=False),
            ],
        ),
    ]
    for y1, y2, style, lines in center_boxes:
        draw_gradient_rounded_rect(
            canvas, 615, y1, 985, y2, radius=9, style=style, lines=lines, fonts=fonts
        )

    # Right Column — Knowledge & Tools System
    draw_gradient_rounded_rect(
        canvas,
        1135,
        474,
        1455,
        558,
        radius=12,
        style=PALETTE["header_teal"],
        lines=[
            TextLine("Knowledge & Tools", 20, bold=True),
            TextLine("System", 20, bold=True),
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
            TextLine("5-Tier Web Search", 17, bold=True),
            TextLine("(Serper / Tavily / News)", 13, bold=False),
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
            TextLine("Neon Postgres DB", 17, bold=True),
            TextLine("(13 Clinical Tables)", 13, bold=False),
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
            TextLine("Clinical Tool Router", 20, bold=True),
            TextLine("(10 AI Functions)", 17, bold=True),
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
            TextLine("Live Context", 17, bold=True),
            TextLine("Injection", 17, bold=True),
        ],
        fonts=fonts,
    )
    right_tool_boxes = [
        (
            840,
            905,
            [
                TextLine("Alzheimer Care Tools", 17, bold=True),
                TextLine("(Meds & Memory)", 13, bold=False),
            ],
        ),
        (
            930,
            995,
            [
                TextLine("ADHD Focus Coach", 17, bold=True),
                TextLine("(Micro-Task Sprints)", 13, bold=False),
            ],
        ),
        (
            1020,
            1085,
            [
                TextLine("Caregiver & SOS", 17, bold=True),
                TextLine("(Alerts & Summary)", 13, bold=False),
            ],
        ),
    ]
    for y1, y2, lines in right_tool_boxes:
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
            TextLine("Voice Output", 19, bold=True),
            TextLine("Requested?", 19, bold=True),
        ],
        fonts=fonts,
    )

    # Bottom-Left Branch — Voice Synthesis (TTS)
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
        lines=[TextLine("Voice Synthesis (TTS)", 20, bold=True)],
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
            TextLine("Egyptian Phonology", 18, bold=True),
            TextLine("(Harakat & Clean Text)", 14, bold=False),
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
            TextLine("Neural Voice Output", 18, bold=True),
            TextLine("(ElevenLabs / Edge / Piper)", 14, bold=False),
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

    # Bottom-Right Branch — Adaptive Output & Care Sync
    draw_gradient_rounded_rect(
        canvas,
        940,
        1178,
        1290,
        1246,
        radius=12,
        style=PALETTE["action_teal"],
        lines=[TextLine("Update UI & Sync Cloud", 19, bold=True)],
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
        lines=[TextLine("Adaptive Output & Care", 20, bold=True)],
        fonts=fonts,
    )
    bottom_right_boxes = [
        (
            1405,
            1475,
            [
                TextLine("Display Clean Answer", 18, bold=True),
                TextLine("(Zero <think> Tags)", 14, bold=False),
            ],
        ),
        (
            1500,
            1570,
            [
                TextLine("Save Session & Logs", 18, bold=True),
                TextLine("(Neon Postgres Sync)", 14, bold=False),
            ],
        ),
        (
            1595,
            1665,
            [
                TextLine("Caregiver / SOS Alert", 18, bold=True),
                TextLine("(Emergency Broadcast)", 14, bold=False),
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

    # Bottom-Center Pill
    draw_gradient_rounded_rect(
        canvas,
        635,
        1755,
        965,
        1815,
        radius=30,
        style=PALETTE["action_teal"],
        lines=[TextLine("Ready for Next Query", 20, bold=True)],
        fonts=fonts,
    )

    # Bottom-Right Mini CURA AI Hub Illustration
    composite_bottom_right_illustration(canvas, (1050, 1695, 1490, 1955))

    return canvas.resize((OUT_W, OUT_H), Image.Resampling.LANCZOS)


def main() -> None:
    """Render and persist the CURA AI Model Flowchart PNG."""
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    rendered = render_flowchart()
    rendered.convert("RGB").save(OUTPUT_PATH, format="PNG", optimize=True)
    print(f"Generated flowchart: {OUTPUT_PATH} ({rendered.size[0]}x{rendered.size[1]})")


if __name__ == "__main__":
    main()
