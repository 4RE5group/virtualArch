TEXT:
    i 0
    ptr 0
    last_bracket 0
    CODE ">++++++++[<+++++++++>-]<.>++++[<+++++++>-]<+.+++++++..+++.>>++++++[<+++++++>-]<++.------------.>++++++[<+++++++++>-]<+.<.+++.------.--------.>>>++++[<++++++++>-]<+."
    MEM_BRAINFUCK 0
    MAX_BRAINFUCK_CELLS 15

main:
    # reset cursor
    A = CURSOR
    *A = 0

    A = ptr
    *A = 0

    # reset idx of last bracket
    A = last_bracket 
    *A = 0
  
    A = i
    *A = 0 # reset i
# clear memory range from 0 to MAX_BRAINFUCK_CELLS
CLEAR:
    A = i
    D = *A
    A = MEM_BRAINFUCK
    A = A + D
    *A = 0    # MEM_BRAINFUCK[i] = 0
    
    A = i
    *A = *A + 1
    D = *A
    A = MAX_BRAINFUCK_CELLS
    D = D - *A
    A = CLEAR
    D; JLE

    A = i # init i = -1
    *A = 0
    *A = *A - 1 # i = -1

# start of the program
LOOP:
    # increment i
    A = i
    *A = *A + 1
    
    # load current character into D
    A = i
    D = *A
    A = CODE
    A = A + D
    D = *A # save current character

    # check '.'
    A = '.'
    D = D - A
    A = HANDLE_POINT
    D; JEQ
    A = '.'
    D = D + A

    # check '>'
    A = '>'
    D = D - A
    A = HANDLE_UPPER
    D; JEQ
    A = '>'
    D = D + A

    # check '<'
    A = '<'
    D = D - A
    A = HANDLE_LOWER
    D; JEQ
    A = '<'
    D = D + A

    # check '+'
    A = '+'
    D = D - A
    A = HANDLE_PLUS
    D; JEQ
    A = '+'
    D = D + A

    # check '-'
    A = '-'
    D = D - A
    A = HANDLE_MINUS
    D; JEQ
    A = '-'
    D = D + A

    # check '['
    A = '['
    D = D - A
    A = HANDLE_OPENING_BRACKET
    D; JEQ
    A = '['
    D = D + A

    # check ']'
    A = ']'
    D = D - A
    A = HANDLE_CLOSING_BRACKET
    D; JEQ
    A = ']'
    D = D + A

    # check ','
    A = ','
    D = D - A
    A = HANDLE_COMMA
    D; JEQ
    A = ','
    D = D + A

    # end of code?
    A = STOP
    D; JEQ

    # loop
    A = LOOP
    A; JMP

# -------------------- Handlers --------------------

HANDLE_POINT:
    A = ptr
    D = *A
    A = MEM_BRAINFUCK
    A = A + D
    D = *A
    A = WRITE
    *A = D

    # advance cursor
    A = CURSOR
    *A = *A + 1

    A = LOOP
    A; JMP

HANDLE_UPPER:
    A = ptr
    *A = *A + 1

    A = LOOP
    A; JMP

HANDLE_LOWER:
    A = ptr
    *A = *A - 1

    A = LOOP
    A; JMP

HANDLE_PLUS:
    A = ptr
    D = *A
    A = MEM_BRAINFUCK
    A = A + D
    *A = *A + 1

    A = LOOP
    A; JMP

HANDLE_MINUS:
    A = ptr
    D = *A
    A = MEM_BRAINFUCK
    A = A + D
    *A = *A - 1

    A = LOOP
    A; JMP

HANDLE_OPENING_BRACKET:
    A = i
    D = *A # save index of char    

    A = last_bracket
    *A = D # save last index to var
    
    A = LOOP
    A; JMP

HANDLE_CLOSING_BRACKET:
    A = ptr
    D = *A
	A = MAX_BRAINFUCK_CELLS
	A = A + D
	D = *A
    A = STOP_WHILE
    D; JEQ  # if zero, stop while
     
    # else i = last index of [
    A = last_bracket
    D = *A # save new index
    
    A = i
    *A = D
STOP_WHILE:
    A = LOOP
    A; JMP


HANDLE_COMMA:
    A = KEYPRESS   # read keypress
    D = *A
    A = ptr
    D = *A         # get current ptr (or use TMP0)
    A = MEM_BRAINFUCK
    A = A + D
    *A = D         # store input char
    A = LOOP
    A; JMP

STOP:
    A = STOP
    A; JMP

HANDLE_POINT:
    A = ptr
    D = *A
    A = MEM_BRAINFUCK
    A = A + D
    D = *A
    A = WRITE
    *A = D

    # advance cursor
    A = CURSOR
    *A = *A + 1

    A = LOOP
    A; JMP

HANDLE_UPPER:
    A = ptr
    *A = *A + 1

    A = LOOP
    A; JMP

HANDLE_LOWER:
    A = ptr
    *A = *A - 1

    A = LOOP
    A; JMP

HANDLE_PLUS:
    A = ptr
    D = *A
    A = MEM_BRAINFUCK
    A = A + D
    *A = *A + 1

    A = LOOP
    A; JMP

HANDLE_MINUS:
    A = ptr
    D = *A
    A = MEM_BRAINFUCK
    A = A + D
    *A = *A - 1

    A = LOOP
    A; JMP

HANDLE_OPENING_BRACKET:
    A = i
    D = *A # save index of char    

    A = last_bracket
    *A = D # save last index to var
    
    A = LOOP
    A; JMP

HANDLE_CLOSING_BRACKET:
    A = ptr
    D = *A
	A = MEM_BRAINFUCK
	A = A + D
	D = *A
    A = STOP_WHILE
    D; JEQ  # if zero, stop while
     
    # else i = last index of [
    A = last_bracket
    D = *A # save new index
    
    A = i
    *A = D
STOP_WHILE:
    A = LOOP
    A; JMP


HANDLE_COMMA:
    A = KEYPRESS   # wait for key
    D = *A
    A = ptr
    D = *A         # get current ptr (or use TMP0)
    A = MEM_BRAINFUCK
    A = A + D
    *A = D         # store input char
    A = LOOP
    A; JMP
 
STOP:
    A = STOP
    A; JMP
