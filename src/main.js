var rom = [
];

// const registers = {
//   // Internal storage for 64-bit registers
//   _rax: 0x0000000000000000,
//   _rbx: 0x0000000000000000,
//   _rcx: 0x0000000000000000,
//   _rdx: 0x0000000000000000,
//   _rsi: 0x0000000000000000,
//   _rdi: 0x0000000000000000,
//   _rbp: 0x0000000000000000,
//   _rsp: 0x0000000000000000,
//   _r8:  0x0000000000000000,
//   _r9:  0x0000000000000000,
//   _r10: 0x0000000000000000,
//   _r11: 0x0000000000000000,
//   _r12: 0x0000000000000000,
//   _r13: 0x0000000000000000,
//   _r14: 0x0000000000000000,
//   _r15: 0x0000000000000000,

//   // Getters and setters for 64-bit registers
//   get rax() { return this._rax; },
//   set rax(value) { this._rax = value & 0xFFFFFFFFFFFFFFFF; },
//   get rbx() { return this._rbx; },
//   set rbx(value) { this._rbx = value & 0xFFFFFFFFFFFFFFFF; },
//   get rcx() { return this._rcx; },
//   set rcx(value) { this._rcx = value & 0xFFFFFFFFFFFFFFFF; },
//   get rdx() { return this._rdx; },
//   set rdx(value) { this._rdx = value & 0xFFFFFFFFFFFFFFFF; },
//   get rsi() { return this._rsi; },
//   set rsi(value) { this._rsi = value & 0xFFFFFFFFFFFFFFFF; },
//   get rdi() { return this._rdi; },
//   set rdi(value) { this._rdi = value & 0xFFFFFFFFFFFFFFFF; },
//   get rbp() { return this._rbp; },
//   set rbp(value) { this._rbp = value & 0xFFFFFFFFFFFFFFFF; },
//   get rsp() { return this._rsp; },
//   set rsp(value) { this._rsp = value & 0xFFFFFFFFFFFFFFFF; },
//   get r8() { return this._r8; },
//   set r8(value) { this._r8 = value & 0xFFFFFFFFFFFFFFFF; },
//   get r9() { return this._r9; },
//   set r9(value) { this._r9 = value & 0xFFFFFFFFFFFFFFFF; },
//   get r10() { return this._r10; },
//   set r10(value) { this._r10 = value & 0xFFFFFFFFFFFFFFFF; },
//   get r11() { return this._r11; },
//   set r11(value) { this._r11 = value & 0xFFFFFFFFFFFFFFFF; },
//   get r12() { return this._r12; },
//   set r12(value) { this._r12 = value & 0xFFFFFFFFFFFFFFFF; },
//   get r13() { return this._r13; },
//   set r13(value) { this._r13 = value & 0xFFFFFFFFFFFFFFFF; },
//   get r14() { return this._r14; },
//   set r14(value) { this._r14 = value & 0xFFFFFFFFFFFFFFFF; },
//   get r15() { return this._r15; },
//   set r15(value) { this._r15 = value & 0xFFFFFFFFFFFFFFFF; },

//   // Derived 32-bit registers (e.g., eax from rax)
//   get eax() { return this._rax & 0xFFFFFFFF; },
//   get ebx() { return this._rbx & 0xFFFFFFFF; },
//   get ecx() { return this._rcx & 0xFFFFFFFF; },
//   get edx() { return this._rdx & 0xFFFFFFFF; },
//   get esi() { return this._rsi & 0xFFFFFFFF; },
//   get edi() { return this._rdi & 0xFFFFFFFF; },
//   get ebp() { return this._rbp & 0xFFFFFFFF; },
//   get esp() { return this._rsp & 0xFFFFFFFF; },
//   get r8d() { return this._r8 & 0xFFFFFFFF; },
//   get r9d() { return this._r9 & 0xFFFFFFFF; },
//   get r10d() { return this._r10 & 0xFFFFFFFF; },
//   get r11d() { return this._r11 & 0xFFFFFFFF; },
//   get r12d() { return this._r12 & 0xFFFFFFFF; },
//   get r13d() { return this._r13 & 0xFFFFFFFF; },
//   get r14d() { return this._r14 & 0xFFFFFFFF; },
//   get r15d() { return this._r15 & 0xFFFFFFFF; },

//   // Derived 16-bit registers (e.g., ax from rax)
//   get ax() { return this._rax & 0xFFFF; },
//   get bx() { return this._rbx & 0xFFFF; },
//   get cx() { return this._rcx & 0xFFFF; },
//   get dx() { return this._rdx & 0xFFFF; },
//   get si() { return this._rsi & 0xFFFF; },
//   get di() { return this._rdi & 0xFFFF; },
//   get bp() { return this._rbp & 0xFFFF; },
//   get sp() { return this._rsp & 0xFFFF; },
//   get r8w() { return this._r8 & 0xFFFF; },
//   get r9w() { return this._r9 & 0xFFFF; },
//   get r10w() { return this._r10 & 0xFFFF; },
//   get r11w() { return this._r11 & 0xFFFF; },
//   get r12w() { return this._r12 & 0xFFFF; },
//   get r13w() { return this._r13 & 0xFFFF; },
//   get r14w() { return this._r14 & 0xFFFF; },
//   get r15w() { return this._r15 & 0xFFFF; },

//   // Derived 8-bit registers (e.g., al, ah from rax)
//   get al() { return this._rax & 0xFF; },
//   get bl() { return this._rbx & 0xFF; },
//   get cl() { return this._rcx & 0xFF; },
//   get dl() { return this._rdx & 0xFF; },
//   get sil() { return (this._rsi >> 0) & 0xFF; },
//   get dil() { return (this._rdi >> 0) & 0xFF; },
//   get bpl() { return (this._rbp >> 0) & 0xFF; },
//   get spl() { return (this._rsp >> 0) & 0xFF; },
//   get r8b() { return this._r8 & 0xFF; },
//   get r9b() { return this._r9 & 0xFF; },
//   get r10b() { return this._r10 & 0xFF; },
//   get r11b() { return this._r11 & 0xFF; },
//   get r12b() { return this._r12 & 0xFF; },
//   get r13b() { return this._r13 & 0xFF; },
//   get r14b() { return this._r14 & 0xFF; },
//   get r15b() { return this._r15 & 0xFF; },

//   // High 8-bit registers (e.g., ah from rax)
//   get ah() { return (this._rax >> 8) & 0xFF; },
//   get bh() { return (this._rbx >> 8) & 0xFF; },
//   get ch() { return (this._rcx >> 8) & 0xFF; },
//   get dh() { return (this._rdx >> 8) & 0xFF; },
// };

const registers = {
    _a: 0x0000000000000000,
    get a() { return this._a; },
    set a(v) { this._a = v; },

    _d: 0x0000000000000000,
    get d() { return this._d; },
    set d(v) { this._d = v; },

    _a_ptr: 0x0000000000000000,
    get a_ptr() { return this._a_ptr; },
    set a_ptr(v) { this._a_ptr = v; },

    _pc: 0x0000000000000001, // program counter first line = 1
    get pc() { return this._pc; },
    set pc(v) { this._pc = v; }
};

function    set_register(name, value)
{
    switch (name)
    {
        case 'a':
            registers.a = value;
            break;
        case 'd':
            registers.d = value;
            break;
        case '*a':
            registers.a_ptr = value;
            break;
    }
}

// opcode format:
// 16 bits
// ci - - * - u op1 op0 zx sw a d *a lt eq gt
function    asm_exec_opcode(opcode)
{
    if (typeof(opcode) != 'number')
    {
        console.error("invalid asm op code input!");
        return;
    }

    let ci =            Number(opcode & (1 << 15))?1:0;
    let pointer =       Number(opcode & (1 << 12))?1:0;
    let destination =   (opcode & parseInt("0000000000111000", 2)) >> 3;
    let calculation =   (opcode & parseInt("0000011111000000", 2)) >> 6;
    let condition =     (opcode & parseInt("0000000000000111", 2));
    
    if (ci == 0) // set default register to value
        registers.a = Number(opcode & (~(1 << 15)));
    else
    {
        let u =         Number(calculation & (1 << 4))?1:0;
        let op1 =       Number(calculation & (1 << 3))?1:0;
        let op0 =       Number(calculation & (1 << 2))?1:0;
        let zx =        Number(calculation & (1 << 1))?1:0;
        let sw =        Number(calculation & 1)?1:0;
        
        var output = 0;
        let left_term = registers.d;
        let right_term = registers.a;

        if (pointer == 1)
            right_term = registers.a_ptr;


        // left term
        if (zx == 1)
            left_term = 0;
        
        // swap left and right terms
        if (sw == 1)
        {
            let tmp = left_term;
            right_term = left_term;
            left_term = tmp;
        }
        
        if (u == 1) // u = 1  arithmetic operation
        {
            // right term
            if (op0 == 1 && sw == 0)
                right_term = 1;
            else if (op0 == 1 && sw == 1)
                left_term = 1;

            if (op1 == 1) // substraction
                output = left_term - right_term;
            else // addition
                output = left_term + right_term;
        }
        else // logic operation
        {
            if (op1 == 1) 
            {
                if (op0 == 1) // invert
                    output = ~left_term;
                else // xor
                    output = left_term ^ right_term;
            }
            else
            {
                if (op0 == 1) // or
                    output = left_term | right_term;
                else // and
                    output = left_term & right_term;
            }
        }

        let to_a = Number(destination & (1 << 2))?1:0;
        let to_d = Number(destination & (1 << 1))?1:0;
        let to_a_ptr = Number(destination & 1)?1:0;

        let written_registers = 0;
        if (to_a == 1) {
            registers.a = output;
        }
        if (to_a_ptr == 1) {
            registers.a_ptr = output;
        }
        if (to_d == 1) {
            registers.d = output;
        }

        // conditions of jump
        let lt = Number(condition & (1 << 2))?1:0;
        let eq = Number(condition & (1 << 1))?1:0;
        let gt = Number(condition & 1)?1:0;

        if ((lt == 1 && output < 0) || (eq == 1 && output == 0) || (gt == 1 && output > 0))
            registers.pc = output;
    }
}

function asm_to_opcode(input)
{
    if (typeof input !== 'string')
    {
        console.error("invalid asm input: expected a string.");
        return (-1);
    }

    // Initialize opcode
    let opcode = 0;

    // Parse destination, operation, and condition
    let destination = null;
    let operation = input;
    let condition = null;

    if (input.includes("="))
    {
        const parts = input.split("=");
        destination = parts[0].trim().toUpperCase();
        operation = parts.slice(1).join("=").trim().toUpperCase();
    }

    if (operation.includes(";"))
    {
        const parts = operation.split(";");
        operation = parts[0].trim().toUpperCase();
        condition = parts[1].trim().toUpperCase();
    }

    // Set the CI bit (bit 15) to 1 if there's an operation
    if (operation)
        opcode |= (1 << 15);

    // Parse destination registers
    if (destination)
    {
        let to_a = destination.includes("A") ? 1 : 0;
        let to_d = destination.includes("D") ? 1 : 0;
        let to_a_ptr = destination.includes("*A") ? 1 : 0;

        // Set destination bits (bits 4-3)
        opcode |= ((to_a << 2) | (to_d << 1) | to_a_ptr) << 3;
    }

    // Parse operation
    let pointer = 0;
    let u = 0; // arithmetic operation
    let op1 = 0;
    let op0 = 0;
    let zx = 0; // zero extend
    let sw = 0; // swap

    if (operation)
    {
        let operation_symbol = "";

        // parse the operation type
        if (operation.includes("+"))
        {
            u = 1; // addition
            operation_symbol = "+";
        }
        else if (operation.includes("-"))
        {
            u = 1; // subtraction
            op1 = 1;
            operation_symbol = "-";
        } 
        else if (operation.includes("&"))
        {
            // AND
            operation_symbol = "&";
        } 
        else if (operation.includes("|")) 
        {
            op0 = 1; // OR
            operation_symbol = "|";
        } 
        else if (operation.includes("^"))
        {
            // XOR
            op1 = 1;
            operation_symbol = "^";
        } 
        else if (operation.includes("~"))
        {
            // NOT
            op1 = 1;
            op0 = 1;
            operation_symbol = "~";
        }
        else if (isNumeric(operation)) // if that's a constant assignation
        {
            if (destination == "A" && !condition)
                return Number(operation); // return opcode
            if (operation == "0") // A = 0   =>  A = 0 & D
            {
                operation_symbol = "&";
                u = 0;
                op0 = 0; // and
                op1 = 0; // and
                zx = 1; // activate the zero bit
                sw = 0;
                operation = "A&0";
            } 
            else if (operation == "1") // A = 1   =>  A = 0 + 1
            {
                operation_symbol = "+";
                u = 1;
                op0 = 0; // addition
                op1 = 1; // activate the one as right term
                zx = 1;  // activate the zero as left term
                sw = 0;
                operation = "0+1";
            }
            else
            {
                console.error(`invalid operation combined to condition: '${operation}', '${condition}'`);
                return (-1);
            }
        }
        else // no operation, only register copy
        {
            u = 1; // addition
            op0 = 0;
            operation_symbol = "+";
            if (operation == "D") // A = D   =>   A = D + 0
            {
                operation += "+0"; 
            }
            else if (operation == "A" || operation == "*A")
            {
                operation = "0+" + operation;
            }
        }

        let parts = operation.split(operation_symbol);
        if (parts.length != 2)
        {
            console.error(`error: invalid operation of type '${operation_symbol}': ${operation}`);
            return (-1);
        }
        let left_term = parts[0].trim();
        let right_term = parts[1].trim();
        
        // zx = 1   => 0 to left_term
        // op1 = 1  => 1 to right term only if addition/substraction mode

        // check for zero extend
        if (left_term == "0") {
            zx = 1;
        }
        else if (right_term == "0")
        {
            zx = 1;
            sw = 1; // swap to make the 0 appear in right term
        }

        if (operation_symbol == "+" || operation_symbol == "-") // only if operation type is addition or substraction
        {
            u = 1;
            // check for 1 extend
            if (left_term == "1") {
                op0 = 1;
                sw = 1;
            }
            else if (right_term == "1")
            {
                op0 = 1;
                sw = 0;
            }
        }

        // check for terms swap (D+A default, A+D swap)
        // normal case (no swap)
        if ((left_term == "D" || left_term == "0" || left_term == "1")
                && (right_term == "A" || right_term == "*A" || right_term == "1")) 
        {
            if (right_term == "*A")
                pointer = 1;
        } // swapped version
        else if ((left_term == "1" || left_term == "A" || left_term == "*A")
                && (right_term == "D" || right_term == "0" || right_term == "1"))
        {
            sw = 1;
            if (left_term == "*A")
                pointer = 1;
        }
        else {
            console.error("invalid operation: '"+operation+"'");
            return (-1);
        }

        // set calculation bits
        opcode |= ((u << 4) | (op1 << 3) | (op0 << 2) | (zx << 1) | sw) << 6;
        // pointer
        opcode |= (pointer << 12)
    }

    // Parse jump condition
    if (condition) {
        let lt = (condition == "JLT" || condition == "JLE" || condition == "JMP") ? 1 : 0;
        let eq = (condition == "JEQ" || condition == "JLE" || condition == "JMP" || condition == "JGE") ? 1 : 0;
        let gt = (condition == "JGT" || condition == "JGE" || condition == "JMP") ? 1 : 0;

        // Set condition bits (bits 2-0)
        opcode |= ((lt << 2) | (eq << 1) | gt);
    }

    return opcode;
}


function displayRom()
{
    for(let i=0; i<rom.length; i++)
    {
        console.log(" ci   -   -   *   -   u op1 op0  zx  sw   a   d  *a  lt  eq  gt");
        let line = "";
        let binary = (rom[i] >>> 0).toString(2);
        for(let b=0; b<16; b++)
        {
            line+="  "+binary[b]+" ";
        }
        console.log(line);
    }
}