from PIL import Image

SCREEN_WIDTH=640
SCREEN_HEIGHT=400
FONT_SIZE=16
SCALE=int(SCREEN_WIDTH/FONT_SIZE)

#path = input("Enter image path: ")
path="/home/julcleme/Downloads/42.png"
img_original = Image.open(path).convert("RGB")
img = img_original.resize((SCALE, SCALE), Image.NEAREST)

for r, g, b in img.get_flattened_data():
    # RGB888 => RGB332
    r = int((r / 255) * 7)
    g = int((g / 255) * 7)
    b = int((b / 255) * 3)
    
    color = (r << 5) | (g << 2) | b
    
    print(chr(color), end='')