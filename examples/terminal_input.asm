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

# if backspace (ascii code 8)
A = 8
D = D - A
A = 37 # line 38
D; JEQ # if d = 0 that mean d was equal to 8

# add 8 again to retrieve the character
A = 8
D = D + A

A = 984575  # character write operation
*A = D - 1  # set the character to write

A = 984573
*A = 0      # reset keyboard input

A = 5       # set the jump line address
A; JMP      # repeat the operation




# backspace operation
# check if cursor position is 0, if so we can't delete a character
A = 984574
D = *A      # get current cursor position
A = 5       # back to loop
D; JEQ


A = 984574  # cursor position offset
*A = *A - 1 # move cursor position backward


A = 32      # space character
D = A

A = 984575  # character write operation
*A = D      # write a space character

A = 984574
*A = *A - 1 # move cursor again to affect the +1 in the loop

A = 984573
*A = 0      # reset keyboard input

A = 5       # go back to main loop
A;JMP