# 4re5 Virtual Arch

<img width="500" alt="image" src="https://github.com/user-attachments/assets/27bf681e-831c-4273-b2b5-44dbacbd753f" />

A complete minimal computer architecture directly on your browser. 🚀

Based on the [nandgame](https://nandgame.com) computer architecture, it provides a simple assembly language to interact with the system.

## How it works.
This code emulates a virtual simple machine by interpreting op codes (cpu binary operations).

These op codes are 16 bits of length and are formatted as follow:

    | ci | - | - | * | - | u | op1 | op0 | zx | sw | a | d | *a | lt | eq | gt |
       ┬           ┬       ┬     ┬     ┬    ┬    ┬   ┬   ┬    ┬    ┬    ┬    ┬ 
       │           │       │     │     │    │    │   │   │    │    ╰────┴────┴─ Jump option flags
       │           │       │     │     │    │    │   │   │    ╰─ Output is put into ram pointed by A
       │           │       │     │     │    │    │   │   ╰─ Output is put into D register
       │           │       │     │     │    │    │   ╰─ Output is put into A register
       │           │       │     ╰─────┴────┴────┴─ Logical/Arithmetical operations flags
       │           │       ╰─ Logical/Arithmetical operation type flag
       │           ╰─ Use *A instead of A in operations
       ╰─ Operation/Number input flag

## :book: Assembly manual
### Summary
1. [Basics of Asm language](#basics-of-asm-language)
2. [Registers](#registers)
3. [Conditions](#conditions)
4. [Labels and TEXT section](#labels-and-text-section)
5. [Preprocessor Directives](#preprocessor-directives)

### Basics of Asm language
- Arithmetic Operations
    - Only **plus** and **minus** are currently supported by our virtual processor. For example:
    - ✅ `A = A + D` or `D = A - D`
    - ❌ `A = A * D` or `D = A / D`
- Logical Operations
    - Only **and**, **or** **not** and **xor** can be used for logical operations. For example:
    - `A = A & B` or `D = A | D` or `A = ~A` or `D = A ^ B`

> [!Warning]
> Most of unavailable operations could be achieved using [our standard library functions](./stdlib/)

- Register definition
    - Only `A` register can be directly set to a number `< 2^15` since op codes are 16 bits long
    - `A` represents a pointer that points to the value in memory accessible by `*A`.

- Mapped memory

| NAME        | MEMORY AREA    | ACCESS MODE | DESCRIPTION                                            |
|:------------|:---------------|------------:|:-------------------------------------------------------|
| COLOR_FG    | RAMSIZE - 14   | RW          | Foreground Color of the text written using WRITE       |
| COLOR_BG    | RAMSIZE - 13   | RW          | Background Color of the text written using WRITE       |
| STACK_PUSH  | RAMSIZE - 12   | W           | Push a value to the general purpose stack              |
| STACK_POP   | RAMSIZE - 11   | R           | Pop the top value from the general purpose stack       |
| TMP0        | RAMSIZE - 10   | RW          | Temporary memory cell to store function arguments...   |
| TMP1        | RAMSIZE - 9    | RW          |   ...                                                  |
| TMP2        | RAMSIZE - 8    | RW          |   ...                                                  |
| TMP3        | RAMSIZE - 7    | RW          |   ...                                                  |
| TMP4        | RAMSIZE - 6    | RW          |   ...                                                  |
| TMP5        | RAMSIZE - 5    | RW          |   ...                                                  |
| TMP6        | RAMSIZE - 4    | RW          |   ...                                                  |
| CURSOR      | RAMSIZE - 3    | RW          | Cursor position on the virtual terminal                |
| WRITE       | RAMSIZE - 2    | W           | Write a character to the screen at CURSOR position     |
| KEYPRESS    | RAMSIZE        | R           | Read keyboard input                                    |

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
This also works using static variables/mapping definitions.
e.g.
```
TEXT:
    i 0     # static variable definition

MAIN:
    A = i   # i is the address of the memory where it has been stored
    *A = 0  # i = 0

    # or
    A = CURSOR # address of the memory mapped byte containing the cursor position
    *A = 0
```


### Conditions
> Any condition can be placed after an operation using the `;` character.

> [!Warning]
> NOTE: conditial jumps are conditioned by the sign of the operation before the `;` character 

Conditions are available to do jumps in your code.

It only exists 7 ones.

- JMP (jump in `any case`)
- JNE (jump if `result != 0`)
- JLT (jump if `result  < 0`)
- JLE (jump if `result <= 0`)
- JEQ (jump if `result == 0`)
- JGT (jump if `result  > 0`)
- JGE (jump if `result >= 0`)

> Any triggered jump will set the program counter (pc) to **the value of the A register**.

e.g
```
A = 15
A; JMP # will jump to line `15`.
```

### Labels and TEXT section
The assembler supports line labelling to safely perform jumps without needing to calculate line numbers manually. Just append a `:` to the name.

```
MY_LOOP:
    A = 1
    A = MY_LOOP
    ; JMP
```

You can also use a `TEXT:` section to allocate static data in memory before program execution. Types supported are numbers, strings, and arrays.

```
TEXT:
    my_var    42
    my_string "Hello World"
    my_arr    [1, 2, 3]

MAIN:
    A = my_var   # A is the memory address containing 42
    D = *A       # D now contains 42
```

### Preprocessor Directives
The compiler includes a preprocessor capable of handling constants and macros.

#### DEFINE
Replaces all instances of a specific text block with a defined string across the code. Variables defined in `script.js` (like `CURSOR`, `TMP0`, etc.) use this system.

```
#DEFINE MAX_COUNT 10

MAIN:
    A = MAX_COUNT
```

#### MACRO
For repetitive blocks of code, you can define macros. Macros can take arguments and consist of multiple lines. Use `#MACRO name arg1 arg2` to start, and close the block with `#ENDMACRO`. Calling a macro substitutes the name and its comma-separated arguments directly into the text at compilation.

```
#MACRO SET_MEM addr val
    A = val
    D = A
    A = addr
    *A = D
#ENDMACRO

#MACRO GOTO label
    A = label
    ; JMP
#ENDMACRO

MAIN:
    SET_MEM 1000, 42  # Puts 42 at memory address 1000
    GOTO MY_END       # Custom jump shortcut

MY_END:
    GOTO MY_END
```


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
- [x] Handle if user does not have javascript allowed
- [x] Add exemples
- [x] Enhance the display
- [x] Make the emulator faster and the UI responsive

Asm Language improvements
- [x] Add DEFINE for preprocessing data
- [x] Handle chars when defining A register
- [x] Add labels for better jumps
- [x] Add a text section that puts constants into memory
- [ ] Replicate the C stdlib functions in ASM
- [ ] Add a way to include another file to the project
- [x] Implement stack system
- [ ] Use WASM to make execution faster
- [ ] Add length calculation macro in TEXT
- [ ] Really put data byte by byte into memory
- [ ] Add code snippets like `init.stack` or `pop.A`, `push.D`

C Language improvements
- [ ] Handle any kind of C variables and C variable definition (e.g. `char *test = "Hello World"` abd `char test[12] = "Hello World!"` should do the same thing)
- [ ] Handle multi-arg functions call + returns using macros
- [ ] Add for and while loops
- [ ] Add if else conditions
- [ ] Add ability to do chained conditions
- [ ] Do lexical analyser


Known Bugs
- [x] Can't add labels with a comment on the same line
- [ ] Can't call a function with a quoted char as arg in C code
- [x] Writing 'if (' or 'for' inside of the code editor is causing a crash [fixed here](https://github.com/4RE5group/virtualArch/commit/30b30e21a673cb056dc449a8d7bb0adee8759752)
- [ ] Some C instructions are declared as errors/unrecognized. We need to fix C instruction types recognition
- [ ] When running C code, the line highlight isn't right
- [ ] `for (int i = j; i < 5; i++)` is causing an error. Need to define i to 0 in `TEXT` section then define it before the for
- [ ] Cant stack 2 `for`. The compiler comments the second for
- [ ] `for` loops does not initialize var to the given value (only placed in `TEXT`)
- [x] `; JMP` operation is consierated as a number input instead of an instruction
