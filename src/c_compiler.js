/*
    virtualArch C compiler
*/

function    getAsmBuiltinFunc(funcName, arg)
{
    switch(funcName)
    {
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
    }
}

function    parseArg(arg)
{
    arg = arg.trim();
    if (arg.includes("[") && arg.endsWith("]")) // if pointer operation
    {
        let offset = arg.split("[")[1].trim().split("]")[0].trim();
        let base_address = arg.split("[")[0].trim();
        if (!isNumeric(offset))
        {
            console.error("error: invalid pointer offset: '"+offset+"' '"+arg+"'");
            return (-1);
        }
        // pointed data writing
        return (`A = ${offset}
    D = A  # copy offset
    A = ${base_address} # address of char in memory
    A = A + D # now address of char at offset
    D = *A     # copy char to D register
`);
    } else if (isNumeric(arg)) {
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

function    compile(code)
{
    const functionRegex = /(\w+)\s*\([^)]*\)\s*(?:{([^}]*)}|[^;]+;)/g;

    const functions = new Map();
    let variables = new Map();
    let match;

    // fetch program functions code
    while ((match = functionRegex.exec(code)) !== null) {
        const functionName = match[1];
        const functionBody = match[2] ? match[2].trim() : '';
        functions.set(functionName,  functionBody);
    }
    
    // check for variables
    functions.forEach((value, key) => {
        let lines = value.split(";");
        lines.forEach((line, k) => {
            line = line.trim();
            const varRegex = /\b\w+(?:\s*\*\s*|\s+)\s*(\w+)\s*=\s*([^;\n]+)/g;
            while ((match = varRegex.exec(line)) !== null) {
                const name = match[1]; // variable name
                const value = match[2]; // variable value
                variables.set(name, value);
                lines[k] = "// " + lines[k].trim(); // comment these lines
            }
        });
        functions.set(key, lines.join(";\n")); // update input
    });

    // generate text section
    let ASM_CODE = `# compiled using virtualArch C compiler
${(variables.size > 0)?"TEXT:":""}`;
    variables.forEach((value, key) => {
        ASM_CODE += `\n    ${key} ${value}`;
    });

    ASM_CODE+="\n"; // add new line afte text section

    // parse code
    functions.forEach((value, key) => {
        ASM_CODE += key+":\n"; // add function definition asm code
        let lines = value.split("\n");
        let filteredLines = [];

        lines.forEach((line, i) => {
            line = line.trim();

            // skip empty lines or comments
            if (line === "" || line.startsWith("//") || line === "{" || line === "}") {
                return;
            }

            if (!line.endsWith(";"))
            {
                console.error(`error: invalid line in ${key}:${i}\n    ${line}`);
                return -1;
            }

            // handle different C operation types
            if (line.includes("="))
            {
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
            else if (line.includes("++") || line.includes("--"))
            {
                let varname = line.split(line.includes("++")?"++":"--")[0].trim().replaceAll(';', "");
                ASM_CODE += 
`    # ----- inc/dev var -----
    A = ${varname}  # write to memory
    *A = *A ${line.includes("++")?'+':'-'} 1 # increment
    `;
            }
            else if (line.includes("(") && line.includes(")") && !line.includes("="))
            {
                let funcName = line.split("(")[0].trim();
                let funcArg = line.split("(")[1].trim().split(")")[0].trim();
                // if (functions.get(funcName) === undefined)
                // {
                //     console.error(`error: could not find function '${funcName}' at ${key}:${i}`);
                //     return (-1);
                // }
                console.log(funcName, funcArg);
                ASM_CODE += getAsmBuiltinFunc(funcName, funcArg);
            }
            else if (line.endsWith(";"))
            {
                // Other statements (e.g., return x; or break;)
                console.log(`Statement: ${line}`);
            }
            else
            {
                // Unrecognized line (e.g., labels, preprocessor directives, etc.)
                console.log(`Unrecognized: ${line}`);
            }

            filteredLines.push(line); // Add non-empty, non-comment lines to filteredLines
        });

        // Update the function's code with filtered and processed lines
        functions.set(key, filteredLines.join("\n"));
    });

    console.log(ASM_CODE);
}


compile(`
int main(void)
{
    char TEST = 'A';
    write_char(TEST[0]);
    set_cursor(1);
}`);