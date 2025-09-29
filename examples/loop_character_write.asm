A = 'A'      # starting character
D = A - 1    # starting character - 1
A = CURSOR
*A = 0       # reset the terminal cursor to pos 0

LOOP:
    D = D + 1
    A = WRITE   # character write operation
    *A = D - 1  # set the character to write

    A = CURSOR  # address of the character position on screen
    *A = *A + 1 # increment it   

    A = LOOP    # set the jump line address
    A; JMP      # repeat the operation