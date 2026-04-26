function syntax_checker(ast)
{
	const symbols = new Map(); // name -> type

	function checkNode(node) {
		switch (node.type) {

			case "Program":
				node.body.forEach(checkNode);
				break;

			case "FunctionDeclaration":
				node.body.forEach(checkNode);
				break;

			case "VariableDeclaration": {
				const initType = checkNode(node.init);
				if (initType !== "int") {
					throw new Error(`Type error: cannot assign ${initType} to int`);
				}
				symbols.set(node.name, "int");
				return "int";
			}

			case "BinaryExpression": {
				const lt = checkNode(node.left);
				const rt = checkNode(node.right);
				if (lt !== "int" || rt !== "int") {
					throw new Error(`Type error: ${node.operator} requires int operands`);
				}
				return "int";
			}

			case "NumberLiteral":
				return "int";

			case "Identifier":
				if (!symbols.has(node.name)) {
					throw new Error(`Undeclared variable: ${node.name}`);
				}
				return symbols.get(node.name);

			default:
				throw new Error(`Unknown AST node: ${node.type}`);
		}
	}

	checkNode(ast);
}