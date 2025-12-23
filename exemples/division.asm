# Simple test division system.
# use carefully. Not efficient.
#     TMP2 = TMP0 / TMP1

TEXT:
    i 0
    remainder 0

# simple main for testing purposes
MAIN:
   A = 100       # number 1
   D = A
   A = TMP0
   *A = D

   A = 10        # number 2
   D = A
   A = TMP1
   *A = D

   A = DIVIDE
   A; JMP



DIVIDE:
    # divide TMP0 by TMP1
    A = i
    *A = 0

    A = TMP0
    D = *A
    A = remainder
    *A = D

    # division by 0 security
    A = TMP1
    D = *A
    A = DIVIDE_EXIT
    D; JEQ

DIVIDE_LOOP:
    # increment the count
    A = i
    *A = *A + 1
    
    # if remainder < TMP1 exit
    A = TMP1
    D = *A
    A = remainder
    D = *A - D 
    A = DIVIDE_EXIT
    D; JLE


    A = TMP1
    D = *A
    A = remainder
    *A = *A - D        # remove TMP1 from remainder
   
    A = DIVIDE_LOOP
    A; JMP

DIVIDE_EXIT:
   A = i
   D = *A

   A = TMP2           # save the result into TMP2
   *A = D
     
   A = DIVIDE_EXIT
   A; JMP
