import os
import json
import re

# Configuration
IMAGE_ROOT = 'images'
OUTPUT_FILE = 'data.json'
VALID_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')
UNCATEGORIZED_KEY = '_uncategorized' 

# 👇 دالة الترتيب السحرية (تفرق بين النص والرقم)
def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split('([0-9]+)', s)]

def generate_image_data():
    gallery_data = {}

    if not os.path.exists(IMAGE_ROOT):
        print(f"Error: Folder '{IMAGE_ROOT}' not found.")
        return

    # 1. جلب الأقسام وترتيبها
    categories = sorted(os.listdir(IMAGE_ROOT), key=natural_sort_key)

    for category in categories:
        cat_path = os.path.join(IMAGE_ROOT, category)
        
        if os.path.isdir(cat_path):
            gallery_data[category] = {}
            loose_images = []

            # 2. جلب العناصر داخل القسم وترتيبها
            items = sorted(os.listdir(cat_path), key=natural_sort_key)

            for item in items:
                item_path = os.path.join(cat_path, item)
                
                # Case 1: Subfolder -> These get buttons
                if os.path.isdir(item_path):
                    images = []
                    # 3. جلب الصور داخل المجلد الفرعي وترتيبها
                    files = sorted(os.listdir(item_path), key=natural_sort_key)
                    
                    for filename in files:
                        if filename.lower().endswith(VALID_EXTENSIONS):
                            rel_path = f"{IMAGE_ROOT}/{category}/{item}/{filename}"
                            images.append(rel_path)
                    
                    if images:
                        gallery_data[category][item] = images

                # Case 2: Loose File -> These go to 'All'
                elif item.lower().endswith(VALID_EXTENSIONS):
                    rel_path = f"{IMAGE_ROOT}/{category}/{item}"
                    loose_images.append(rel_path)

            if loose_images:
                gallery_data[category][UNCATEGORIZED_KEY] = loose_images

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(gallery_data, f, indent=4, ensure_ascii=False)
    
    print(f"Success! '{OUTPUT_FILE}' created with correct sorting.")

if __name__ == "__main__":
    generate_image_data()