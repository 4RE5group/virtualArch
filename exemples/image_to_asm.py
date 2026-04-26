from PIL import Image

SCREEN_WIDTH = 992
SCREEN_HEIGHT = 640
FONT_SIZE = 16

MAX_W = SCREEN_WIDTH // FONT_SIZE
MAX_H = SCREEN_HEIGHT // FONT_SIZE

path = input("Enter image path: ")
img_original = Image.open(path).convert("RGB")

# keep aspect ratio (cleaner)
ratio = img_original.width / img_original.height

if MAX_W / ratio <= MAX_H:
    NEW_WIDTH = MAX_W
    NEW_HEIGHT = int(MAX_W / ratio)
else:
    NEW_HEIGHT = MAX_H
    NEW_WIDTH = int(MAX_H * ratio)

img = img_original.resize((NEW_WIDTH, NEW_HEIGHT), Image.NEAREST)

img.show()

image_data = []

for i, (r8, g8, b8) in enumerate(img.getdata()):
    # RGB888 -> RGB332
    r = (r8 * 7) // 255
    g = (g8 * 7) // 255
    b = (b8 * 3) // 255
    

    color = (r << 5) | (g << 2) | b
    image_data.append(color)

    # convert BACK to RGB888 for terminal display
    r_term = (r * 255) // 7
    g_term = (g * 255) // 7
    b_term = (b * 255) // 3

    print(f'\033[48;2;{r_term};{g_term};{b_term}m  \033[0m', end='')

    if (i + 1) % NEW_WIDTH == 0:
        print()

print("Press any key to continue...", end='')
input()

print(f"Generated a new picture: size={NEW_WIDTH}x{NEW_HEIGHT}")

output = "output.asm"
with open(output, "w") as f:
    f.write(f"""TEXT:
\timage_data [{','.join(map(str, image_data))}]
\ti 0
\tk 0
\timage_data_len {NEW_WIDTH * NEW_HEIGHT}
\timage_size {NEW_WIDTH}

MAIN:
\tA = i
\t*A = 0

\tA = k
\t*A = 0
\t
\tA = CURSOR
\t*A = 0

LOOP:
\t# --- exit if i >= image_data_len ---
\tA = i
\tD = *A
\tA = image_data_len
\tA = *A
\tD = D - A
\tA = EXIT
\tD; JGE

\t# --- load image_data[i] ---
\tA = image_data
\tD = A
\tA = i
\tD = D + *A
\tA = D
\tD = *A

\t# --- set colors ---
\tA = COLOR_BG
\t*A = D
\tA = COLOR_FG
\t*A = D

\t# --- write pixel ---
\tA = ' '
\tD = A
\tA = WRITE
\t*A = D

\t# --- move cursor forward ---
\tA = CURSOR
\t*A = *A + 1

\t# --- increment column ---
\tA = k
\t*A = *A + 1

\t# --- check end of line ---
\tA = k
\tD = *A
\tA = image_size
\tD = D - *A
\tA = NEXT
\tD; JLT

\t# --- newline ---
\tA = k
\t*A = 0

NEXT:
\tA = i
\t*A = *A + 1

\tA = LOOP
\tA; JMP

EXIT:
\tA = EXIT
\tA; JMP
""")

print(f"Wrote {output}")