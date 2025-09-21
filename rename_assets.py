import os
import re

# Configuration
base_dir = "C:\\dev\\15_STG\\assets"
game_js_path = "C:\\dev\\15_STG\\game.js"
asset_categories = {
    "f": "player",
    "e": "enemies",
    "b": "bosses",
    "bg": "backgrounds",
    "c": "cutins",
    "bgm": "bgm"
}
new_asset_paths = {
    "player": [],
    "enemies": [],
    "bosses": [],
    "backgrounds": [],
    "cutins": [],
    "bgm": []
}

print("--- Renaming asset files ---")
for dir_prefix, asset_key in asset_categories.items():
    folder_path = os.path.join(base_dir, dir_prefix)
    if not os.path.isdir(folder_path):
        continue

    files = sorted([f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))])
    
    for i, old_filename in enumerate(files):
        old_filepath = os.path.join(folder_path, old_filename)
        extension = os.path.splitext(old_filename)[1]
        new_filename = f"{dir_prefix}_{i}{extension}"
        new_filepath = os.path.join(folder_path, new_filename)
        
        try:
            os.rename(old_filepath, new_filepath)
            js_path = f"assets/{dir_prefix}/{new_filename}"
            new_asset_paths[asset_key].append(js_path)
        except OSError as e:
            print(f"Error renaming {old_filepath}: {e}")

print("--- Updating game.js ---")
try:
    with open(game_js_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def format_js_array(arr):
        if not arr:
            return "[]"
        quoted_items = [f"'{item}'" for item in arr]
        items_str = "\n        ".join(quoted_items)
        return f"[\n        {items_str}\n    ]"

    asset_paths_str = "const assetPaths = {\n"
    asset_paths_str += f"    player: {format_js_array(new_asset_paths['player'])},\n"
    asset_paths_str += f"    enemies: {format_js_array(new_asset_paths['enemies'])},\n"
    asset_paths_str += f"    bosses: {format_js_array(new_asset_paths['bosses'])},\n"
    asset_paths_str += f"    backgrounds: {format_js_array(new_asset_paths['backgrounds'])},\n"
    asset_paths_str += f"    cutins: {format_js_array(new_asset_paths['cutins'])},\n"
    asset_paths_str += f"    bgm: {format_js_array(new_asset_paths['bgm'])}\n"
    asset_paths_str += "};"
    
    pattern = re.compile(r"const assetPaths = {.*?};", re.DOTALL)
    new_content = pattern.sub(asset_paths_str, content)

    with open(game_js_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("game.js updated successfully.")
except Exception as e:
    print(f"Error updating game.js: {e}")
