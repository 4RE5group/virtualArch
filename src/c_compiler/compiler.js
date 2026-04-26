const TYPE_OPERATOR = 0;
const TYPE_KEYWORD = 1;
const TYPE_INTEGER = 2;
const TYPE_IDENTIFIER = 3;
const TYPE_UNIDENTIFIED = 4;
const TYPE_SEPARATOR = 5;



function compileC(source)
{
    try {
        const tokens = lexical_analyzer(source.replaceAll("\n", ""));
        const parser = new Parser(tokens);
        const ast = buildAST(parser);
		console.log(generateCode(ast));
        //const ir = generateIR(ast);
        //return generateASM(ir);
    } catch (e) {
        console.error("Compilation error:", e);
        return -1;
    }
}

function generateCode(ast)
{
	function gen(node) {
		switch (node.type) {

			case "Program":
				return node.body.map(gen).join("\n");

			case "FunctionDeclaration":
				return (
					`void ${node.name}(void) {\n` +
					node.body.map(s => "	" + gen(s)).join("\n") +
					`\n}`
				);

			case "VariableDeclaration":
				return `int ${node.name} = ${gen(node.init)};`;

			case "BinaryExpression":
				return `${gen(node.left)} ${node.operator} ${gen(node.right)}`;

			case "NumberLiteral":
				return String(node.value);

			case "Identifier":
				return node.name;

			default:
				throw new Error(`Unknown AST node: ${node.type}`);
		}
	}

	return gen(ast);
}



function generateASM(ir) {
    const variables = new Set();
    const codeLines = [];

    function isImmediate(op) {
        return /^\d+$/.test(op);
    }

    ir.forEach(line => {
        line = line.trim();
        if (line.startsWith("label ")) {
            codeLines.push(`${line.split(" ")[1]}:`);
            return;
        }
        if (line.startsWith("goto ")) {
            codeLines.push(`    A = ${line.split(" ")[1]}`);
            codeLines.push(`    A; JMP`);
            return;
        }
        if (line.startsWith("ifFalse ")) {
            const parts = line.split(" ");
            const cond = parts[1];
            const label = parts[3];
            
            if (isImmediate(cond)) {
                codeLines.push(`    A = ${cond}`);
                codeLines.push(`    D = A`);
            } else {
                codeLines.push(`    A = ${cond}`);
                codeLines.push(`    D = *A`);
            }
            
            codeLines.push(`    A = ${label}`);
            codeLines.push(`    D; JGE`); 
            return;
        }
        if (line.startsWith("call ")) {
            const parts = line.split(" ");
            const func = parts[1];
            const args = parts.slice(2);
            
            if (func === "set_cursor") {
                const arg = args[0];
                if (isImmediate(arg)) {
                    codeLines.push(`    A = ${arg}`);
                    codeLines.push(`    D = A`);
                } else {
                    codeLines.push(`    A = ${arg}`);
                    codeLines.push(`    D = *A`);
                }
                codeLines.push(`    A = CURSOR`);
                codeLines.push(`    *A = D`);
            } else if (func === "write_char") {
                const arg = args[0];
                if (isImmediate(arg)) {
                    codeLines.push(`    A = ${arg}`);
                    codeLines.push(`    D = A`);
                } else {
                    codeLines.push(`    A = ${arg}`);
                    codeLines.push(`    D = *A`);
                }
                codeLines.push(`    A = WRITE`);
                codeLines.push(`    *A = D`);
            }
            return;
        }
        
        if (line.includes("=")) {
            const parts = line.split("=");
            const target = parts[0].trim();
            const rhs = parts[1].trim();
            
            if (rhs.includes("[") && rhs.endsWith("]")) {
                const name = rhs.split("[")[0];
                const idx = rhs.split("[")[1].slice(0, -1);
                
                variables.add(target);
                if (!variables.has(name)) variables.add(name); 
                
                if (isImmediate(idx)) {
                    codeLines.push(`    A = ${idx}`);
                    codeLines.push(`    D = A`);
                } else {
                    codeLines.push(`    A = ${idx}`);
                    codeLines.push(`    D = *A`);
                }
                
                codeLines.push(`    A = ${name}`);
                codeLines.push(`    D = D + *A`); 
                
                codeLines.push(`    A = D`);
                codeLines.push(`    D = *A`); 
                
                codeLines.push(`    A = ${target}`);
                codeLines.push(`    *A = D`);
                return;
            }

            variables.add(target);

            const opMatch = rhs.match(/^(.+)\s+([\+\-\*\/<>])\s+(.+)$/);
            if (opMatch) {
                const op1 = opMatch[1].trim();
                const op = opMatch[2].trim();
                const op2 = opMatch[3].trim();

                if (!isImmediate(op1)) variables.add(op1);
                if (!isImmediate(op2)) variables.add(op2);

                if (isImmediate(op1)) {
                    codeLines.push(`    A = ${op1}`);
                    codeLines.push(`    D = A`);
                } else {
                    codeLines.push(`    A = ${op1}`);
                    codeLines.push(`    D = *A`);
                }
                codeLines.push(`    A = TMP0`);
                codeLines.push(`    *A = D`);

                if (isImmediate(op2)) {
                    codeLines.push(`    A = ${op2}`);
                    codeLines.push(`    D = A`);
                } else {
                    codeLines.push(`    A = ${op2}`);
                    codeLines.push(`    D = *A`);
                }
                codeLines.push(`    A = TMP1`);
                codeLines.push(`    *A = D`);

                codeLines.push(`    A = TMP0`);
                codeLines.push(`    D = *A`);
                codeLines.push(`    A = TMP1`);
                
                if (op === '+') codeLines.push(`    D = D + *A`);
                else if (op === '-') codeLines.push(`    D = D - *A`);
                else if (op === '<') codeLines.push(`    D = D - *A`);

                codeLines.push(`    A = ${target}`);
                codeLines.push(`    *A = D`);
            } else {
                const val = rhs;
                if (!isImmediate(val)) variables.add(val);
                
                if (isImmediate(val)) {
                    codeLines.push(`    A = ${val}`);
                    codeLines.push(`    D = A`);
                } else {
                    codeLines.push(`    A = ${val}`);
                    codeLines.push(`    D = *A`);
                }
                codeLines.push(`    A = ${target}`);
                codeLines.push(`    *A = D`);
            }
        }
    });

    let asm = "TEXT:\n";
    variables.forEach(v => {
        if (!v.startsWith("t") && !v.startsWith("L_") && !v.startsWith("TMP") && v !== "CURSOR" && v !== "WRITE") 
             asm += `    ${v} 0\n`;
    });
    for(let i=0; i<tempCount; i++) {
        asm += `    t${i} 0\n`;
    }
    
    asm += "\n";
    asm += codeLines.join("\n");
    return asm;
}
window.compileC = compileC;
