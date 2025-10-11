# 4re5 Virtual Arch
A complete minimal computer architecture directly on your browser.

Based on the nandgame.com architecture, it provides a simple assembly language to interact with the system.

## How it works.
This code emulates a virtual simple machine by interpreting op codes (cpu binary operations).

These op codes are 16 bits of length and are formatted as follow:

    | ci | - | - | * | - | u | op1 | op0 | zx | sw | a | d | *a | lt | eq | gt |


## :book: Assembly manual
### Summary
1. [Registers](#registers)
2. [Conditions](#conditions)


### Registers
Operations can be processed using 3 main registers: `A`, `D` and `*A` (which is used as a pointer for ram access)

> A is the main one; it is the only one that can be defined directly.

e.g `A = 1234` sets the value `1234` into the `A` register

Others registers can be copied using e.g `D = A`

> *A is a special register. It is a pointer to computer memory.
For example
```
A = 1000
*A = 1    # value to write at offset 1000
```
Or
```
A = 1000
D = *A   # reads the memory at offset 1000
```


### Conditions
> Any condition can be placed after an operation using the `;` character.

> :warning: NOTE: conditial jumps are conditioned by the sign of the operation before the `;` character 

Conditions are available to do jumps in your code.

It only exists 6 ones.

- JMP (jump in `any case`)
- JLT (jump if `result  < 0`)
- JLE (jump if `result <= 0`)
- JEQ (jump if `result == 0`)
- JGT (jump if `result  > 0`)
- JGE (jump if `result >= 0`)

> Any triggered jump will set the program counter (pc) to **the value of the A register**.

e.g
```
A = 15
A;JMP
```
will jump to line `16` (pc starts at line 0 but line 1 in editor).


## :book: C manual
### Summary
1. [Builtin Functions](#builtin-functions)

### Builtin Functions
virtualArch C compiler can handle several builtin functions.
Here are the full list with examples.

- write_char(char c)
    - writes a character (here `c`) to the termial at cursor position defined
    - e.g. `write_char('A');` will write the character 'A' to screen
- set_cursor(int pos)
    - sets the screen cursor position to the value of `pos`
    - e.g. `set_cursor(5);` will set the cursor to position **5**


## TODO list
- [x] Add memory mapping for a simple graphic interface
- [x] Add memory mapping for keyboard input
- [ ] Add other periferals like sound card and mouse
- [ ] Make the js code a whole package
- [ ] Create a simple game on this architecture
- [ ] Handle if user does not have javascript allowed

Asm Language improvements
- [x] Add DEFINE for preprocessing data
- [x] Handle chars when defining A register
- [x] Add labels for better jumps
- [x] Add a text section that puts constants into memory

C Language improvements
- [ ] Handle any kind of C variables
- [ ] Handle multi-arg functions call + returns
- [ ] Add for and while loops
- [ ] Add ability to do logic & arithmetic operations


Known Bugs
- Can't add labels with a comment on the same line
- Can't call a function with a quoted char as arg in C code
- Writing 'if (' inside of the code editor is causing a crash