"""
Generate all branding assets for Eleva Remote Desk from source SVG files.
Uses resvg-py for high-precision SVG rasterization and Pillow for multi-resolution ICO packaging.
"""

import os
import io
import resvg_py
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIMBOLO_SVG = os.path.join(BASE_DIR, "assets", "branding", "simbolo_eleva.svg")
LOGO_SVG = os.path.join(BASE_DIR, "assets", "branding", "logo_eleva.svg")
RES_DIR = os.path.join(BASE_DIR, "res")
FLUTTER_ASSETS_DIR = os.path.join(BASE_DIR, "flutter", "assets")
FLUTTER_WIN_RESOURCES = os.path.join(BASE_DIR, "flutter", "windows", "runner", "resources")

def rasterize_svg(svg_path: str, size: int) -> Image.Image:
    """Rasterize an SVG to a square PIL RGBA image of given size."""
    png_bytes = resvg_py.svg_to_bytes(svg_path=svg_path, width=size, height=size)
    return Image.open(io.BytesIO(png_bytes)).convert("RGBA")

def main():
    print("Generating Eleva Remote Desk branding assets...")
    os.makedirs(RES_DIR, exist_ok=True)
    os.makedirs(FLUTTER_ASSETS_DIR, exist_ok=True)
    os.makedirs(FLUTTER_WIN_RESOURCES, exist_ok=True)

    # 1. Rasterize Symbol at multiple resolutions
    sizes = [16, 32, 48, 64, 128, 256, 512]
    images = {}
    for sz in sizes:
        images[sz] = rasterize_svg(SIMBOLO_SVG, sz)
        print(f"  Rasterized symbol at {sz}x{sz}")

    # 2. Save PNG files in res/
    images[32].save(os.path.join(RES_DIR, "32x32.png"), format="PNG")
    images[64].save(os.path.join(RES_DIR, "64x64.png"), format="PNG")
    images[128].save(os.path.join(RES_DIR, "128x128.png"), format="PNG")
    images[256].save(os.path.join(RES_DIR, "128x128@2x.png"), format="PNG")
    images[512].save(os.path.join(RES_DIR, "icon.png"), format="PNG")
    images[512].save(os.path.join(RES_DIR, "mac-icon.png"), format="PNG")
    print("  Saved PNG assets in res/")

    # 3. Generate multi-resolution ICO for Windows application
    # Layers: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
    ico_path = os.path.join(RES_DIR, "icon.ico")
    app_icon_flutter = os.path.join(FLUTTER_WIN_RESOURCES, "app_icon.ico")
    ico_layers = [images[sz] for sz in [16, 32, 48, 64, 128, 256]]
    
    images[256].save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
        append_images=ico_layers[:-1]
    )
    images[256].save(
        app_icon_flutter,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
        append_images=ico_layers[:-1]
    )
    print(f"  Generated multi-resolution ICO: {ico_path} & {app_icon_flutter}")

    # 4. Generate Tray Icon (16x16, 32x32)
    tray_ico_path = os.path.join(RES_DIR, "tray-icon.ico")
    images[32].save(
        tray_ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32)],
        append_images=[images[16]]
    )
    print(f"  Generated Tray ICO: {tray_ico_path}")

    # 5. Copy & Optimize Vector SVGs
    with open(SIMBOLO_SVG, "r", encoding="utf-8") as f:
        simbolo_content = f.read()

    with open(os.path.join(FLUTTER_ASSETS_DIR, "icon.svg"), "w", encoding="utf-8") as f:
        f.write(simbolo_content)
    with open(os.path.join(RES_DIR, "logo.svg"), "w", encoding="utf-8") as f:
        f.write(simbolo_content)
    with open(os.path.join(RES_DIR, "scalable.svg"), "w", encoding="utf-8") as f:
        f.write(simbolo_content)
    print("  Copied symbol SVGs to res/ and flutter/assets/")

    # 6. Create optimized horizontal logo-header.svg with fitted viewBox
    # Exact bounding box in Logo Eleva is (79, 798, 2084, 1314)
    # Using viewBox="59 778 2045 556" with preserveAspectRatio
    with open(LOGO_SVG, "r", encoding="utf-8") as f:
        logo_content = f.read()

    # Adjust viewBox and dimensions
    header_svg = logo_content.replace(
        'viewBox="0 0 2160 2160"',
        'viewBox="59 778 2045 556"'
    ).replace(
        'width="2160px" height="2160px"',
        'width="1000px" height="272px"'
    )

    with open(os.path.join(RES_DIR, "logo-header.svg"), "w", encoding="utf-8") as f:
        f.write(header_svg)
    print("  Generated optimized horizontal res/logo-header.svg")

    print("\nAll Eleva Remote Desk branding assets generated successfully!")

if __name__ == "__main__":
    main()
