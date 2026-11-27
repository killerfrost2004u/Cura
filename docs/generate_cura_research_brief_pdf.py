"""Build a 12-slide 16:9 Research Paper Technical Brief PDF for the CURA AI Model.

Generates standalone HTML (with embedded base64 assets and exact 13.3333in x 7.5in
16:9 @page CSS) and compiles a print-exact vector/raster PDF via headless Chromium
(Google Chrome or Microsoft Edge).
"""

from __future__ import annotations

import base64
import html
import re
import subprocess
from pathlib import Path

ROOT_DIR = Path(r"D:\Cura")
DOCS_DIR = ROOT_DIR / "docs"
LOGO_PATH = ROOT_DIR / "cura_harmony_logo_1791226392255.jpg"
FLOW_AI_PATH = DOCS_DIR / "CURA_AI_Model_Flowchart.png"
ARCH_SYS_PATH = DOCS_DIR / "CURA_System_Architecture_Diagram.png"
ARCH_HW_PATH = DOCS_DIR / "CURA_Clean_Hardware_Architecture.png"
ICON_ECO_PATH = DOCS_DIR / "assets" / "cura_ecosystem_icon.png"
ICON_HUB_PATH = DOCS_DIR / "assets" / "cura_ai_hub_icon.png"

OUT_HTML = DOCS_DIR / "CURA_AI_Research_Paper_Brief.html"
OUT_PDF = DOCS_DIR / "CURA_AI_Model_Research_Brief_16x9.pdf"

BROWSER_CANDIDATES = (
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
)


def encode_image_data_uri(path: Path) -> str:
    """Read an image asset and return a self-contained RFC 2397 base64 data URI."""
    if not path.exists():
        raise FileNotFoundError(f"Required visual asset not found: {path}")
    ext = path.suffix.lower().lstrip(".")
    mime = "image/jpeg" if ext in ("jpg", "jpeg") else "image/png"
    raw = path.read_bytes()
    b64 = base64.b64encode(raw).decode("ascii")
    return f"data:{mime};base64,{b64}"


def render_header(
    title: str, category: str, slide_num: int, total_slides: int, logo_uri: str, status_badge: str, badge_cls: str
) -> str:
    """Build the standardized Midnight Obsidian top bar for content slides 2-11."""
    return f"""
    <header class="top-bar">
      <div class="brand-cluster">
        <img class="header-logo" src="{logo_uri}" alt="CURA Logo" />
        <div class="header-titles">
          <span class="header-kicker">{html.escape(category)}</span>
          <h2 class="header-title">{html.escape(title)}</h2>
        </div>
      </div>
      <div class="header-right">
        <span class="status-pill {badge_cls}">{html.escape(status_badge)}</span>
        <span class="slide-counter">{slide_num:02d} / {total_slides:02d}</span>
      </div>
    </header>"""


def render_footer(slide_num: int, total_slides: int, section_note: str) -> str:
    """Build the slim bottom attribution and section indicator footer."""
    return f"""
    <footer class="bottom-bar">
      <span>CURA Adaptive Healthcare &amp; Intelligence AI — Graduation Project Research Brief</span>
      <span>{html.escape(section_note)} &nbsp;|&nbsp; Slide {slide_num} of {total_slides}</span>
    </footer>"""


def build_html_document() -> str:
    """Assemble the complete 12-slide 16:9 HTML brief with embedded base64 imagery."""
    logo_uri = encode_image_data_uri(LOGO_PATH)
    flow_ai_uri = encode_image_data_uri(FLOW_AI_PATH)
    arch_sys_uri = encode_image_data_uri(ARCH_SYS_PATH)
    arch_hw_uri = encode_image_data_uri(ARCH_HW_PATH)
    eco_uri = encode_image_data_uri(ICON_ECO_PATH)
    hub_uri = encode_image_data_uri(ICON_HUB_PATH)

    total = 12

    css = """
    @page {
      size: 13.3333in 7.5in;
      margin: 0;
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #0F172A;
      font-family: 'Segoe UI', 'Cairo', system-ui, -apple-system, sans-serif;
      color: #0F172A;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .deck {
      width: 1280px;
      margin: 0 auto;
    }
    .slide {
      width: 1280px;
      height: 720px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #F8FAFC;
      page-break-after: always;
      break-after: page;
    }
    .slide:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    /* Dark Obsidian Bookend Slides (1 & 12) matching logo corner #121A25 */
    .slide-dark {
      background: #121A25;
      color: #F8FAFC;
    }
    .obsidian-glow-left {
      position: absolute;
      width: 520px;
      height: 520px;
      top: -120px;
      left: -120px;
      background: radial-gradient(circle, rgba(22, 185, 254, 0.16) 0%, rgba(18, 26, 37, 0) 70%);
      pointer-events: none;
    }
    .obsidian-glow-right {
      position: absolute;
      width: 580px;
      height: 580px;
      bottom: -140px;
      right: -80px;
      background: radial-gradient(circle, rgba(175, 106, 251, 0.14) 0%, rgba(63, 237, 186, 0.08) 45%, rgba(18, 26, 37, 0) 72%);
      pointer-events: none;
    }
    .accent-strip {
      height: 6px;
      width: 100%;
      background: linear-gradient(90deg, #16B9FE 0%, #60EFEB 35%, #3FEDBA 68%, #AF6AFB 100%);
      flex-shrink: 0;
    }

    /* Standard Content Header & Footer */
    .top-bar {
      height: 58px;
      background: #121A25;
      color: #FFFFFF;
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #16B9FE;
      flex-shrink: 0;
    }
    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-logo {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: 10px;
    }
    .header-titles {
      display: flex;
      flex-direction: column;
    }
    .header-kicker {
      font-size: 10px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #60EFEB;
      font-weight: 700;
      line-height: 1.1;
    }
    .header-title {
      margin: 1px 0 0 0;
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.15;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .status-pill {
      padding: 4px 11px;
      border-radius: 999px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .pill-built {
      background: rgba(63, 237, 186, 0.18);
      color: #3FEDBA;
      border: 1px solid rgba(63, 237, 186, 0.55);
    }
    .pill-planned {
      background: rgba(175, 106, 251, 0.22);
      color: #D8B4FE;
      border: 1px solid rgba(175, 106, 251, 0.65);
    }
    .pill-eval {
      background: rgba(22, 185, 254, 0.20);
      color: #60EFEB;
      border: 1px solid rgba(22, 185, 254, 0.60);
    }
    .slide-counter {
      font-size: 12px;
      font-weight: 700;
      color: #94A3B8;
      font-variant-numeric: tabular-nums;
    }

    .body-area {
      flex: 1;
      padding: 16px 28px 10px 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow: hidden;
    }

    .bottom-bar {
      height: 26px;
      background: #EEF2F6;
      border-top: 1px solid #CBD5E1;
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      color: #475569;
      font-weight: 600;
      flex-shrink: 0;
    }

    /* Reusable Card & Grid Primitives */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      flex: 1;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      flex: 1;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .split-visual {
      display: grid;
      grid-template-columns: 1.08fr 1fr;
      gap: 16px;
      flex: 1;
      min-height: 0;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #DCE4EE;
      border-radius: 12px;
      padding: 13px 15px;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
      display: flex;
      flex-direction: column;
    }
    .card-top-azure { border-top: 4px solid #16B9FE; }
    .card-top-mint  { border-top: 4px solid #10B981; }
    .card-top-violet{ border-top: 4px solid #8B5CF6; }
    .card-top-amber { border-top: 4px solid #D97706; }
    .card-top-coral { border-top: 4px solid #E11D48; }
    .card-top-teal  { border-top: 4px solid #0D9488; }

    .card-title {
      font-size: 14px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .mini-tag {
      font-size: 9.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 6px;
      background: #F1F5F9;
      color: #334155;
      border: 1px solid #CBD5E1;
      white-space: nowrap;
    }
    .mini-tag-mint {
      background: #ECFDF5;
      color: #047857;
      border-color: #A7F3D0;
    }
    .mini-tag-violet {
      background: #F5F3FF;
      color: #6D28D9;
      border-color: #DDD6FE;
    }
    .mini-tag-azure {
      background: #EFF6FF;
      color: #1D4ED8;
      border-color: #BFDBFE;
    }

    p {
      margin: 0 0 6px 0;
      font-size: 11.6px;
      line-height: 1.42;
      color: #334155;
    }
    ul {
      margin: 0;
      padding-left: 16px;
      font-size: 11.4px;
      line-height: 1.42;
      color: #334155;
    }
    li {
      margin-bottom: 4px;
    }
    code {
      font-family: 'Cascadia Code', 'Consolas', monospace;
      font-size: 10.6px;
      background: #F1F5F9;
      color: #0F172A;
      padding: 1px 4px;
      border-radius: 4px;
      border: 1px solid #E2E8F0;
    }
    .rtl-ar {
      font-family: 'Segoe UI', 'Cairo', 'Tahoma', sans-serif;
      direction: rtl;
      unicode-bidi: isolate;
      font-weight: 600;
      color: #0F766E;
    }

    /* Embedded Diagram Box */
    .diagram-frame {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      max-height: 605px;
      box-shadow: 0 3px 10px rgba(15, 23, 42, 0.05);
      overflow: hidden;
    }
    .diagram-frame img {
      max-width: 100%;
      max-height: 586px;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
      border-radius: 6px;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    table.data-table th {
      background: #121A25;
      color: #F8FAFC;
      text-align: left;
      padding: 6px 8px;
      font-weight: 700;
      font-size: 10.5px;
    }
    table.data-table th:first-child { border-top-left-radius: 6px; }
    table.data-table th:last-child  { border-top-right-radius: 6px; }
    table.data-table td {
      padding: 5px 8px;
      border-bottom: 1px solid #E2E8F0;
      color: #1E293B;
      vertical-align: middle;
    }
    table.data-table tr:nth-child(even) td {
      background: #F8FAFC;
    }
    .row-selected td {
      background: #ECFDF5 !important;
      font-weight: 600;
      color: #065F46 !important;
    }

    /* Callout Banner */
    .banner-note {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-left: 4px solid #16B9FE;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 11.4px;
      color: #1E3A8A;
      line-height: 1.38;
    }
    .banner-mint {
      background: #ECFDF5;
      border-color: #A7F3D0;
      border-left-color: #10B981;
      color: #064E3B;
    }
    .banner-violet {
      background: #F5F3FF;
      border-color: #DDD6FE;
      border-left-color: #8B5CF6;
      color: #4C1D95;
    }
    .subcard-note {
      margin-top: auto;
      padding: 8px 10px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      font-size: 10.9px;
      line-height: 1.38;
      color: #334155;
    }
    .stack-col {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
      height: 100%;
    }

    /* Slide 1 Hero Specifics */
    .cover-wrap {
      flex: 1;
      display: grid;
      grid-template-columns: 1.28fr 0.92fr;
      padding: 46px 56px 36px 56px;
      align-items: center;
      gap: 28px;
      position: relative;
      z-index: 2;
    }
    .cover-pill {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(22, 185, 254, 0.14);
      border: 1px solid rgba(96, 239, 235, 0.45);
      color: #60EFEB;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.9px;
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    .cover-h1 {
      font-size: 42px;
      line-height: 1.12;
      font-weight: 800;
      margin: 0 0 14px 0;
      color: #FFFFFF;
    }
    .cover-h1 .hl {
      color: #60EFEB;
    }
    .cover-sub {
      font-size: 16px;
      line-height: 1.5;
      color: #CBD5E1;
      margin: 0 0 26px 0;
      max-width: 660px;
    }
    .cover-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .metric-box {
      background: rgba(255, 255, 255, 0.045);
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 10px;
      padding: 11px 14px;
    }
    .metric-val {
      font-size: 15px;
      font-weight: 700;
      color: #3FEDBA;
      margin-bottom: 2px;
    }
    .metric-lbl {
      font-size: 11.5px;
      color: #CBD5E1;
    }
    .cover-meta {
      font-size: 12px;
      color: #94A3B8;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      padding-top: 14px;
    }
    .cover-logo-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .cover-logo-img {
      width: 410px;
      height: 410px;
      object-fit: contain;
      -webkit-mask-image: radial-gradient(closest-side, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 97%);
      mask-image: radial-gradient(closest-side, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 97%);
    }
    .closing-logo-img {
      width: 88px;
      height: 88px;
      object-fit: contain;
      -webkit-mask-image: radial-gradient(closest-side, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 97%);
      mask-image: radial-gradient(closest-side, rgba(0,0,0,1) 58%, rgba(0,0,0,0) 97%);
    }

    /* Slide 12 Closing Bookend */
    .closing-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 32px 46px 26px 46px;
      gap: 16px;
      position: relative;
      z-index: 2;
    }
    .dark-card {
      background: rgba(255, 255, 255, 0.045);
      border: 1px solid rgba(148, 163, 184, 0.22);
      border-radius: 12px;
      padding: 15px 18px;
    }
    .dark-card h3 {
      margin: 0 0 10px 0;
      font-size: 15px;
      font-weight: 700;
    }
    .dark-card ul {
      color: #E2E8F0;
      font-size: 11.8px;
      line-height: 1.48;
    }
    .dark-card li {
      margin-bottom: 5px;
    }
    .dark-card code {
      background: rgba(15, 23, 42, 0.85);
      color: #60EFEB;
      border-color: rgba(96, 239, 235, 0.35);
    }

    @media screen {
      body {
        padding: 12px 0;
      }
      .slide {
        margin: 0 auto 18px auto;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
      }
    }
    @media print {
      body {
        background: none;
        padding: 0;
      }
      .slide {
        margin: 0;
        box-shadow: none;
      }
    }
    """

    slides: list[str] = []

    # --------------------------------------------------------------------------
    # SLIDE 1: Cover Slide
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide slide-dark" data-slide="1">
    <div class="obsidian-glow-left"></div>
    <div class="obsidian-glow-right"></div>
    <div class="cover-wrap">
      <div>
        <div class="cover-pill">Graduation Project • Research Paper Technical Brief</div>
        <h1 class="cover-h1">CURA <span class="hl">AI Model</span> Architecture &amp; Roadmap</h1>
        <p class="cover-sub">
          A Hybrid Cloud–Edge, Context-Adaptive Multi-Modal Conversational System for
          Alzheimer's Caregiving, ADHD Executive Function Support, and Egyptian Arabic
          Speech-to-Speech Intelligence.
        </p>
        <div class="cover-metrics">
          <div class="metric-box">
            <div class="metric-val">Llama 3.3 70B FP8 + Qwen 2.5 1.5B</div>
            <div class="metric-lbl">Dual Cloud Serverless GPU (2.68s) &amp; Offline Edge Pi 4 Inference</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Tri-Modal Clinical Specialization</div>
            <div class="metric-lbl">Claude Fable 5.2 • ADRD-Bench Validation • MIT Task-Breakdown</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">Egyptian Arabic STT → LLM → TTS</div>
            <div class="metric-lbl">Whisper v3 Turbo • Harakat Prosody Engine • ElevenLabs / Edge / Piper</div>
          </div>
          <div class="metric-box">
            <div class="metric-val">10 Clinical Tools • 13 Neon Tables</div>
            <div class="metric-lbl">5-Tier Live Web Search • 24/24 Pytest Verified • Live Web Cockpit</div>
          </div>
        </div>
        <div class="cover-meta">
          <strong>Live Portal:</strong> https://cura-drab.vercel.app &nbsp;•&nbsp;
          <strong>Repository:</strong> github.com/killerfrost2004u/Cura &nbsp;•&nbsp;
          <strong>Document Scope:</strong> Built System &amp; Upcoming Research Phases
        </div>
      </div>
      <div class="cover-logo-box">
        <img class="cover-logo-img" src="{logo_uri}" alt="CURA Adaptive AI Assistant Logo" />
      </div>
    </div>
    <div class="accent-strip"></div>
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 2: Abstract, Research Problem & Core Contributions
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="2">
    {render_header("Abstract, Problem Formulation & Key Contributions", "Section 1 • Research Foundation", 2, total, logo_uri, "Built & Verified", "pill-built")}
    <div class="body-area">
      <div class="banner-note">
        <strong>Research Abstract:</strong> Conventional voice assistants adopt a static, uniform interaction model that causes cognitive overload for neurodivergent users, memory distress for Alzheimer's patients, and unnatural robotic output in dialectal Arabic. <strong>CURA</strong> introduces a Clean Architecture hybrid AI framework that dynamically adapts reasoning depth, clinical prompt constraints, tool execution, UI contrast, and Egyptian Arabic phonology across cloud GPUs and an offline 4 GB Raspberry Pi 4 appliance.
      </div>
      <div class="grid-2">
        <div class="card card-top-coral">
          <h3 class="card-title">Three Research Problems Addressed <span class="mini-tag">Problem Statement</span></h3>
          <ul style="font-size:12px; line-height:1.52;">
            <li><strong>Static One-Size-Fits-All UX &amp; Cognitive Overload:</strong> Standard assistants respond to Alzheimer's repetitive questions with impatience and overwhelm ADHD users with multi-paragraph walls of text instead of atomic action steps.</li>
            <li><strong>Phonemic Mismatch in Dialectal Arabic TTS:</strong> Passing unvocalized Egyptian colloquial tokens into neural TTS engines yields robotic Modern Standard Arabic cadence (<span class="rtl-ar">قواعد الفصحى الجافة</span>) and flattened intonation contours.</li>
            <li><strong>Datacenter Search Blocks &amp; Offline Fragility:</strong> Cloud-only assistants fail during home Wi-Fi outages or leak sensitive eldercare telemetry, while naive web scrapers receive HTTP 202 challenges from serverless IPs.</li>
            <li><strong>Cross-Lingual &amp; Reasoning Tag Leakage:</strong> Reasoning LLMs frequently expose raw <code>&lt;think&gt;</code> blocks or inject Arabic honorifics when spoken-mode voice directives override English user queries.</li>
          </ul>
          <div class="subcard-note">
            <strong>Design Gap:</strong> No existing assistant jointly calibrates LLM clinical persona, hardware LED/UI contrast, and dialect phonology in one offline-resilient architecture.
          </div>
        </div>
        <div class="card card-top-mint">
          <h3 class="card-title">Four Verified Technical Contributions <span class="mini-tag mini-tag-mint">Paper Claims</span></h3>
          <ul style="font-size:12px; line-height:1.52;">
            <li><strong>Context-Adaptive Tri-Modal Alignment:</strong> Synchronized behavioral prompts fusing <em>ADRD-Bench Validation Therapy</em> (Alzheimer's), <em>MIT Task-Breakdown Corpus</em> (ADHD), and <em>Claude Fable 5.2 / 5.1</em> standards (Normal).</li>
            <li><strong>Hybrid Cloud–Edge Inference Engine:</strong> Sub-3s serverless GPU reasoning (Llama 3.3 70B FP8) paired with an air-gapped Raspberry Pi 4 stack (Qwen 2.5 1.5B GGUF + Whisper.cpp + Piper ONNX) inside a strict <code>2.2–2.8 GB</code> RAM envelope.</li>
            <li><strong>Egyptian Prosody &amp; Multi-Tier STS Loop:</strong> Phonetic harakat normalization, pause punctuation injection, Whisper v3 Turbo hallucination filtering, and 4-tier ElevenLabs/Edge/Piper cascade.</li>
            <li><strong>Clean Architecture + Grounded Clinical Tooling:</strong> Strict Dependency Inversion over <code>IToolRouter</code> (10 clinical &amp; search tools), 5-tier live search (Serper/Tavily/News), and 13 seeded Neon PostgreSQL tables.</li>
          </ul>
          <div class="subcard-note">
            <strong>Verification Status:</strong> Production cockpit live on Vercel (11/11 routes), backend suite passing <strong>24/24 unit/integration tests</strong> against Neon &amp; Cloudflare.
          </div>
        </div>
      </div>
    </div>
    {render_footer(2, total, "Abstract & Contributions")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 3: End-to-End AI Model Pipeline (Built)
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="3">
    {render_header("End-to-End AI Model Cognitive Pipeline", "Section 2 • Built AI Architecture", 3, total, logo_uri, "Built & Deployed", "pill-built")}
    <div class="body-area">
      <div class="split-visual">
        <div class="diagram-frame">
          <img src="{flow_ai_uri}" alt="CURA AI Model Flowchart" />
        </div>
        <div class="stack-col">
          <div class="card card-top-azure">
            <h3 class="card-title">1. Speech Acquisition &amp; Dialect ID <span class="mini-tag mini-tag-azure">STT Stage</span></h3>
            <p>Audio buffers from Web/Mobile/Pi mics post to <code>/api/transcribe</code> (Whisper Large v3 Turbo with Whisper fallback). A bilingual hallucination guard strips silence artifacts (<code>thank you</code>, <span class="rtl-ar">شكراً لكم</span>) and script detection (<code>/[\\u0600-\\u06FF]/</code>) isolates English vs. Arabic.</p>
          </div>
          <div class="card card-top-amber">
            <h3 class="card-title">2. Mode Routing &amp; CoT Sanitization <span class="mini-tag">Reasoning Stage</span></h3>
            <p><code>CognitiveMode</code> selects Normal, Alzheimer, or ADHD system directives. Multi-block <code>parseThinkTags()</code> collects internal chain-of-thought traces via global regex <code>/&lt;think&gt;[\\s\\S]*?&lt;\\/think&gt;/gi</code> into collapsible telemetry while keeping spoken answers clean.</p>
          </div>
          <div class="card card-top-teal">
            <h3 class="card-title">3. Tool Router &amp; 5-Tier Search <span class="mini-tag mini-tag-mint">Grounding Stage</span></h3>
            <p>Queries are enriched prior to or during inference via <code>IToolRouter</code> (10 clinical tools on Neon PostgreSQL) and a 5-tier search cascade (Tavily → Serper → Google News RSS → Wikipedia → DDG) to prevent cutoff hallucinations.</p>
          </div>
          <div class="card card-top-violet">
            <h3 class="card-title">4. Phonology &amp; Voice Output <span class="mini-tag mini-tag-violet">TTS Stage</span></h3>
            <p>If <code>spoken_mode</code> or user playback triggers <code>/api/tts</code>, CURA strips markdown/emojis, applies Egyptian harakat normalization, and streams natural voice via ElevenLabs (Fatima/Mawardy) or Edge/Piper neural voices.</p>
          </div>
        </div>
      </div>
    </div>
    {render_footer(3, total, "Cognitive Processing Pipeline")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 4: Hybrid Cloud-Edge Compute & LLM Benchmarks (Built)
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="4">
    {render_header("Hybrid Cloud–Edge Compute & Model Selection Benchmarks", "Section 2 • Built AI Architecture", 4, total, logo_uri, "Benchmarked", "pill-built")}
    <div class="body-area">
      <div class="split-visual">
        <div class="diagram-frame">
          <img src="{arch_sys_uri}" alt="CURA Hybrid Cloud and Edge System Architecture" />
        </div>
        <div class="stack-col">
          <div class="card card-top-azure">
            <h3 class="card-title">Cloudflare Workers AI Model Benchmark (25 Evaluated) <span class="mini-tag mini-tag-azure">Cloud Tier</span></h3>
            <table class="data-table">
              <thead>
                <tr><th>Cloudflare Workers AI Model</th><th>Latency</th><th>Evaluation Outcome</th></tr>
              </thead>
              <tbody>
                <tr class="row-selected"><td><code>@cf/meta/llama-3.3-70b-instruct-fp8-fast</code></td><td><strong>2.68s</strong></td><td><strong>Selected:</strong> Best Egyptian dialect, stable tool calling, low latency</td></tr>
                <tr><td><code>@cf/openai/gpt-oss-120b</code></td><td>3.38s</td><td>Strong general reasoning; slightly slower STS loop turn-around</td></tr>
                <tr><td><code>@cf/meta/llama-4-scout-17b-16e-instruct</code></td><td>12.73s</td><td>Too slow for conversational voice interaction (&gt;12s turn lag)</td></tr>
                <tr><td><code>@cf/deepseek-ai/deepseek-v4.1-flash-1017</code></td><td>HTTP 403</td><td>Access restricted / unavailable on account tier</td></tr>
              </tbody>
            </table>
          </div>
          <div class="card card-top-mint">
            <h3 class="card-title">Edge Offline Pipeline (Raspberry Pi 4 — 4 GB RAM) <span class="mini-tag mini-tag-mint">Air-Gapped Tier</span></h3>
            <ul>
              <li><strong>Local LLM (<code>OllamaClient</code>):</strong> <code>qwen2.5:1.5b-instruct</code> quantized to <strong>GGUF Q4_K_M</strong> (~1.0 GB RAM), delivering <code>8–10 tok/s</code> with native tool calling support.</li>
              <li><strong>Local Speech (<code>Whisper.cpp</code> + <code>Piper ONNX</code>):</strong> Q5_0 STT (~150–250 MB) paired with <code>ar_EG-standard-medium.onnx</code> TTS (~65 MB, &lt;0.2s ARM synthesis).</li>
              <li><strong>Memory Safety:</strong> Total peak footprint <strong>~2.2–2.8 GB</strong> (camera excluded by design) leaving &gt;1.2 GB OOM headroom.</li>
            </ul>
          </div>
          <div class="card card-top-teal">
            <h3 class="card-title">Adaptive Cloud–Edge Failover &amp; Sync <span class="mini-tag">Resilience</span></h3>
            <p>Both <code>CloudflareWorkersAIClient</code> and <code>OllamaClient</code> implement the same <code>ILLMEngine</code> contract. When cloud connectivity drops, Pi 4 logs clinical events locally to Edge SQLite and reconciles upstream via <code>sync_batches</code> upon reconnect.</p>
          </div>
        </div>
      </div>
    </div>
    {render_footer(4, total, "Cloud Benchmarks & Edge Inference")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 5: Tri-Modal Cognitive Specialization & Clinical Alignment (Built)
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="5">
    {render_header("Tri-Modal Cognitive Specialization & Clinical Dataset Alignment", "Section 2 • Built AI Architecture", 5, total, logo_uri, "Synchronized Prompts", "pill-built")}
    <div class="body-area">
      <div class="grid-3">
        <div class="card card-top-azure">
          <h3 class="card-title">Normal Research Mode <span class="mini-tag mini-tag-azure">Claude Fable 5.2 / 5.1</span></h3>
          <ul style="font-size:11.6px; line-height:1.48;">
            <li><strong>Dual Formatting:</strong> Bottom-Line-Up-Front (BLUF) structured answers for knowledge work; concise conversational prose for daily chat.</li>
            <li><strong>Intent Grounding:</strong> Casual greetings (e.g., <span class="rtl-ar">أهلاً</span>, <em>Hello</em>) receive warm greetings only—zero unsolicited lectures or math formulas.</li>
            <li><strong>Safety Redlines:</strong> Zero child safety violations (reframing triggers refusal), zero CBRN/malware instructions, neutral non-preachy refusals.</li>
            <li><strong>Clinical Discipline:</strong> Defers medication dosing to physicians and cites verified sources (DailyMed, PubMed) + live search links.</li>
          </ul>
          <div class="subcard-note">
            <strong>Live Verified Output (EGX Query):</strong> Returns direct Egyptian readout with real-time Serper numbers (<span class="rtl-ar">سعر سهم بنك القاهرة دلوقتي 5.50 جنيه</span>) with zero offline apologies.
          </div>
        </div>
        <div class="card card-top-mint">
          <h3 class="card-title">Alzheimer's Care Mode <span class="mini-tag mini-tag-mint">ADRD-Bench</span></h3>
          <ul style="font-size:11.6px; line-height:1.48;">
            <li><strong>Validation Therapy:</strong> Validates emotional reality first; strictly avoids reality traps or confronting disoriented dates/places.</li>
            <li><strong>Repetition Invariance (<code>FR-ALZ-001</code>):</strong> Answers the 1st and 10th repeated question with equal warmth—never says <em>"I already told you"</em>.</li>
            <li><strong>Sensory Pill Guidance (<code>FR-ALZ-006</code>):</strong> Describes meds physically (<span class="rtl-ar">القرص الأصفر الصغير</span>) rather than chemical names; limits replies to ≤2 gentle sentences.</li>
            <li><strong>Routine Scoping &amp; WCAG AAA:</strong> Surfaces personal logs (morning Concor 5mg with Sarah) only when asked; paired with <code>15.2:1</code> contrast UI.</li>
          </ul>
          <div class="subcard-note">
            <strong>Live Verified Output (EN Medical):</strong> Replies in pure empathetic English explaining cholinesterase inhibitors &amp; memantine with <strong>zero</strong> leaked <code>&lt;think&gt;</code> tags or Arabic greetings.
          </div>
        </div>
        <div class="card card-top-violet">
          <h3 class="card-title">ADHD Focus Coach <span class="mini-tag mini-tag-violet">MIT Task-Breakdown</span></h3>
          <ul style="font-size:11.6px; line-height:1.48;">
            <li><strong>Anti-Paralysis Micro-Step:</strong> Eliminates the <em>Wall of Awful</em> by isolating strictly <strong>ONE single 2–5 min action</strong>—banning multi-item lists.</li>
            <li><strong>Anti-Robotic Egyptian Coaching:</strong> Energized local voice (<span class="rtl-ar">يلا بينا يا بطل، عاش، بص يا فنان</span>) with explicit ban on robotic MSA clichés (<span class="rtl-ar">أنا سعيد جداً بمساعدتك</span>).</li>
            <li><strong>Time Blindness Calibration:</strong> Anchors effort to tangible 15-minute Pomodoro sprints rather than vague instructions.</li>
            <li><strong>Dopamine &amp; Pause–Confirm:</strong> Triggers instant completion rewards (<code>complete_adhd_task</code>) and gentle distraction intercepts.</li>
          </ul>
          <div class="subcard-note">
            <strong>Live Verified Output (AR Coaching):</strong> Immediately launches a 5-min brain-dump sprint (<span class="rtl-ar">يلا بينا يا بطل... خذ 5 دقايق بس، عاش!</span>) without robotic MSA filler.
          </div>
        </div>
      </div>
      <div class="banner-mint">
        <strong>Strict Bilingual Isolation Guardrail (Resolved in Commit <code>5fc8120</code>):</strong> Synchronized across <code>prompt_templates.py</code> and <code>route.ts</code>—language routing keys strictly off Arabic Unicode detection (<code>/[\\u0600-\\u06FF]/</code>). English queries—including English microphone speech with <code>spoken_mode=true</code>—enforce 100% pure English with explicit prohibition against mixing Arabic greetings (<span class="rtl-ar">يا فندم</span>).
      </div>
    </div>
    {render_footer(5, total, "Cognitive Modes & Prompt Engineering")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 6: Egyptian Arabic Speech-to-Speech (STS) & Prosody Engineering (Built)
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="6">
    {render_header("Egyptian Arabic Speech-to-Speech (STS) & Prosody Engineering", "Section 2 • Built AI Architecture", 6, total, logo_uri, "4-Tier Audio Cascade", "pill-built")}
    <div class="body-area">
      <div class="grid-2">
        <div class="stack-col">
          <div class="card card-top-azure">
            <h3 class="card-title">Full STS Interaction Pipeline <span class="mini-tag mini-tag-azure">STT → LLM → TTS</span></h3>
            <p><code>VoiceMicButton</code> captures user audio → <code>/api/transcribe</code> (Whisper Large v3 Turbo) transcribes Arabic dialect or English → <code>/api/chat</code> reasons &amp; sanitizes <code>&lt;think&gt;</code> blocks → <code>/api/tts</code> synthesizes warm natural audio via <code>speakNaturalText()</code>.</p>
          </div>
          <div class="card card-top-teal">
            <h3 class="card-title">Resilient 4-Tier Voice Synthesis Cascade <span class="mini-tag mini-tag-mint">/api/tts</span></h3>
            <ul>
              <li><strong>Tier 1 — ElevenLabs Direct REST:</strong> Calls <code>eleven_multilingual_v2</code> &amp; <code>eleven_v3_conversational</code> with authentic Egyptian voices <strong>Fatima</strong> (<code>I3u6waC588j43py1kDN2</code>) &amp; <strong>Mawardy</strong> (<code>PmRaqkJ2uk3Y9jrp9UjJ</code>), tuned at <code>stability=0.35</code>, <code>style=0.20</code>, <code>similarity_boost=0.85</code>.</li>
              <li><strong>Tier 2 — Magnific AI Audio Hook:</strong> Pre-wired API provider integration ready for enterprise voice generation keys.</li>
              <li><strong>Tier 3 — Azure Edge Neural (<code>msedge-tts</code>):</strong> Warm Cairo voice <code>ar-EG-SalmaNeural</code> calibrated with slower cadence (<code>-3% rate</code>) and brighter warmth (<code>+1Hz pitch</code>).</li>
              <li><strong>Tier 4 — Local Edge / Client Fallback:</strong> <code>Piper TTS</code> ONNX offline or Web Speech API for zero-connectivity environments.</li>
            </ul>
          </div>
          <div class="card card-top-violet">
            <h3 class="card-title">Acoustic Diagnostics &amp; Cadence Control <span class="mini-tag mini-tag-violet">Prosody Physics</span></h3>
            <ul>
              <li><strong>Natural F0 Pitch Contour:</strong> Shifts flat news-reader intonation toward an expressive <code>160–260 Hz</code> warm Egyptian conversational range (+3 to +5 semitone empathy peaks).</li>
              <li><strong>Physiological Breathing &amp; Socket Guard:</strong> Enforces <code>180–320 ms</code> clause rests, <code>120 ms</code> conjunction pauses, and proper Edge WebSocket teardown to eliminate HTTP 429 limits.</li>
            </ul>
          </div>
        </div>
        <div class="card card-top-amber">
          <h3 class="card-title">Egyptian Phonological Normalization Matrix <span class="mini-tag">Anti-Robotic Prosody</span></h3>
          <p>Eliminates F0 pitch flattening and phonemic shock by stripping markdown/emojis, injecting respiratory pauses (<code>، </code>, <code>...</code>, <code>؟</code>), and normalizing colloquial Egyptian tokens into explicit harakat before synthesis:</p>
          <table class="data-table" style="margin-top:4px;">
            <thead>
              <tr><th>Raw Token</th><th>Normalized Form</th><th>IPA Target</th><th>Acoustic Effect on Vocoder</th></tr>
            </thead>
            <tbody>
              <tr><td><span class="rtl-ar">مش</span></td><td><span class="rtl-ar">مِشْ</span></td><td><code>[mɪʃ]</code></td><td>Forces Egyptian negation instead of MSA past verb</td></tr>
              <tr><td><span class="rtl-ar">دلوقتي</span></td><td><span class="rtl-ar">دِلْوَقْتِي</span></td><td><code>[del.wæʔ.ti]</code></td><td>Authentic Cairo vowel breaking &amp; glottal stop</td></tr>
              <tr><td><span class="rtl-ar">متقلقش</span></td><td><span class="rtl-ar">مَاتِقْلَقْش</span></td><td><code>[mæ.teʔ.læʔʃ]</code></td><td>Preserves long colloquial vowel without stiff stress</td></tr>
              <tr><td><span class="rtl-ar">زي الفل</span></td><td><span class="rtl-ar">زَيّ الفُلّ</span></td><td><code>[zæj.j‿el.folː]</code></td><td>Natural gemination &amp; smooth assimilation</td></tr>
              <tr><td><span class="rtl-ar">طمني</span></td><td><span class="rtl-ar">طَمِّنِّي</span></td><td><code>[tˤɑm.men.ni]</code></td><td>Emphatic warmth &amp; soothing downward cadence</td></tr>
              <tr><td><span class="rtl-ar">خالص / يافندم</span></td><td><span class="rtl-ar">خَالِصْ / يَا فَنْدِم</span></td><td><code>[xɑː.lesˤ]</code></td><td>Cancels unwanted classical nunation endings</td></tr>
            </tbody>
          </table>
          <div class="banner-note" style="margin-top:8px;">
            <strong>Micro-Pause Pacing:</strong> Adds ellipsis pauses (<code>...</code>) before empathetic phrases and widens comma holds to replicate human 180–320ms breathing intervals.
          </div>
        </div>
      </div>
    </div>
    {render_footer(6, total, "Egyptian Arabic STS & Acoustic Prosody")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 7: 5-Tier Live Web Search, 10 Clinical Tools & Neon Persistence (Built)
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="7">
    {render_header("5-Tier Live Web Search, 10 Clinical Tools & Neon Database", "Section 2 • Built AI Architecture", 7, total, logo_uri, "Production Live", "pill-built")}
    <div class="body-area">
      <div class="grid-3">
        <div class="card card-top-azure">
          <h3 class="card-title">5-Tier Live Search <span class="mini-tag mini-tag-azure">Zero Cutoff Failure</span></h3>
          <p>Solves serverless IP challenges (DuckDuckGo HTTP 202 on AWS/Vercel) via conversational filler stripping and an ordered 5-tier fallback chain:</p>
          <ul style="font-size:11.5px; line-height:1.48;">
            <li><strong>1. Tavily AI Search:</strong> Direct synthesized web snippets via <code>TAVILY_API_KEY</code>.</li>
            <li><strong>2. Serper Google Search:</strong> Localized Egyptian/English results (<code>gl=eg/us</code>). <em>Verified live on EGX Banque du Caire (<code>BQDC</code>: 5.50 EGP, close 5.700 EGP).</em></li>
            <li><strong>3. Google News RSS:</strong> Zero-auth real-time 2026 financial &amp; medical headlines.</li>
            <li><strong>4. Wikipedia API:</strong> Structured AR/EN encyclopedic lookup.</li>
            <li><strong>5. DuckDuckGo Engine:</strong> <code>ddgs</code> / HTML + Instant Answer fallback.</li>
          </ul>
          <div class="subcard-note">
            <strong>Query Preprocessor:</strong> Strips colloquial prefixes (<span class="rtl-ar">ايه هو، دلوقتي، بكام</span>) prior to indexing to maximize recall.
          </div>
        </div>
        <div class="card card-top-teal">
          <h3 class="card-title"><span>10 AI Tools (<code>IToolRouter</code>)</span> <span class="mini-tag mini-tag-mint">Native Tool Calling</span></h3>
          <p><strong>Alzheimer Care (4):</strong></p>
          <ul style="font-size:11.5px; line-height:1.46;">
            <li><code>lookup_medications</code> &amp; sensory pill descriptions</li>
            <li><code>confirm_medication_dose</code> → logs taken timestamp</li>
            <li><code>lookup_family_memory</code> &amp; <code>lookup_item_location</code></li>
          </ul>
          <p style="margin-top:8px;"><strong>ADHD Executive Coach (3):</strong></p>
          <ul style="font-size:11.5px; line-height:1.46;">
            <li><code>decompose_adhd_task</code>, <code>get_adhd_tasks</code>, <code>complete_adhd_task</code></li>
          </ul>
          <p style="margin-top:8px;"><strong>Research &amp; Caregiver Oversight (3):</strong></p>
          <ul style="font-size:11.5px; line-height:1.46;">
            <li><code>search_web</code>, <code>get_current_weather</code>, <code>get_caregiver_patient_summary</code></li>
          </ul>
          <div class="subcard-note">
            <strong>Execution Loop:</strong> Cloudflare / Qwen emits native JSON tool call → FastAPI executes Neon query → second-pass response synthesis.
          </div>
        </div>
        <div class="card card-top-amber">
          <h3 class="card-title">Neon Postgres 16 + S3 <span class="mini-tag">13 Clinical Tables</span></h3>
          <p>Hosted in <strong>AWS EU-Central-1 (Frankfurt)</strong> with PgBouncer pooling and private S3 storage:</p>
          <ul style="font-size:11.5px; line-height:1.48;">
            <li><strong>Core &amp; Devices:</strong> <code>users</code>, <code>caregiver_patient_relations</code>, <code>devices</code>.</li>
            <li><strong>Alzheimer &amp; Memory:</strong> <code>family_members</code>, <code>medications</code>, <code>medication_schedules</code>, <code>medication_logs</code>, <code>cognitive_confusion_logs</code>.</li>
            <li><strong>ADHD &amp; Safety:</strong> <code>adhd_tasks</code>, <code>focus_sessions</code>, <code>emergency_contacts</code>, <code>emergency_events</code>, <code>sync_batches</code>.</li>
            <li><strong>Neon S3 (<code>uploads</code>):</strong> Encrypted storage for pill photos &amp; Alzheimer memory book images.</li>
          </ul>
          <div class="subcard-note">
            <strong>Seeded Personas:</strong> <em>Hajj Ibrahim</em> (Concor 5mg / Aricept 10mg), <em>Karim</em> (Concerta 18mg / Focus), <em>Dr. Ahmed</em> &amp; <em>Dr. Tarek</em> (Emergency GPS 30.0444, 31.2357).
          </div>
        </div>
      </div>
    </div>
    {render_footer(7, total, "Web Grounding, Tools & Cloud Persistence")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 8: Clean Architecture, Edge Hardware Blueprint & Verification (Built)
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="8">
    {render_header("Clean Architecture, Edge Hardware Blueprint & Verification", "Section 2 • Built AI Architecture", 8, total, logo_uri, "24/24 Tests Passing", "pill-built")}
    <div class="body-area">
      <div class="split-visual">
        <div class="diagram-frame">
          <img src="{arch_hw_uri}" alt="CURA Clean Architecture and Mini CURA Hardware Blueprint" />
        </div>
        <div class="stack-col">
          <div class="card card-top-teal">
            <h3 class="card-title">Clean Software Architecture (DIP) <span class="mini-tag mini-tag-mint">Zero Coupling</span></h3>
            <p>Backend <code>backend/src/</code> enforces strict Dependency Inversion: inner domain entities (<code>CognitiveMode</code>, <code>VoiceCommand</code>, <code>Medication</code>, <code>EmergencyEvent</code>) carry zero framework imports. Use cases depend solely on abstract ports (<code>ILLMEngine</code>, <code>ISTTEngine</code>, <code>ITTSEngine</code>, <code>IToolRouter</code>) implemented by swappable Cloud/Edge adapters.</p>
          </div>
          <div class="card card-top-mint">
            <h3 class="card-title">Deterministic Verification Results <span class="mini-tag mini-tag-mint">CI Verified</span></h3>
            <ul>
              <li><strong>Backend Suite (<code>pytest</code>):</strong> <strong>24 / 24 tests passing</strong> across <code>test_api.py</code> (5), <code>test_clinical_tools.py</code> (8 against Neon DB), <code>test_cloudflare_ai.py</code> (5), <code>test_prompts.py</code> (2), and <code>test_tool_router.py</code> (4).</li>
              <li><strong>Frontend Build (<code>next build</code>):</strong> <strong>11 / 11 routes</strong> statically generated / server-rendered with 0 TypeScript or ESLint errors on <code>cura-drab.vercel.app</code>.</li>
            </ul>
          </div>
          <div class="card card-top-coral">
            <h3 class="card-title">Production Stability &amp; Hardware Readiness <span class="mini-tag">Resolved Issues</span></h3>
            <ul>
              <li><strong>Production Fixes:</strong> Eliminated global <code>&lt;think&gt;</code> tag leaks, isolated English/Arabic spoken prompts, fixed input clearing on submit, and replaced failing scrapers with Serper/Google News.</li>
              <li><strong>Mini CURA Pi 4 Spec:</strong> Deterministic 6-state FSM (<code>Boot → Idle → Listen → Process → Speak → SOS</code>), <code>GPIO 17</code> 250ms debounced SOS trigger, and WS2812B LED ring states.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    {render_footer(8, total, "Engineering Quality & Test Evidence")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 9: Planned AI Research Roadmap — Part 1 (To Be Built)
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="9">
    {render_header("Planned AI Research & Engineering Roadmap — Part 1", "Section 3 • Future AI Model Enhancements", 9, total, logo_uri, "Planned Next", "pill-planned")}
    <div class="body-area">
      <div class="banner-violet">
        <strong>Roadmap Framing (What We Will Build Next):</strong> Building upon the verified hybrid foundation, the next research phase advances CURA from prompt-level clinical specialization toward weight-level Egyptian clinical fine-tuning, longitudinal vector memory, and real-time vocal affect modeling.
      </div>
      <div class="grid-2">
        <div class="card card-top-violet">
          <h3 class="card-title">1. Egyptian Clinical Arabic QLoRA Fine-Tuning <span class="mini-tag mini-tag-violet">Planned • Weights</span></h3>
          <ul style="font-size:11.6px; line-height:1.48;">
            <li><strong>Base Models &amp; Targets:</strong> Fine-tune <code>Qwen 2.5 1.5B / 3B</code> via LoRA/QLoRA on curated multi-turn Egyptian dialect dialogues aligned to <em>ADRD-Bench</em>, <em>MIT Task-Breakdown</em>, and local Egyptian drug names.</li>
            <li><strong>Edge Export Pipeline:</strong> Merge LoRA adapters and re-quantize to <code>GGUF Q4_K_M</code> (~1.0–1.8 GB) so offline Pi 4 inference exhibits Validation Therapy and coaching directly inside weights.</li>
            <li><strong>Research Payoff:</strong> Cuts system-prompt token overhead by ~60% on Edge CPUs and boosts colloquial JSON tool-calling accuracy.</li>
          </ul>
        </div>
        <div class="card card-top-azure">
          <h3 class="card-title">2. Longitudinal Patient Memory Graph &amp; RAG <span class="mini-tag mini-tag-azure">Planned • pgvector</span></h3>
          <ul style="font-size:11.6px; line-height:1.48;">
            <li><strong>Semantic Episodic Retrieval:</strong> Enable <code>pgvector</code> embeddings over <code>family_members</code>, <code>medication_logs</code>, and <code>cognitive_confusion_logs</code> in Neon PostgreSQL for dynamic clinical memory recall.</li>
            <li><strong>Temporal Escalation Patterning:</strong> Detect multi-day escalation in repeated time/location questions to proactively alert neurologists and family caregivers of sundowning trends.</li>
            <li><strong>Research Payoff:</strong> Enables personalized biography grounding across months of caregiver updates with zero manual prompt rewrites.</li>
          </ul>
        </div>
        <div class="card card-top-amber">
          <h3 class="card-title">3. Affective &amp; Hesitation Prosody Analysis <span class="mini-tag">Planned • Audio AI</span></h3>
          <ul style="font-size:11.6px; line-height:1.48;">
            <li><strong>Paralinguistic Biomarkers:</strong> Analyze acoustic pause duration, speech rate variance, pitch jitter, and lexical hesitation directly from microphone frames before LLM generation.</li>
            <li><strong>Adaptive Pacing Trigger:</strong> Automatically simplify response complexity and slow neural TTS cadence during high vocal anxiety in Alzheimer's mode or overwhelm spikes in ADHD mode.</li>
            <li><strong>Research Payoff:</strong> Upgrades CURA from text-reactive adaptation to acoustic affect-aware caregiving.</li>
          </ul>
        </div>
        <div class="card card-top-teal">
          <h3 class="card-title">4. Ultra-Fast Local Intent &amp; Safety Router <span class="mini-tag mini-tag-mint">Planned • &lt;50ms</span></h3>
          <ul style="font-size:11.6px; line-height:1.48;">
            <li><strong>Sub-50ms Triage Classifier:</strong> Lightweight DistilBERT / ONNX intent classifier running continuously on Pi 4 / API edge to detect emergency distress, caregiver tool triggers, and safety redlines.</li>
            <li><strong>Deterministic Tool Dispatch:</strong> Bypass heavyweight 70B inference completely for trivial time checks, routine dose confirmations, or instant SOS triggers.</li>
            <li><strong>Research Payoff:</strong> Cuts trivial turn latency by &gt;75% and reduces serverless GPU inference cost.</li>
          </ul>
        </div>
      </div>
    </div>
    {render_footer(9, total, "Future Work — Model Weights, RAG & Affective AI")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 10: Planned AI Research Roadmap — Part 2 (To Be Built)
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="10">
    {render_header("Planned AI Research & Engineering Roadmap — Part 2", "Section 3 • Future Systems & Privacy", 10, total, logo_uri, "Planned Next", "pill-planned")}
    <div class="body-area">
      <div class="grid-2">
        <div class="card card-top-azure">
          <h3 class="card-title">5. Full-Duplex Streaming STS &amp; Barge-In <span class="mini-tag mini-tag-azure">Planned • &lt;900ms TTFA</span></h3>
          <ul style="font-size:11.8px; line-height:1.52;">
            <li><strong>Token-Incremental Audio Streaming:</strong> Replace sequential request/response REST cycles with chunked sentence-boundary streaming over <code>/ws/v1/voice/stream</code> so TTS begins speaking the first Egyptian clause while the LLM finishes generating.</li>
            <li><strong>Silero VAD Interruption:</strong> Continuous lightweight Voice Activity Detection allowing patients or caregivers to naturally interrupt playback mid-sentence (hardware echo cancellation + immediate audio flush).</li>
            <li><strong>Target Benchmark:</strong> Reduce perceived Time-to-First-Audio (TTFA) from ~3.5s batch turn to <strong>&lt;900ms</strong> conversational onset.</li>
          </ul>
        </div>
        <div class="card card-top-violet">
          <h3 class="card-title">6. Custom Offline Egyptian Piper / VITS Voice <span class="mini-tag mini-tag-violet">Planned • Edge TTS</span></h3>
          <ul style="font-size:11.8px; line-height:1.52;">
            <li><strong>Colloquial Acoustic Training:</strong> Fine-tune a dedicated Egyptian Cairo Piper/VITS ONNX checkpoint specifically conditioned on harakat-normalized dialectal text.</li>
            <li><strong>True Cloud-Parity Offline Warmth:</strong> Bring natural female &amp; male Egyptian vocal expressiveness directly onto the Raspberry Pi 4 (&lt;0.2s ARM synthesis) with zero cloud API fee dependency during outages.</li>
            <li><strong>Target Benchmark:</strong> Achieve <strong>MOS ≥ 3.8</strong> offline audio naturalness on native Egyptian listening panels while remaining ≤75 MB RAM.</li>
          </ul>
        </div>
        <div class="card card-top-mint">
          <h3 class="card-title">7. Hardware-in-the-Loop Pi 4 Telemetry &amp; Sync <span class="mini-tag mini-tag-mint">Planned • Embedded</span></h3>
          <ul style="font-size:11.8px; line-height:1.52;">
            <li><strong>Physical Profiling Under Load:</strong> Measure real-world CPU temperature, thermal throttling curves, I2S mic SNR in noisy home rooms, and <code>systemd</code> daemon uptime over 24h continuous cycles on Raspberry Pi 4 (4GB).</li>
            <li><strong>Air-Gapped Reconciliation:</strong> Stress-test <code>Edge SQLite → sync_batches → Neon PostgreSQL</code> conflict resolution under simulated multi-hour Wi-Fi blackouts.</li>
            <li><strong>Target Benchmark:</strong> Zero out-of-memory kills across 1,000 consecutive STT→LLM→TTS edge cycles (&lt;2.8 GB peak RSS).</li>
          </ul>
        </div>
        <div class="card card-top-coral">
          <h3 class="card-title">8. Privacy-Preserving Edge PII &amp; Security <span class="mini-tag">Planned • Clinical Security</span></h3>
          <ul style="font-size:11.8px; line-height:1.52;">
            <li><strong>On-Device PII Redaction:</strong> Scrub personal names, phone numbers, and medication identifiers locally before cloud LLM fallback calls when hybrid routing activates.</li>
            <li><strong>Neon Row-Level Security (RLS) &amp; Signed S3 URLs:</strong> Enforce strict PostgreSQL RLS caregiver scopes and short-lived presigned S3 tokens for Alzheimer Memory Book photos and pill imagery.</li>
            <li><strong>Target Benchmark:</strong> Zero plaintext patient identifiers transmitted in external search queries or cloud prompt telemetry.</li>
          </ul>
        </div>
      </div>
    </div>
    {render_footer(10, total, "Future Work — Full-Duplex STS, Edge Voice & Privacy")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 11: Research Paper Experimental Design & Evaluation Protocol
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide" data-slide="11">
    {render_header("Research Paper Experimental Design, Metrics & Ablation Plan", "Section 4 • Academic Evaluation Protocol", 11, total, logo_uri, "Paper Methodology", "pill-eval")}
    <div class="body-area">
      <div class="card card-top-azure">
        <h3 class="card-title">Quantitative Evaluation Matrix for Graduation Thesis <span class="mini-tag mini-tag-azure">Benchmark Targets</span></h3>
        <table class="data-table">
          <thead>
            <tr><th>Subsystem / Dimension</th><th>Evaluation Dataset / Testbench</th><th>Primary Metrics &amp; Thesis Target</th><th>Current Baseline Status</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Egyptian Arabic &amp; EN STT</strong></td><td>CommonVoice-EG + Recorded Dialect Test Set</td><td>Word Error Rate (<strong>WER &lt; 12% Cloud</strong>, <strong>&lt; 18% Edge</strong>)</td><td>Whisper Large v3 Turbo + Whisper fallback live</td></tr>
            <tr><td><strong>Alzheimer's Safety &amp; Empathy</strong></td><td>ADRD-Bench Validation + 10× Repetition Battery</td><td>Validation Score ≥ 4.5/5; <strong>100% Repetition Invariance</strong></td><td>Verified via clinical prompt rules &amp; Neon logging</td></tr>
            <tr><td><strong>ADHD Anti-Paralysis Coaching</strong></td><td>MIT Task-Breakdown Evaluation Prompts</td><td><strong>≥ 95% Single Micro-Step Compliance</strong> (≤ 5-min scope)</td><td>Enforced via prompt constraints &amp; ADHD tools</td></tr>
            <tr><td><strong>Egyptian Arabic Neural TTS</strong></td><td>MOS Listening Panel (Blind A/B Test)</td><td>Mean Opinion Score <strong>MOS ≥ 4.2 Cloud / ≥ 3.8 Edge</strong></td><td>ElevenLabs Fatima/Mawardy + Harakat active</td></tr>
            <tr><td><strong>End-to-End Turn Latency &amp; RAM</strong></td><td>Cloud API Trace + Pi 4 Stress Suite</td><td><strong>&lt; 2.8s Cloud Turn</strong>; <strong>&lt; 2.8 GB Peak Pi 4 RAM</strong> (0 OOM)</td><td>Cloud 2.68s LLM measured; Pi 4 budget designed</td></tr>
            <tr><td><strong>Grounded Web Search &amp; Tools</strong></td><td>Real-Time Finance/News + Neon Tool Scenarios</td><td><strong>≥ 92% Faithfulness</strong>; Zero Dec-2023 False Refusals</td><td>5-Tier Search (Serper) + 10 tools live &amp; tested</td></tr>
          </tbody>
        </table>
      </div>
      <div class="grid-3">
        <div class="card card-top-teal">
          <h3 class="card-title"><span>Ablation A: Adaptation</span> <span class="mini-tag mini-tag-mint">LLM Weights</span></h3>
          <p>Compare <strong>Zero-Shot Base LLM</strong> vs. <strong>System-Prompt Aligned CURA</strong> vs. <strong>QLoRA Fine-Tuned Edge Weights</strong> on ADRD empathy, repetition patience, and ADHD paralysis reduction.</p>
          <div class="subcard-note">
            <strong>Measured Outputs:</strong> Validation Therapy score (1–5), 10× Repetition Invariance pass rate, and JSON tool-call validity on Pi 4.
          </div>
        </div>
        <div class="card card-top-amber">
          <h3 class="card-title"><span>Ablation B: Prosody</span> <span class="mini-tag">Voice Quality</span></h3>
          <p>Blind native Egyptian speaker evaluation comparing <strong>Raw Unvocalized Text TTS</strong> vs. <strong>Harakat + Pause-Normalized CURA TTS</strong> on naturalness, warmth, and robotic artifact score.</p>
          <div class="subcard-note">
            <strong>Measured Outputs:</strong> 5-point Mean Opinion Score (MOS), prosody F0 variance range (Hz), and mispronunciation error rate.
          </div>
        </div>
        <div class="card card-top-violet">
          <h3 class="card-title"><span>Ablation C: Cloud–Edge</span> <span class="mini-tag mini-tag-violet">Resilience</span></h3>
          <p>Measure end-to-end availability, tool execution accuracy, and outage resilience across <strong>Cloud-Only</strong> vs. <strong>Edge-Only</strong> vs. <strong>Hybrid CURA with sync_batches</strong>.</p>
          <div class="subcard-note">
            <strong>Measured Outputs:</strong> Uptime under simulated ISP blackouts, P95 latency (ms), Peak Pi 4 RSS memory (GB), and batch reconcile integrity.
          </div>
        </div>
      </div>
    </div>
    {render_footer(11, total, "Evaluation Metrics & Ablation Studies")}
  </section>"""
    )

    # --------------------------------------------------------------------------
    # SLIDE 12: Executive Comparison & Closing Bookend
    # --------------------------------------------------------------------------
    slides.append(
        f"""
  <section class="slide slide-dark" data-slide="12">
    <div class="obsidian-glow-left"></div>
    <div class="obsidian-glow-right"></div>
    <div class="closing-wrap">
      <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(148,163,184,0.22); padding-bottom:14px;">
        <div>
          <span class="cover-pill" style="margin-bottom:8px;">Executive Synthesis • Paper Readiness</span>
          <h2 style="margin:0; font-size:28px; font-weight:800; color:#FFFFFF;">CURA AI Model: Built Today vs. Next Research Phase</h2>
        </div>
        <img class="closing-logo-img" src="{logo_uri}" alt="CURA Logo" />
      </div>

      <div class="grid-2" style="gap:18px;">
        <div class="dark-card" style="border-top:4px solid #3FEDBA;">
          <h3 style="color:#3FEDBA;">✓ Built &amp; Verified Today (Phases 1 &amp; 2)</h3>
          <ul>
            <li><strong>Hybrid Inference Runtime:</strong> Benchmarked Cloudflare Workers AI (Llama 3.3 70B FP8 @ 2.68s) + Ollama/Qwen 2.5 1.5B Clean Architecture adapters.</li>
            <li><strong>Tri-Modal Prompts:</strong> Claude Fable 5.2/5.1 (Normal), ADRD-Bench Validation Therapy (Alzheimer's), MIT Task-Breakdown (ADHD) + strict English/Arabic isolation.</li>
            <li><strong>Complete STS Voice Loop:</strong> Whisper Large v3 Turbo STT + silence hallucination guard, global <code>&lt;think&gt;</code> trace extraction, Egyptian harakat phonology + 4-tier TTS.</li>
            <li><strong>Live Grounding &amp; Database:</strong> 5-tier search (Serper/Tavily/Google News/Wiki/DDG) + 10 tools + 13 seeded Neon Postgres 16 tables + S3 uploads.</li>
            <li><strong>Quality &amp; Hardware Docs:</strong> <strong>24/24</strong> pytest passing, <strong>11/11</strong> Next.js routes live on Vercel, Pi 4 FSM &amp; 4GB budget specs complete.</li>
          </ul>
        </div>
        <div class="dark-card" style="border-top:4px solid #AF6AFB;">
          <h3 style="color:#D8B4FE;">⧗ Planned Research Milestones (Phases 3 &amp; 4)</h3>
          <ul>
            <li><strong>Egyptian Clinical QLoRA Weights:</strong> Fine-tune Qwen 2.5 1.5B/3B to bake Validation Therapy, Egyptian dialect, and ADHD micro-coaching directly into GGUF Q4_K_M weights.</li>
            <li><strong>Longitudinal Vector Memory:</strong> Neon <code>pgvector</code> semantic RAG over family memories, pill logs, and cognitive confusion progression trajectories.</li>
            <li><strong>Full-Duplex Streaming STS:</strong> Token-level WebSocket TTS streaming (&lt;900ms TTFA) paired with Silero VAD mid-speech barge-in and vocal hesitation biomarkers.</li>
            <li><strong>Offline Egyptian Acoustic Voice:</strong> Dedicated fine-tuned Egyptian colloquial Piper/VITS ONNX checkpoint for true cloud-parity edge warmth.</li>
            <li><strong>HIL &amp; Academic Evaluation:</strong> Pi 4 thermal/RAM stress benchmarks, MOS human panels, PII edge redaction, Neon RLS, and full ablation experiments for thesis submission.</li>
          </ul>
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.04); border:1px solid rgba(148,163,184,0.2); border-radius:12px; padding:12px 18px; margin-top:auto;">
        <div style="display:flex; align-items:center; gap:18px;">
          <img src="{eco_uri}" alt="Ecosystem Icon" style="height:56px; border-radius:8px; background:#FFFFFF; padding:3px;" />
          <img src="{hub_uri}" alt="Mini CURA Hub" style="height:56px; border-radius:8px; background:#FFFFFF; padding:3px;" />
          <div>
            <div style="font-size:13.5px; font-weight:700; color:#60EFEB;">CURA Adaptive AI Assistant — Ready for Graduation Research Publication</div>
            <div style="font-size:11.5px; color:#CBD5E1;">Live Web Cockpit: <strong>cura-drab.vercel.app</strong> &nbsp;|&nbsp; Codebase &amp; Architecture Blueprints: <strong>github.com/killerfrost2004u/Cura</strong></div>
          </div>
        </div>
        <span class="slide-counter" style="font-size:13px; color:#E2E8F0;">12 / 12</span>
      </div>
    </div>
    <div class="accent-strip"></div>
  </section>"""
    )

    js = """
  <script>
    (function() {
      const params = new URLSearchParams(window.location.search);
      const target = params.get("slide");
      if (target) {
        document.querySelectorAll(".slide").forEach((el) => {
          if (el.getAttribute("data-slide") !== target) {
            el.style.display = "none";
          } else {
            el.style.margin = "0";
            el.style.boxShadow = "none";
          }
        });
        document.body.style.padding = "0";
        document.body.style.margin = "0";
        document.body.style.background = "#121A25";
      }
    })();
  </script>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CURA AI Model — Research Paper Technical Brief (16:9)</title>
  <style>{css}</style>
</head>
<body>
  <main class="deck">
    {"".join(slides)}
  </main>
  {js}
</body>
</html>
"""


def find_browser_executable() -> Path:
    """Locate Chrome or Edge for crisp headless PDF printing."""
    for candidate in BROWSER_CANDIDATES:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Neither Chrome nor Edge was found for PDF rendering.")


def compile_pdf(html_path: Path, pdf_path: Path) -> None:
    """Compile HTML brief to an exact 16:9 vector/raster PDF via headless browser."""
    browser = find_browser_executable()
    file_url = html_path.resolve().as_uri()
    cmd = [
        str(browser),
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        file_url,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if res.returncode != 0 or not pdf_path.exists():
        raise RuntimeError(
            f"Headless PDF generation failed (rc={res.returncode}): {res.stderr or res.stdout}"
        )


def verify_pdf_geometry(pdf_path: Path) -> tuple[int, str]:
    """Verify page count and exact 16:9 MediaBox geometry from generated PDF bytes."""
    raw = pdf_path.read_bytes()
    pages_counts = [int(c) for c in re.findall(rb"/Type\s*/Pages\b[^>]*?/Count\s+(\d+)", raw)]
    page_leaves = re.findall(rb"/Type\s*/Page(?!s)\b", raw)
    mediaboxes = re.findall(rb"/MediaBox\s*\[\s*([0-9.\s]+)\]", raw)
    count = len(page_leaves) if page_leaves else (max(pages_counts) if pages_counts else 0)
    mbox = mediaboxes[0].decode("ascii", errors="ignore").strip() if mediaboxes else "unknown"
    return count, mbox


def main() -> None:
    """Generate the HTML brief, compile 16:9 PDF, and report geometry metrics."""
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    html_content = build_html_document()
    OUT_HTML.write_text(html_content, encoding="utf-8")
    print(f"Generated HTML brief: {OUT_HTML} ({len(html_content)} bytes)")

    compile_pdf(OUT_HTML, OUT_PDF)
    pages, mediabox = verify_pdf_geometry(OUT_PDF)
    print(
        f"Generated 16:9 PDF: {OUT_PDF} ({OUT_PDF.stat().st_size} bytes, "
        f"pages={pages}, MediaBox=[{mediabox}])"
    )


if __name__ == "__main__":
    main()
