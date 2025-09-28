/*
    4re5 group, all rights reserved.
*/


// definitions
const RAMSIZE = 1048576; // ram size in bytes



// listing of all memory ranges mapped
const memoryMap = [];
// rom containing program
var rom = [];


// device virtual memory
const ram = {
    _memory: new Array(RAMSIZE).fill(0),
    _mapping: [],
    get read()
    {
        // verify ram index
        let result = null;
        this._mapping.forEach(map => {
            if (map["request_mode"].includes("R") && map["start_offset"] <= registers.a < map["stop_offset"])
            {
                result = map["callback"](registers.a, "R", 0);
                return (result);
            }
        });
        if (result === null && this._memory.length > registers.a && registers.a >= 0)
            return (this._memory[registers.a]);
        else if (result != null) // return mapped memory
            return (result);
        return (-1);
    },
    set write(v)
    {
        // verify ram index
        let result = null;
        this._mapping.forEach(map => {
            if (map["request_mode"].includes("W") && map["start_offset"] <= registers.a < map["stop_offset"])
            {
                map["callback"](registers.a, "W", v);
                result = 0;
                return;
            }
        });
        if (result === null && this._memory.length > registers.a && registers.a >= 0)
        {
            this._memory[registers.a] = v;
        }
    }
};

const registers = {
    // a
    _a: 0x0000000000000000,
    get a() { return this._a;},
    set a(v) { this._a = v; },

    // d
    _d: 0x0000000000000000,
    get d() { return this._d; },
    set d(v) { this._d = v; },

    // e
    _e: 0x0000000000000000,
    get e() { return this._e; },
    set e(v) { this._e = v; },

    // f
    _f: 0x0000000000000000,
    get f() { return this._f; },
    set f(v) { this._f = v; },

    // *a (custom register)
    get a_ptr() {
        return (ram.read);
    },
    set a_ptr(v) {
        ram.write = v;
    },

    // pc
    _pc: 0x0000000000000001, // program counter first line = 1
    get pc() { return this._pc; },
    set pc(v) { this._pc = v; }
};

/*
    Add a memory mapping from start_offset to stop_offset that will be triggered if accessed/edited
    e.g. ranges goes from index = 3 (included) to index = 6 (excluded) 
*/
function addMemoryMapping(name, request_mode, start_offset, stop_offset, callback)
{
    if (start_offset >= 0 && start_offset < RAMSIZE && 
        stop_offset >= 0 && stop_offset < RAMSIZE  &&
        start_offset <= stop_offset)
    {
        let map = new Map();
        map["name"] = name;
        map["request_mode"] = request_mode.toUpperCase();
        map["start_offset"] = start_offset;
        map["stop_offset"] = stop_offset;
        map["callback"] = callback;
        ram._mapping.push(map);
        console.log("added a new mapping from "+start_offset+" to "+stop_offset+" type: "+request_mode);
    }
    else
    {
        console.error("error: invalid memory range");
        return (-1);
    }
}



// opcode format:
// 16 bits
// ci
// ci  e  f * - u op1 op0 zx sw a d *a lt eq gt
//
// l2 == 0    => D     l2 == 1   => E    (left term)
// r2 == 0    => A     r2 == 1   => F    (right term)
function    asm_exec_opcode(opcode)
{
    if (typeof(opcode) != 'number')
    {
        console.error("invalid asm op code input!");
        return;
    }

    let ci =            Number(opcode & (1 << 15))?1:0;
    let pointer =       Number(opcode & (1 << 12))?1:0;
    let l2 =            Number(opcode & (1 << 14))?1:0;
    let r2 =            Number(opcode & (1 << 13))?1:0;
    let destination =   (opcode & parseInt("0000000000111000", 2)) >> 3;
    let calculation =   (opcode & parseInt("0000011111000000", 2)) >> 6;
    let condition =     (opcode & parseInt("0000000000000111", 2));
    
    if (ci === 0) // set default register to value
        registers.a = Number(opcode & (~(1 << 15)));
    else
    {
        let u =         Number(calculation & (1 << 4))?1:0;
        let op1 =       Number(calculation & (1 << 3))?1:0;
        let op0 =       Number(calculation & (1 << 2))?1:0;
        let zx =        Number(calculation & (1 << 1))?1:0;
        let sw =        Number(calculation & 1)?1:0;
        
        var output = 0;
        var left_term = (l2 == 0)?registers.d:registers.e;
        var right_term = (r2 == 0)?registers.a:registers.f;

        if (pointer === 1) {
            right_term = registers.a_ptr;
        }


        // left term
        if (zx === 1)
            left_term = 0;
        
        // right term
        if (u === 1 && op0 === 1)
            right_term = 1;
        
        // swap left and right terms
        if (sw === 1)
        {
            var tmp = right_term;
            right_term = left_term;
            left_term = tmp;
        }
 
        
        if (u === 1) // u = 1  arithmetic operation
        {
            // else if (op0 === 1 && sw === 1)
            //     left_term = 1;

            if (op1 === 1) // substraction
                output = left_term - right_term;
            else // addition
                output = left_term + right_term;
        }
        else // logic operation
        {
            if (op1 === 1) 
            {
                if (op0 === 1) // invert
                    output = ~left_term;
                else // xor
                    output = left_term ^ right_term;
            }
            else
            {
                if (op0 === 1) // or
                    output = left_term | right_term;
                else // and
                    output = left_term & right_term;
            }
        }

        let to_a = Number(destination & (1 << 2))?1:0;
        let to_d = Number(destination & (1 << 1))?1:0;
        let to_a_ptr = Number(destination & 1)?1:0;

        if (to_a === 1) {
            registers.a = output;
        }
        if (to_a_ptr === 1) {
            registers.a_ptr = output;
        }
        if (to_d === 1) {
            registers.d = output;
        }

        // conditions of jump
        let lt = Number(condition & (1 << 2))?1:0;
        let eq = Number(condition & (1 << 1))?1:0;
        let gt = Number(condition & 1)?1:0;

        if ((lt === 1 && output < 0) || (eq === 1 && output === 0) || (gt === 1 && output > 0))
        {
            registers.pc = output;
        }
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
        let to_a = 0;
        let to_d = 0;
        let to_a_ptr = 0;
        let dests_parts = destination.split(",");
        if (dests_parts.length >= 0)
        {
            for (let k=0; k<dests_parts.length; k++)
            {
                dests_parts[k] = dests_parts[k].trim();
                if (dests_parts[k] === "A") 
                    to_a = 1;
                else if (dests_parts[k] === "D") 
                    to_d = 1;
                else if (dests_parts[k] === "*A") 
                    to_a_ptr = 1;
                else
                {
                    console.error(`error: invalid destination: '${dests_parts[k]}'`);
                    return (-1);
                }
            }
        }

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

    for (let i=0; i<1; i++) { // used like a goto
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
            let right_term = operation.replace(operation_symbol, "").trim();
            
            // if    sw = 0  A = ~D
            // else  sw = 1  A = ~A
            if (right_term === "D")
                sw = 0;
            else if (right_term === "A")
                sw = 1;
            else if (right_term === "*A")
            {
                sw = 1;
                pointer = 1;
            }
            else {
                console.error("error: invalid operation: "+operation);
                return (-1);
            }
            break;
        }
        else if (isNumeric(operation)) // if that's a constant assignation
        {
            if (destination === "A" && !condition)
                return Number(operation); // return opcode
            if (operation === "0") // A = 0   =>  A = 0 & D
            {
                operation_symbol = "&";
                u = 0;
                op0 = 0; // and
                op1 = 0; // and
                zx = 1; // activate the zero bit
                sw = 0;
                operation = "A&0";
            } 
            else if (operation === "1") // A = 1   =>  A = 0 + 1
            {
                operation_symbol = "+";
                u = 1;
                op1 = 0; // addition
                op0 = 1; // activate the one as right term
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
            if (operation === "D") // A = D   =>   A = D + 0
            {
                operation += "+0"; 
            }
            else if (operation === "A" || operation === "*A")
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
        if (left_term === "0") {
            zx = 1;
        }
        else if (right_term === "0")
        {
            zx = 1;
            sw = 1; // swap to make the 0 appear in right term
        }

        if (operation_symbol === "+" || operation_symbol === "-") // only if operation type is addition or substraction
        {
            u = 1;
            // check for 1 extend
            if (left_term === "1") {
                op0 = 1;
                sw = 1;
            }
            else if (right_term === "1")
            {
                op0 = 1;
                sw = 0;
            }
        }

        // check for terms swap (D+A default, A+D swap)
        // normal case (no swap)
        if ((left_term === "D" || left_term === "0" || (left_term === "1" && u === 1))
                && (right_term === "A" || right_term === "*A" || (right_term === "1" && u === 1))) 
        {
            if (right_term === "*A")
                pointer = 1;
        } // swapped version
        else if (((left_term === "1" && u === 1) || left_term === "A" || left_term === "*A")
                && (right_term === "D" || right_term === "0" || (right_term === "1" && u === 1)))
        {
            sw = 1;
            if (left_term === "*A")
                pointer = 1;
        }
        else {
            console.error("invalid operation: '"+operation+"'");
            return (-1);
        }
    }}
    // set calculation bits
    opcode |= ((u << 4) | (op1 << 3) | (op0 << 2) | (zx << 1) | sw) << 6;
    // pointer
    opcode |= (pointer << 12);

    // Parse jump condition
    if (condition)
    {
        let lt = (condition === "JLT" || condition === "JLE" || condition === "JMP") ? 1 : 0;
        let eq = (condition === "JEQ" || condition === "JLE" || condition === "JMP" || condition === "JGE") ? 1 : 0;
        let gt = (condition === "JGT" || condition === "JGE" || condition === "JMP") ? 1 : 0;

        if (lt === 0 && eq === 0 && gt === 0)
        {
            console.error("error: invalid condition: '"+condition+"'");
            return (-1);
        }
        // Set condition bits (bits 2-0)
        opcode |= ((lt << 2) | (eq << 1) | gt);
    }

    return (opcode);
}


function displayRom()
{
    for(let i=0; i<rom.length; i++)
    {
        if (rom[i] === null)
            continue;
        console.log(" ci   -   -   *   -   u op1 op0  zx  sw   a   d  *a  lt  eq  gt");
        let line = "";
        let binary = (rom[i] >>> 0).toString(2);
        let start_index = Math.abs(binary.length - 16);
        if (start_index != 0)
        {
            for (let k=0; k<start_index; k++)
                binary="0"+binary;
        }
        for(let b=0; b<16; b++)
        {
            line+="  "+binary[b]+" ";
        }
        console.log(line);
    }
}