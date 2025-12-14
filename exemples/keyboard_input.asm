# initialisation
A = CURSOR
*A = 0-1      # reset the terminal cursor to pos 0 -1

# start of the program
A = CURSOR    # address of the cursor position on screen
*A = *A + 1   # increment it

A = KEYPRESS  # keyboard input address
D = *A        # read keyboard input

# if no input character skip
A = 6
D-1; JLE      # if character code is 0 or less

A = WRITE     # character write operation
*A = D - 1    # set the character to write

A = KEYPRESS
*A = 0        # reset keyboard input

A = 5         # set the jump line address
A; JMP        # repeat the operation