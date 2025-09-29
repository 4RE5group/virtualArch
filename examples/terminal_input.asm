# initialisation
A = CURSOR
*A = 0-1         # reset the terminal cursor to pos 0 -1

# start of the program
LOOP:
    A = CURSOR   # address of the cursor position on screen
    *A = *A + 1  # increment it

LOOP_WITHOUT_ADDING:
    A = KEYPRESS # keyboard input address
    D = *A       # read keyboard input

    # if no input character skip
    A = LOOP_WITHOUT_ADDING
    D-1; JLE     # if character code is 0 or less

    # if backspace (ascii code 8)
    A = '\b'
    D = D - A
    A = BACKSPACE
    D; JEQ       # if d = 0 that mean d was equal to 8

    # add 8 again to retrieve the character
    A = '\b'
    D = D + A

    A = WRITE    # character write operation
    *A = D - 1   # set the character to write

    A = KEYPRESS
    *A = 0       # reset keyboard input

    A = LOOP     # set the jump line address
    A; JMP       # repeat the operation




BACKSPACE:
    # check if cursor position is 0, if so we can't delete a character
    A = CURSOR
    D = *A       # get current cursor position
    A = LOOP     # back to loop
    D; JEQ


    A = CURSOR   # cursor position offset
    *A = *A - 1  # move cursor position backward


    A = ' '      # space character to clear last cursor
    D = A

    A = WRITE    # character write operation
    *A = D       # write a space character

    A = KEYPRESS
    *A = 0       # reset keyboard input

    A = LOOP_WITHOUT_ADDING     # go back to main loop
    A;JMP