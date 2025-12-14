TEXT:
	PS1 "$ "
	i 0
	CMD_BUFFER "                                          "
	CMD_BUFFER_SIZE 42

MAIN:
	# reset cursor
	A = CURSOR
	*A = 0
	
	A = READLINE
	A; JMP
MAIN_EXIT:
	A = MAIN_EXIT
	A; JMP


# arguments: TMP0 = pointer to the start of a STRING
WRITE_STR:
	A = i             # reset incrementation counter
	*A = 0
WRITE_STR_LOOP:
	A = TMP0
	D = A              # retrieve base address
	A = i              # write the character at pos i in D
	A = *A + D
	A = *A
	D = *A             # TMP0[i]

	# check for null byte (end of string)
	A = MAIN_EXIT
	D; JEQ


	A = WRITE
	*A = D             # write char

	A = i
	*A = *A + 1        # increment counter
	
	
	A = CURSOR
	*A = *A + 1        # increment cursor
	
	
	A = WRITE_STR_LOOP # jump back to loop
	A; JMP

READLINE:
	A = i
	*A = 0            # reset counter

READLINE_LOOP:
	A = KEYPRESS
	D = *A            # read input character

	A = READLINE_LOOP
	D; JEQ            # skip if null char (= not found)

	A = '\n'
	D = D - A         # used to check if char == '\n' and detect end of line
	A = READLINE_EXIT
	D; JEQ            # jump if newline

	# add to buffer
	A = '\n'
	A = D + A         # restore character
	D = A

	A = i
	D = *A


	A = CMD_BUFFER
	A = A + D         # CMD_BUFFER[i]
	*A = D
	
	A = i
	*A = *A + 1       # increment counter
	
	A = READLINE_LOOP
	A; JMP
READLINE_EXIT:
	A = CMD_BUFFER

	A = CMD_BUFFER
	D = A
	A = TMP0
	*A = D            # write the cmd buffer
	
	A = WRITE_STR
	A; JMP
	
