import os
import re
import sys
from PIL import Image

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def get_sorted_images(dir_path):
    if not os.path.exists(dir_path):
        return []
    valid_exts = ('.jpg', '.jpeg', '.png', '.webp')
    files = [f for f in os.listdir(dir_path) if f.lower().endswith(valid_exts)]
    return sorted(files, key=natural_sort_key)

def is_duplicate(img1, img2, threshold=1.5):
    # Resize both to small comparison size
    i1 = img1.convert('RGB').resize((160, 90))
    i2 = img2.convert('RGB').resize((160, 90))
    d1 = list(i1.getdata())
    d2 = list(i2.getdata())
    total_diff = sum(abs(p1[0]-p2[0]) + abs(p1[1]-p2[1]) + abs(p1[2]-p2[2]) for p1, p2 in zip(d1, d2))
    mae = total_diff / (len(d1) * 3)
    return mae < threshold

def process_and_save(img, desktop_path, mobile_path):
    # Ensure 16:9 crop if slightly off (like 864x496 -> 864x486)
    w, h = img.size
    target_h = int(round(w * 9.0 / 16.0))
    if abs(h - target_h) > 0 and abs(h - target_h) <= 12:
        top = (h - target_h) // 2
        bottom = top + target_h
        img = img.crop((0, top, w, bottom))
    
    # Desktop 1600px wide
    desktop_img = img.resize((1600, 900), Image.Resampling.LANCZOS)
    desktop_img.save(desktop_path, 'WEBP', quality=78, method=4)
    
    # Mobile 960px wide
    mobile_img = img.resize((960, 540), Image.Resampling.LANCZOS)
    mobile_img.save(mobile_path, 'WEBP', quality=72, method=4)

def main():
    os.makedirs('assets/frames/hero', exist_ok=True)
    os.makedirs('assets/frames/hero-mobile', exist_ok=True)
    os.makedirs('assets/frames/dismantle', exist_ok=True)
    os.makedirs('assets/frames/dismantle-mobile', exist_ok=True)
    os.makedirs('assets/cars', exist_ok=True)

    # 1. Hero frames: clip1, clip2, clip3
    c1_files = [os.path.join('clip1frame', f) for f in get_sorted_images('clip1frame')]
    c2_files = [os.path.join('clip2frame', f) for f in get_sorted_images('clip2frame')]
    c3_files = [os.path.join('clip3frame', f) for f in get_sorted_images('clip3frame')]

    print(f"Found frames - clip1: {len(c1_files)}, clip2: {len(c2_files)}, clip3: {len(c3_files)}")

    hero_source_files = []
    hero_source_files.extend(c1_files)

    # Check join between c1 and c2
    if c1_files and c2_files:
        im1_last = Image.open(c1_files[-1])
        im2_first = Image.open(c2_files[0])
        if is_duplicate(im1_last, im2_first):
            print("Skipping first frame of clip2 (duplicate of clip1 last frame)")
            hero_source_files.extend(c2_files[1:])
        else:
            hero_source_files.extend(c2_files)
    else:
        hero_source_files.extend(c2_files)

    # Check join between c2 and c3
    if hero_source_files and c3_files:
        im_prev_last = Image.open(hero_source_files[-1])
        im3_first = Image.open(c3_files[0])
        if is_duplicate(im_prev_last, im3_first):
            print("Skipping first frame of clip3 (duplicate of previous last frame)")
            hero_source_files.extend(c3_files[1:])
        else:
            hero_source_files.extend(c3_files)
    else:
        hero_source_files.extend(c3_files)

    print(f"Total hero frames to generate: {len(hero_source_files)}")

    for idx, src_path in enumerate(hero_source_files, 1):
        with Image.open(src_path) as img:
            d_path = f"assets/frames/hero/frame_{idx:04d}.webp"
            m_path = f"assets/frames/hero-mobile/frame_{idx:04d}.webp"
            process_and_save(img, d_path, m_path)
        if idx % 40 == 0 or idx == len(hero_source_files):
            print(f"Hero converted {idx}/{len(hero_source_files)}")

    # 2. Dismantle frames: clip4frame
    dismantle_files = [os.path.join('clip4frame', f) for f in get_sorted_images('clip4frame')]
    print(f"Found dismantle frames: {len(dismantle_files)}")

    for idx, src_path in enumerate(dismantle_files, 1):
        with Image.open(src_path) as img:
            d_path = f"assets/frames/dismantle/frame_{idx:04d}.webp"
            m_path = f"assets/frames/dismantle-mobile/frame_{idx:04d}.webp"
            process_and_save(img, d_path, m_path)
        if idx % 10 == 0 or idx == len(dismantle_files):
            print(f"Dismantle converted {idx}/{len(dismantle_files)}")

    # Calculate statistics
    for folder in ['assets/frames/hero', 'assets/frames/hero-mobile', 'assets/frames/dismantle', 'assets/frames/dismantle-mobile']:
        flist = [os.path.join(folder, f) for f in os.listdir(folder) if f.endswith('.webp')]
        total_size = sum(os.path.getsize(f) for f in flist)
        print(f"Folder: {folder} | Count: {len(flist)} frames | Total Size: {total_size / (1024*1024):.2f} MB ({total_size} bytes)")

if __name__ == '__main__':
    main()

