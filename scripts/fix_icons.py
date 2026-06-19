import os
from PIL import Image

def fix_icon_file(filepath):
    print(f"Processing: {filepath}")
    img = Image.open(filepath).convert('RGBA')
    w, h = img.size
    cx, cy = w // 2, h // 2
    # Radius threshold: 90% of the half-width
    max_r = int(min(cx, cy) * 0.90)
    
    bg_color = (4, 29, 70, 255) # Dark blue background color from the icon itself
    pixels = img.load()
    
    modified = 0
    for x in range(w):
        for y in range(h):
            dx = x - cx
            dy = y - cy
            dist = (dx*dx + dy*dy) ** 0.5
            if dist > max_r:
                r, g, b, a = pixels[x, y]
                # If pixel is white-ish (R, G, B all > 240)
                if r > 240 and g > 240 and b > 240:
                    pixels[x, y] = bg_color
                    modified += 1
                    
    img.save(filepath, 'PNG')
    print(f"Done. Modified {modified} pixels.")

def main():
    res_dir = "D:/huyenTV/ElderTV/android/app/src/main/res"
    folders = [f for f in os.listdir(res_dir) if f.startswith("mipmap-")]
    
    for folder in folders:
        folder_path = os.path.join(res_dir, folder)
        for filename in ["ic_launcher.png", "ic_launcher_round.png"]:
            filepath = os.path.join(folder_path, filename)
            if os.path.exists(filepath):
                fix_icon_file(filepath)

if __name__ == "__main__":
    main()
