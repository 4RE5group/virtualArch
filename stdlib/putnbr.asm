TEXT:
    i 0
    remainder 0

MAIN:
    A = CURSOR
    *A = 0

    A = 42
    D = A
    A = TMP0
    *A = D

    A = 10
    D = A
    A = TMP1
    *A = D

PUTNBR_LOOP:
    # i = 0
    A = i
    *A = 0

    # remainder = TMP0
    A = TMP0
    D = *A
    A = remainder
    *A = D

DIV_LOOP:
    # if remainder < TMP1 → end division
    A = TMP1
    D = *A
    A = remainder
    D = *A - D
    A = DIV_END
    D; JLE

    # remainder -= TMP1
    A = TMP1
    D = *A
    A = remainder
    *A = *A - D

    # i++
    A = i
    *A = *A + 1

    A = DIV_LOOP
    ; JMP

DIV_END:
    # TMP0 = i (quotient)
    A = i
    D = *A
    A = TMP0
    *A = D

    # write digit
    A = '0'
    D = A
    A = remainder
    D = D + *A

    A = WRITE
    *A = D

    A = CURSOR
    *A = *A + 1

    # if TMP0 == 0 => end
    A = TMP0
    D = *A
    A = END
    D; JEQ

    A = PUTNBR_LOOP
    ; JMP

END:
    A = END
    ; JMP
