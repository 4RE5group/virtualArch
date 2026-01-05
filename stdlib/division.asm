# Simple euclidian division system
#     TMP2 = TMP0 / TMP1 (quotient)
#     TMP3 = TMP0 % TMP1 (remainder)

TEXT:
    i 0
    remainder 0

# -------- test main --------
MAIN:
    A = 42
    D = A
    A = TMP0
    *A = D

    A = 10
    D = A
    A = TMP1
    *A = D

    A = DIVIDE
    ; JMP


# -------- division --------
DIVIDE:
    # i = 0
    A = i
    *A = 0

    # remainder = TMP0
    A = TMP0
    D = *A
    A = remainder
    *A = D

    # if TMP1 == 0 → exit
    A = TMP1
    D = *A
    A = DIVIDE_EXIT
    D; JEQ


DIVIDE_LOOP:
    # if remainder < TMP1 → exit
    A = TMP1
    D = *A
    A = remainder
    D = *A - D
    A = DIVIDE_EXIT
    D; JLT

    # remainder -= TMP1
    A = TMP1
    D = *A
    A = remainder
    *A = *A - D

    # i++
    A = i
    *A = *A + 1

    A = DIVIDE_LOOP
    ; JMP


DIVIDE_EXIT:
    # TMP2 = quotient
    A = i
    D = *A
    A = TMP2
    *A = D

    # TMP3 = remainder
    A = remainder
    D = *A
    A = TMP3
    *A = D

END:
    A = END
    ; JMP
