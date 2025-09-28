D = 0
A = 984576 # screen buffer start address
D = D + 1  # increment pointer inside screen buffer
*A = 1     # write a white pixel
A = 1; JMP # and repeat