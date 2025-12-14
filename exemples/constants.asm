TEXT:
    HELLO_WORLD_TEXT "Hello World!"
    i 0

# save counter
A = i
*A = 0-1
# reset cursor
A = CURSOR
*A = 0

LOOP:
    A = i
    *A = *A + 1 # increment counter

    A = HELLO_WORLD_TEXT
    D = A       # get base address of the text

    A = i
    A = *A + D  # get char at index i of HELLO_WORLD_TEXT
    D = *A      # save current character

    # check if null, if so that's the end of string
    A = STOP
    D; JEQ

    A = WRITE # char write
    *A = D

    A = CURSOR # increment cursor pos for next character
    *A = *A + 1

    D = D + 1

    A = LOOP
    A; JMP

STOP:
    A = STOP
    A; JMP # infinite loop