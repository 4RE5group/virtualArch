/*
    virtualArch C compiler
*/

function    getAsmBuiltinFunc(funcName, arg)
{
    switch(funcName)
    {
        case 'asm': // direct asm execution
            return (`   ${arg.replace(/^\"+|\"+$/g, '')}\n`);
        case 'label': // direct asm label writing
            return (`${arg}:\n`);
        case 'write_char':
            return (
`    # ----- write char -----
    ${parseArg(arg)}
    A = WRITE
    *A = D     # write char to screen
`);
        case 'set_cursor':
            return (
`    # ----- set cursor -----
    ${parseArg(arg)}
    A = CURSOR
    *A = D      # set cursor
`);
        case 'goto':
            return (
`    # ----- goto -----
    A = ${arg}
    A; JMP
`);
    }
}

// this function generates an set of asm instructions to put the given argument into the D register.
// arg is a C string, char, pointer or any other C types (should be handled).
function    parseArg(arg)
{
    arg = arg.trim();
    if (arg.includes("[") && arg.endsWith("]")) // if pointer operation
    {
        let offset = arg.split("[")[1].trim().split("]")[0].trim();
        let base_address = arg.split("[")[0].trim();

        // pointed data writing
        return (`A = ${offset}
    D = ${isNumeric(offset)?'':'*'}A  # copy offset
    A = ${base_address} # address of char in memory
    A = A + D # now address of char at offset
    D = *A     # copy char to D register
`);
    } else if (isNumeric(arg) || (arg.startsWith("'") && arg.endsWith("'") && arg.length === 3)) {
        // basic data writing
        return (`A = ${arg}
    D = A
`);
    } else { // arg is a pointer to a value (a variable)
        return (`A = ${arg}
    D = *A
`);
    }
}

function    function_to_asm(key, value)
{
    let ASM_CODE = "";
    if (!key.startsWith("IF") && !key.startsWith("ELSE")) // if and else sub functions need to have their labels after their code (for jumps)
        ASM_CODE = key+":\n"; // add function definition asm code

    let lines = value.split("\n");
    const var_assignation_regex = /^\s*[a-zA-Z0-9_-]*\s*\=\s*().*\s*\;$/g;

    lines.forEach((line, i) => {
        line = line.trim();
        // skip sub functions (will be processed after)
        if (line.startsWith("%%%") && line.endsWith("%%%"))
        {
            ASM_CODE += line;
            return;
        }
        // skip empty lines or comments
        if (line === "" || line.startsWith("//") || line === "{" || line === "}") {
            return;
        }
        if (!line.endsWith(";") && !line.startsWith("if") && !line.startsWith("else"))
        {
            console.error(`error: invalid line in ${key} at line ${i}\n    => ${line}`);
            return (-1);
        }
        // handle different C operation types 
        if (var_assignation_regex.test(line)) // assignation
        {
            console.log(line+" is a var assign");
            let varname = line.split("=")[0].trim().replaceAll(';', "");
            let varvalue= line.split("=")[1].trim().replaceAll(';', "");
            ASM_CODE += 
`    # ----- write var -----
    A = ${varvalue} # copy value to D
    D = A
    A = ${varname}  # write to memory
    *A = D
    `;
        }
        else if (line.endsWith("++;") || line.endsWith("--;")) // incrementation
        {
            let varname = line.split(line.includes("++")?"++":"--")[0].trim().replaceAll(';', "");
            ASM_CODE += 
`    # ----- inc/dec var -----
    A = ${varname}  # write to memory
    *A = *A ${line.includes("++")?'+':'-'} 1 # increment
    `;
        }
        else if (line.includes("(") && line.includes(")")) // function call
        {
            let funcName = line.split("(")[0].trim();
            let funcArg = line.split("(")[1].trim().split(")")[0].trim();
            ASM_CODE += getAsmBuiltinFunc(funcName, funcArg);
        }
        else if (line.endsWith(";"))
        {
            console.error(`Unknown statement: ${line}`);
        }
        else
        {
            console.error(`Unrecognized: ${line}`);
        }
    });

    if (key.startsWith("IF") || key.startsWith("ELSE")) // add label after code (needed for jumps)
        ASM_CODE += key+":\n";

    return ASM_CODE;
}

// this function generates asm 
function    generateIfAsm(condition, if_label)
{
    let ASM_CODE = "# ----- start of for's reversed if condition -----\n";
    const conditionRegex = /^\s*(.*)\s*(>|<|<=|>=|==|!=)\s*(.*)\s*$/;
    if (conditionRegex.test(condition))
    {
        const match = condition.match(conditionRegex);
        const left_term = match[1];
        let operand = match[2];
        const right_term = match[3];
        
        // get opposite of operand
        operand = ((operand) => {
            switch(operand)
            {
                case "==": return "JNE"; // !=
                case "!=": return "JEQ"; // ==

                case "<": return "JGE";  // >=
                case ">": return "JLE";  // <=

                case "<=": return "JGT";  // >
                case ">=": return "JLT";  // <
            }
        })(operand);

        ASM_CODE += parseArg(left_term);                // add left term to D register
        ASM_CODE += "A = TMP0\n*A = D\n";               // save D to TMP0 buffer

        ASM_CODE += parseArg(right_term);               // add right term to D register
        ASM_CODE += "A = TMP0\nD = *A - D\n";           // calculate the difference between left and right term (to make the condition compare left term and 0)

        ASM_CODE += `A = ${if_label}\nD; ${operand}\n`; // generate the jump condition to the end of the if
    } else {
        console.error("Error: invalid condition: "+condition);
    }
    // simple example if (i == 12) asm code
    // A = i
    // D = *A # left term

    // A = 12 # right term
    // D = D - A
    
    // A = LABEL # jump
    // D; JEQ
    return ASM_CODE;
}


function    compile(code)
{
    const functionHeaderRegex = /(\w+)\s*\([^)]*\)\s*{/g;

    // Control structures to treat as "functions"
    const controlStructureRegex = /\b(for|if|while|else)\s*(\([^)]*\))?\s*{([^}]*)}/;

    const functions = new Map();
    let variables = new Map();
    let match;

    // handle if-else, while and for loops (treated as sub functions)
    let controlIndex = 0;
    while ((match = controlStructureRegex.exec(code)) !== null)
    {
        const keyword = match[1].trim();                // e.g., if, while
        const condition = match[2].trim() || "";        // e.g., (x > 0)
        let blockBody = match[3].trim();                // content inside { ... }

        const uniqueLabel = `${keyword.toUpperCase()}_${controlIndex++}`;

        if (keyword == "for")
        {
            let for_elements = condition.replace('(', '').replace(')', '').split(";");
            if (for_elements.length != 3) // verify if structure is correct
            {
                console.error(`Error: invalid instruction in ${keyword}`);
                return (-1);
            }
            let for_initalisation = for_elements[0].trim();
            let for_condition = for_elements[1].trim();
            let for_incrementation = for_elements[2].trim();
            let if_sub_func_label = `IF_${controlIndex++}`;
            let if_asm_code = "";

            // this creates a if sub function that skip its content if the opposite of the condition is true
            generateIfAsm(for_condition, if_sub_func_label).split("\n")
            .forEach((line) => {
                if_asm_code += `asm("${line.trim()}");\n`;
            });

            // parse for sub function
            blockBody = `
${for_initalisation};
${if_asm_code}
    ${blockBody}
    ${for_incrementation};
    goto(${uniqueLabel});
label(${if_sub_func_label});
`;
        }
        functions.set(uniqueLabel, blockBody);
        code = code.replace(controlStructureRegex, `%%%SUB_FUNC:${uniqueLabel}%%%`);
    }

    // save functions and it's code separatly
    while ((match = functionHeaderRegex.exec(code)) !== null)
    {
        const functionName = match[1];
        let braceStart = code.indexOf('{', functionHeaderRegex.lastIndex - 1);

        if (braceStart === -1) continue;

        let braceCount = 1;
        let i = braceStart + 1;

        while (i < code.length && braceCount > 0) { // count braces to find the right closing brace of the function
            if (code[i] === '{') braceCount++;
            else if (code[i] === '}') braceCount--;
            i++;
        }

        if (braceCount === 0) {
            let functionBody = code.slice(braceStart + 1, i - 1).trim();
            let commentedBody = '';
            let j = 0;

            while (j < functionBody.length)
            {
                // detect control structures
                const controlMatch = functionBody.slice(j).match(/^(for|if|while|else)\b/);

                if (controlMatch) {
                    const keyword = controlMatch[1];
                    let start = j + keyword.length;

                    // skip whitespace
                    while (/\s/.test(functionBody[start])) start++;

                    // if there is a condition (for, if, while)
                    let condition = '';
                    if (functionBody[start] === '(')
                    {
                        let parens = 1;
                        start++; // skip the '('
                        let condStart = start;
                        while (start < functionBody.length && parens > 0)
                        {
                            if (functionBody[start] === '(') parens++;
                            else if (functionBody[start] === ')') parens--;
                            start++;
                        }
                        condition = functionBody.slice(condStart - 1, start); // include opening '('
                    }

                    // skip whitespace
                    while (/\s/.test(functionBody[start])) start++;

                    // now find the code block
                    if (functionBody[start] === '{')
                    {
                        let braces = 1;
                        start++; // skip the opening {
                        while (start < functionBody.length && braces > 0)
                        {
                            if (functionBody[start] === '{') braces++;
                            else if (functionBody[start] === '}') braces--;
                            start++;
                        }

                        const fullBlock = functionBody.slice(j, start);
                        commentedBody += `// ${fullBlock.replace(/\n/g, '\n// ')}\n`;
                        j = start;
                    }
                    else
                    {
                        // single-line control statement without braces
                        let stmtEnd = functionBody.indexOf(';', start);
                        if (stmtEnd == -1)
                        {
                            console.error("Error: invalid statement detected (may be caused by wront syntax of a for/if/while)");
                            j++;
                            continue;
                        }
                        const fullStmt = functionBody.slice(j, stmtEnd + 1);
                        commentedBody += `// ${fullStmt}\n`;
                        j = stmtEnd + 1;
                    }
                } else {
                    // copy character by character if no control structure is found
                    commentedBody += functionBody[j];
                    j++;
                }
            }
            functions.set(functionName, commentedBody.trim());
            functionHeaderRegex.lastIndex = i; // continue after this function
        } else {
            console.error(`Unmatched braces in function ${functionName}`);
        }
    }


    

    // check for variables
    functions.forEach((value, key) => {
        let lines = value.split("\n");
        lines.forEach((line, k) => {
            line = line.trim();
            if (line.startsWith("//") || line === "")
                return;
            const varRegex = /\b\w+(?:\s*\*\s*|\s+)\s*(\w+)\s*=\s*([^;\n]+)/g;
            while ((match = varRegex.exec(line)) !== null) {
                const name = match[1]; // variable name
                const value = match[2]; // variable value
                variables.set(name, value);
                lines[k] = "// " + lines[k].trim(); // comment these lines
            }
        });
        functions.set(key, lines.join("\n")); // update input
    });

    // generate text section
    let ASM_CODE = `# compiled using virtualArch C compiler
${(variables.size > 0)?"TEXT:":""}`;
    variables.forEach((value, key) => {
        ASM_CODE += `\n    ${key} ${value}`;
    });

    ASM_CODE+="\n"; // add new line afte text section


    // parse code
    const sub_func_regex = /\%\%\%SUB_FUNC:(FOR|IF|ELSE|WHILE)_(\d+)\%\%\%/g;
    functions.forEach((value, key) => {
        if (/(FOR|IF|ELSE|WHILE)_[0-9]*/.test(key)) // skip sub functions (will be processed after)
            return;
        let func = function_to_asm(key, value);
        while (sub_func_regex.test(func))
        {
            func = func.replace(sub_func_regex, (match, type, number) => {
                const token = `${type}_${number}`;
                const replacement = `${function_to_asm(token, functions.get(token))}\n`;
                return replacement;
            });
            console.log(func);
        }
        ASM_CODE += func+"\n";
    });
    console.log("generated ASM code:");
    console.log(ASM_CODE);
    console.log(functions);
    return (ASM_CODE);
}