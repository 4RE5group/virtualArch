# initialisation
A = 984574
*A = 0-1     # reset the terminal cursor to pos 0 -1

# start of the program
A = 984574  # address of the cursor position on screen
*A = *A + 1 # increment it

A = 984573  # keyboard input address
D = *A      # read keyboard input

# if no input character skip
A = 6
D-1; JLE # if character code is 0 or less

A = 984575  # character write operation
*A = D - 1  # set the character to write

A = 984573
*A = 0      # reset keyboard input

A = 5       # set the jump line address
A; JMP      # repeat the operation