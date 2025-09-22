# 4re5 Virtual Arch
A complete minimal computer architecture directly on your browser.

Based on the nandgame.com architecture, it provides a simple assembly language to interact with the system.

## How it works.
This code emulates a virtual simple machine by interpreting op codes (cpu binary operations).

These op codes are 16 bits of length and are formatted as follow:

    | ci | - | - | * | - | u | op1 | op0 | zx | sw | a | d | *a | lt | eq | gt |


### Assembly manual
#### Summary
1. [Registers](#registers)
2. [Conditions](#conditions)


#### Registers
Operations can be processed using 3 main registers: `A`, `D` and `*A` (which is used as a pointer for ram access)

A is the main one; it is the only one that can be defined directly.

e.g `A = 1234` sets the value `1234` into the `A` register

Others registers can be copied using e.g `D = A`

#### Conditions
Any condition can be placed after an operation using the `;` character.

Conditions are available to do jumps in your code.

It only exists 6 ones.

- JMP (jump in any case)
- JLT (jump if result  < 0)
- JLE (jump if result <= 0)
- JEQ (jump if result == 0)
- JGT (jump if result  > 0)
- JGE (jump if result >= 0)

Any triggered jump will set the program counter (pc) to the value of the condition behind.

e.g `A = 15; JMP` will jump to line `15`.
`D = A+1; JMP` will jump to the line `A+1`

## TODO list
- [ ] Add memory mapping for a simple tty interface/graphic interface
- [ ] Make the js code a whole package
- [ ] Create a simple game on this architecture