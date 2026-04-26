function buildAST(parser)
{
	function parseProgram() {
		return {
			type: "Program",
			body: [parseFunction()]
		};
	}

	function parseFunction() {
		parser.consume(TYPE_KEYWORD, "void");
		const name = parser.consume(TYPE_IDENTIFIER).value;
		parser.consume(TYPE_SEPARATOR, '(');
		parser.consume(TYPE_KEYWORD, "void");
		parser.consume(TYPE_SEPARATOR, ')');

		return {
			type: "FunctionDeclaration",
			name,
			body: parseBlock()
		};
	}

	function parseBlock() {
		parser.consume(TYPE_SEPARATOR, '{');
		const body = [];

		while (!(parser.peek().type === TYPE_SEPARATOR && parser.peek().value === '}')) {
			body.push(parseStatement());
		}

		parser.consume(TYPE_SEPARATOR, '}');
		return body;
	}

	function parseStatement() {
		if (parser.peek().value === "int") {
			const stmt = parseVarDecl();
			parser.consume(TYPE_SEPARATOR, ';');
			return stmt;
		}
		throw new Error(`Unknown statement: ${JSON.stringify(parser.peek())}`);
	}

	function parseVarDecl() {
		parser.consume(TYPE_KEYWORD, "int");
		const name = parser.consume(TYPE_IDENTIFIER).value;
		parser.consume(TYPE_OPERATOR, '=');

		return {
			type: "VariableDeclaration",
			name,
			init: parseExpr()
		};
	}

	/* ---------- expressions ---------- */

	function parseExpr() {
		let node = parseTerm();

		while (
			parser.peek() &&
			parser.peek().type === TYPE_OPERATOR &&
			(parser.peek().value === "+" || parser.peek().value === "-")
		) {
			const op = parser.consume(TYPE_OPERATOR).value;
			node = { type: "BinaryExpression", operator: op, left: node, right: parseTerm() };
		}
		return node;
	}

	function parseTerm() {
		let node = parseFactor();

		while (
			parser.peek() &&
			parser.peek().type === TYPE_OPERATOR &&
			(parser.peek().value === "*" || parser.peek().value === "/")
		) {
			const op = parser.consume(TYPE_OPERATOR).value;
			node = { type: "BinaryExpression", operator: op, left: node, right: parseFactor() };
		}
		return node;
	}

	function parseFactor() {
		const t = parser.peek();

		if (t.type === TYPE_INTEGER) {
			parser.consume(TYPE_INTEGER);
			return { type: "NumberLiteral", value: t.value };
		}

		if (t.type === TYPE_IDENTIFIER) {
			parser.consume(TYPE_IDENTIFIER);
			return { type: "Identifier", name: t.value };
		}

		if (t.type === TYPE_SEPARATOR && t.value === '(') {
			parser.consume(TYPE_SEPARATOR, '(');
			const node = parseExpr();
			parser.consume(TYPE_SEPARATOR, ')');
			return node;
		}

		throw new Error(`Unexpected token: ${JSON.stringify(t)}`);
	}

	return parseProgram();
}
