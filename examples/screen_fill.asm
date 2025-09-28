D = 0
A = 984576
D = D + 1
; write the screen buffer
*A = 1; JMP

; this code starts from the ram address 984576 which is the first of the mapped memory for the screen buffer
; content of D register is the offset from this address
; the final instruction loops all way up to line 2