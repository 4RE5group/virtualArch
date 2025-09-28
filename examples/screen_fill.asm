# DEFINE SCREEN_BUFFER 984576

D = 0
LOOP:
    A = SCREEN_BUFFER  # screen buffer start address
    D = D + 1          # increment pointer inside screen buffer
    *A = 1             # write a white pixel
    A = LOOP
    ;JMP                # and repeat