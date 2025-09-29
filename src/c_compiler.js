/*
    virtualArch C compiler
*/

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
            while ((match = varRegex.exec(code)) !== null) {
                const name = match[1]; // variable name
                const value = match[2]; // variable value
                variables.set(name, value);
            }
            if (!varRegex.test(line))
        });
    });

    // generate text section
    let TEXT = "TEXT:";
    variables.forEach((value, key) => {
        TEXT += `\n    ${key} ${value}`;
    });

    console.log(code);
}


compile(`
int main(void)
{
    char *HELLO_WORLD_TEXT = "Hello World!";
    int i = 0;
    int cursor = 0;

    while(HELLO_WORLD_TEXT[i] != '\0')
    {
        write_char(HELLO_WORLD_TEXT[i]);
        cursor++;
        set_cursor(cursor);
        i++;
    }
}`);