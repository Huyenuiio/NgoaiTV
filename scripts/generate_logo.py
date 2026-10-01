import os
from PIL import Image, ImageDraw, ImageFont

# Canvas dimensions (high-res for 3x retina displays)
width, height = 720, 140
img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Load fonts
font_path = "C:/Windows/Fonts/segoeuib.ttf"
if not os.path.exists(font_path):
    font_path = "C:/Windows/Fonts/arialbd.ttf"

font_main = ImageFont.truetype(font_path, 60)
font_tv = ImageFont.truetype(font_path, 42)

# Colors
gold = (255, 215, 0, 255)        # #FFD700
gold_dim = (212, 175, 55, 255)
white = (255, 255, 255, 255)
badge_bg = (255, 215, 0, 255)
badge_text = (18, 18, 20, 255)

# 1. Draw TV Icon on the left
# Antenna
draw.line([(60, 25), (42, 45)], fill=gold, width=4)
draw.line([(70, 25), (88, 45)], fill=gold, width=4)
draw.ellipse([(57, 21), (63, 27)], fill=gold)
draw.ellipse([(67, 21), (73, 27)], fill=gold)

# TV Outer Body
tv_box = [25, 45, 105, 115]
draw.rounded_rectangle(tv_box, radius=16, fill=(35, 35, 45, 255), outline=gold, width=4)

# TV Inner Screen
screen_box = [35, 55, 85, 105]
draw.rounded_rectangle(screen_box, radius=8, fill=(18, 18, 24, 255), outline=gold_dim, width=2)

# Play triangle inside TV screen
draw.polygon([(46, 68), (46, 92), (68, 80)], fill=gold)

# TV Knobs / Speaker dots
draw.ellipse([(92, 65), (98, 71)], fill=gold)
draw.ellipse([(92, 85), (98, 91)], fill=gold)

# 2. Draw "Grandmother" Text
text_x = 125
text_y = 40
draw.text((text_x, text_y), "Grandmother", font=font_main, fill=gold)

# 3. Draw "TV" Badge next to "Grandmother"
# Measure "Grandmother" width
text_bbox = draw.textbbox((text_x, text_y), "Grandmother", font=font_main)
gm_width = text_bbox[2] - text_bbox[0]

tv_badge_x = text_x + gm_width + 16
tv_badge_y = text_y + 8
tv_badge_w = 84
tv_badge_h = 54

draw.rounded_rectangle(
    [tv_badge_x, tv_badge_y, tv_badge_x + tv_badge_w, tv_badge_y + tv_badge_h],
    radius=12,
    fill=gold
)

# Text "TV" inside badge
tv_text_bbox = draw.textbbox((0, 0), "TV", font=font_tv)
tv_tw = tv_text_bbox[2] - tv_text_bbox[0]
tv_th = tv_text_bbox[3] - tv_text_bbox[1]

draw.text(
    (tv_badge_x + (tv_badge_w - tv_tw) / 2, tv_badge_y + (tv_badge_h - tv_th) / 2 - 4),
    "TV",
    font=font_tv,
    fill=badge_text
)

# Crop image tightly with padding
bbox = img.getbbox()
if bbox:
    padding = 10
    crop_box = (
        max(0, bbox[0] - padding),
        max(0, bbox[1] - padding),
        min(width, bbox[2] + padding),
        min(height, bbox[3] + padding)
    )
    img_cropped = img.crop(crop_box)
else:
    img_cropped = img

output_dir = r"d:\New folder (2)\ElderTV\assets"
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "logo.png")
img_cropped.save(output_path, "PNG")
print(f"Successfully generated transparent logo at: {output_path} (Size: {img_cropped.size})")
