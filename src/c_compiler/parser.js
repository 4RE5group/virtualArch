class Parser
{
	constructor(tokens) {
		this.tokens = tokens;
		this.pos = 0;
	}

	peek() {
		return this.tokens[this.pos];
	}

	consume(type, value = null)
	{
		const t = this.tokens[this.pos];
		if (!t || t.type !== type || (value !== null && t.value !== value)) {
			throw new Error(`Unexpected token: ${JSON.stringify(t)}`);
		}
		this.pos++;
		return t;
	}
}