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

        // pointed data writing
        return (`A = ${offset}
    D = ${isNumeric(offset)?'':'*'}A  # copy offset
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
            if (line.includes("=")) // assignation
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
            else if (line.includes("++") || line.includes("--")) // incrementation
            {
                let varname = line.split(line.includes("++")?"++":"--")[0].trim().replaceAll(';', "");
                ASM_CODE += 
`    # ----- inc/dec var -----
    A = ${varname}  # write to memory
    *A = *A ${line.includes("++")?'+':'-'} 1 # increment
    `;
            }
            else if (line.includes("(") && line.includes(")") && !line.includes("=")) // function call
            {
                let funcName = line.split("(")[0].trim();
                let funcArg = line.split("(")[1].trim().split(")")[0].trim();
                ASM_CODE += getAsmBuiltinFunc(funcName, funcArg);
            }
            else if (line.endsWith(";"))
            {
                console.log(`Statement: ${line}`);
            }
            else
            {
                console.log(`Unrecognized: ${line}`);
            }

            filteredLines.push(line); // Add non-empty, non-comment lines to filteredLines
        });

        // update the code
        functions.set(key, filteredLines.join("\n"));
    });

    return (ASM_CODE);
}


console.log(compile(`
int main(void)
{
    char *TEST = "Hello World!";
    int i = 0;

    for (i = 0; i < 12; i++)
    {
        write_char(TEST[i]);
        set_cursor(i);
    }
}`));