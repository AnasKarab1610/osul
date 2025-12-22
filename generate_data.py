import os
import json

# Configuration
IMAGE_ROOT = 'images'
OUTPUT_FILE = 'data.json'
VALID_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')
# Files found directly in category folders go here. 
# The underscore (_) tells the JS to NOT make a button for it.
UNCATEGORIZED_KEY = '_uncategorized' 

def generate_image_data():
    gallery_data = {}

    if not os.path.exists(IMAGE_ROOT):
        print(f"Error: Folder '{IMAGE_ROOT}' not found.")
        return

    # Walk through the directory: images/Category/
    for category in os.listdir(IMAGE_ROOT):
        cat_path = os.path.join(IMAGE_ROOT, category)
        
        if os.path.isdir(cat_path):
            gallery_data[category] = {}
            loose_images = []

            for item in os.listdir(cat_path):
                item_path = os.path.join(cat_path, item)
                
                # Case 1: Subfolder (Room1, Room2) -> These get buttons
                if os.path.isdir(item_path):
                    images = []
                    for filename in os.listdir(item_path):
                        if filename.lower().endswith(VALID_EXTENSIONS):
                            rel_path = f"{IMAGE_ROOT}/{category}/{item}/{filename}"
                            images.append(rel_path)
                    
                    if images:
                        gallery_data[category][item] = images

                # Case 2: Loose File -> These go to 'All' but get NO button
                elif item.lower().endswith(VALID_EXTENSIONS):
                    rel_path = f"{IMAGE_ROOT}/{category}/{item}"
                    loose_images.append(rel_path)

            if loose_images:
                gallery_data[category][UNCATEGORIZED_KEY] = loose_images

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(gallery_data, f, indent=4)
    
    print(f"Success! '{OUTPUT_FILE}' updated.")

if __name__ == "__main__":
    generate_image_data()