from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIRECTORY = PROJECT_ROOT / "public" / "assets" / "collaboration" / "niebla"
SOURCE_ROOT = Path(r"C:\Users\josea\Downloads\Tatoo")

ASSETS = {
    SOURCE_ROOT / "Para Anuncios" / "ChatGPT Image 17 jul 2026, 10_16_34.png": ("shirt-presentation.webp", 1800),
    SOURCE_ROOT / "Para Anuncios" / "ChatGPT Image 17 jul 2026, 10_16_11.png": ("poster-monochrome.webp", 1200),
    SOURCE_ROOT / "Para Anuncios" / "ChatGPT Image 17 jul 2026, 10_15_35.png": ("collector-cards.webp", 1800),
    SOURCE_ROOT / "Para Anuncios" / "ChatGPT Image 17 jul 2026, 10_16_03.png": ("poster-blue.webp", 1200),
    SOURCE_ROOT / "Para Anuncios" / "ChatGPT Image 17 jul 2026, 10_15_21.png": ("stickers.webp", 1800),
    SOURCE_ROOT / "Brutos" / "20260601_122919.jpg": ("original-sketch.webp", 1200),
    SOURCE_ROOT / "Brutos" / "1780335694540.png": ("original-render.webp", 1200),
    SOURCE_ROOT / "Para Imprenta" / "Diseño Frontal Camiseta.png": ("shirt-front.webp", 1000),
    SOURCE_ROOT / "Para Imprenta" / "SotakunCarta.png": ("card-sotakun.webp", 900),
    SOURCE_ROOT / "Para Imprenta" / "NieblaTatooCarta.png": ("card-niebla.webp", 900),
    SOURCE_ROOT / "Para Imprenta" / "Parte de atras camiseta.png": ("shirt-back.webp", 800),
    OUTPUT_DIRECTORY / "sleeve-logo-corrected.png": ("sleeve-logo-corrected.webp", 1000),
}


def optimize(source: Path, filename: str, max_width: int) -> None:
    if not source.exists():
        raise FileNotFoundError(source)
    with Image.open(source) as image:
        image.load()
        if image.width > max_width:
            height = round(image.height * max_width / image.width)
            image = image.resize((max_width, height), Image.Resampling.LANCZOS)
        mode = "RGBA" if "A" in image.getbands() else "RGB"
        image.convert(mode).save(OUTPUT_DIRECTORY / filename, "WEBP", quality=88, method=6)
        print(f"{filename}: {image.width}x{image.height}")


def main() -> None:
    OUTPUT_DIRECTORY.mkdir(parents=True, exist_ok=True)
    for source, (filename, max_width) in ASSETS.items():
        optimize(source, filename, max_width)


if __name__ == "__main__":
    main()
