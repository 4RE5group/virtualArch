TEXT:
    i 0
    MY_TEXT "Hello World! From VirtualArch"

A = CURSOR
*A = 0           # reset cursor

LOOP:
    A = i
    D = *A       # get offset inside MY_TEXT
    A = MY_TEXT
    A = A + D    # offset of the i-th char
    D = *A       # get char to D

    A = WRITE
    *A = D       # write char

    A = CURSOR
    *A = *A + 1  # increment write cursor

    A = i
    *A = *A + 1  # increment pointer

    A = i
    D = *A       # get value of i
    A = 12
    D = D - A
    A = STOP 
    D; JGE       # if i = 12 or more stop
    A = LOOP     # else continue
    A ;JMP

STOP:
    A = STOP
    A; JMP