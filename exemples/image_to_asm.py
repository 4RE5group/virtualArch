# 4re5 group all rights reserved

from PIL import Image

# change this according to the width and height of the terminal
SCREEN_WIDTH = 992
SCREEN_HEIGHT = 640
FONT_SIZE = 16

NEW_WIDTH = int(SCREEN_WIDTH/FONT_SIZE)
NEW_HEIGHT = int(SCREEN_HEIGHT/FONT_SIZE)

path = input("Enter image path: ")
img_original = Image.open(path).convert("RGB")

ratio = img_original.height / img_original.width
if int(NEW_WIDTH * ratio) < NEW_HEIGHT:
    NEW_HEIGHT = int(NEW_WIDTH * ratio)
else:
    NEW_WIDTH = int(NEW_HEIGHT * (img_original.width / img_original.height))

img = img_original.resize((NEW_WIDTH, NEW_HEIGHT), Image.NEAREST)

img.show()

image_data = "["
i = 0
for r, g, b in img.getdata():
    # RGB888 => RGB332
    r = int((r / 255) * 7)
    g = int((g / 255) * 7)
    b = int((b / 255) * 3)

    color = (r << 5) | (g << 2) | b
    image_data += str(color)

    if i == NEW_WIDTH * NEW_HEIGHT - 1:
        image_data += ']'
    else:
        image_data += ', '
    i += 1

print(f"Generated a new picture: size={{{NEW_WIDTH}x{NEW_HEIGHT}}}")
output = "output.asm"
with open(output, "w") as f:
    f.write(f"""TEXT:
	image_data {image_data}
	i 0
	k 0
	image_data_len {NEW_WIDTH * NEW_HEIGHT}
	image_size {NEW_WIDTH}

MAIN:
	A = i
	*A = 0

	A = k
	*A = 0
	
	A = CURSOR
	*A = 0
LOOP:
	# calculate image_data[i]
	A = image_data
	D = A
	A = i
	D = D + *A
	A = D
	D = *A

	# set cell color
	A = COLOR_BG
	*A = D
	A = COLOR_FG
	*A = D

	A = i
	D = *A
	A = image_data_len 
	A = *A
	D = A - D
	A = EXIT     # quit if all the pixels are drawn
	D; JLE

	A = ' '
	D = A
	A = WRITE
	*A = D       # write a blank character

	A = CURSOR
	*A = *A + 1

	# handle custom image width
	A = k
	D = *A
	A = image_size
	D = D - *A      # if (k-image_size < 0)
	A = NEXT
	D; JLT

GOTO_NEWLINE:
	A = CURSOR
	*A = *A + 1

	# while (k < 62) CURSOR++
	
	# if k-62 < 0 loop
	A = k
	D = *A
	A = 60
	D = D - A

	A = k
	*A = *A + 1

	A = GOTO_NEWLINE
	D; JLT


	A = k      # k = -1
	*A = 0 - 1

	A = i
	*A = *A - 1

NEXT:
	# increment  current line count
	A = k
	*A = *A + 1

	# increment pixel count
	A = i
	*A = *A + 1

	A = LOOP
	A; JMP

EXIT:
	A = EXIT
	A; JMP""")
    print(f"Wrote {output}")
