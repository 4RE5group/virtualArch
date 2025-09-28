# initialisation
A = 64      # starting character - 1
D = A
A = 984574
*A = 0-1     # reset the terminal cursor to pos 0 -1

# start of the program
A = 984574  # address of the character position on screen
*A = *A + 1 # increment it     
D = D + 1
A = 984575  # character write operation
*A = D - 1  # set the character to write
A = 7       # set the jump line address to line 8 (number 7)
A; JMP      # repeat the operation