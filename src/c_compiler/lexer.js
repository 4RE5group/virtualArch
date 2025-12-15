function isDelimiter(chr)
{
    return (chr === ' ' || chr === '+' || chr === '-'
            || chr === '*' || chr === '/' || chr === ','
            || chr === ';' || chr === '%' || chr === '>'
            || chr == '<' || chr === '=' || chr === '('
            || chr === ')' || chr === '[' || chr === ']'
            || chr === '{' || chr === '}');
}

// this function check for a valid identifier eg:- +,-* etc
function isOperator(chr)
{
    return (chr === '+' || chr === '-' || chr === '*'
            || chr === '/' || chr === '>' || chr === '<'
            || chr === '=');
}

function isSeparator(chr)
{
    return (chr === ';' || chr === ',' || chr === '(' || chr === ')' ||
            chr === '{' || chr === '}' || chr === '[' || chr === ']');
}

// this function check for an valid identifier
function isValidIdentifier(str)
{
    return (str[0] !== '0' && str[0] !== '1' && str[0] !== '2'
            && str[0] !== '3' && str[0] !== '4'
            && str[0] !== '5' && str[0] !== '6'
            && str[0] !== '7' && str[0] !== '8'
            && str[0] !== '9' && !isDelimiter(str[0]));
}

// 32 Keywords are checked in this function and return the
// result accordingly
function isKeyword(str)
{
    const keywords = [
			"auto",     "break",    "case",     "char",
            "const",    "continue", "default",  "do",
            "double",   "else",     "enum",     "extern",
            "float",    "for",      "goto",     "if",
            "int",      "long",     "register", "return",
            "short",    "signed",   "sizeof",   "static",
            "struct",   "switch",   "typedef",  "union",
            "unsigned", "void",     "volatile", "while" ];
    for (let i = 0; i < keywords.length; i++) {
        if (str === keywords[i]) {
            return true;
        }
    }
    return false;
}

// check for an integer value
function isInteger(str)
{
    if (str == null || str.length == 0) {
        return false;
    }
    let i = 0;
    while (isdigit(str[i])) {
        i++;
    }
    return i == str.length;
}

function isdigit(chr)
{
	return (chr >= '0' && chr <= '9');
}

function lexical_analyzer(input)
{
    let left = 0, right = 0;
    let len = input.length;
	let output = new Array();

    while (right <= len && left <= right) {
        if (!isDelimiter(input[right]))
            right++;

        if (isDelimiter(input[right]) && left == right) {
            if (isOperator(input[right]))
				output.push({'type': TYPE_OPERATOR, 'value': input[right]});
            else if (isSeparator(input[right]))
                output.push({'type': TYPE_SEPARATOR, 'value': input[right]});

            right++;
            left = right;
        }
        else if (isDelimiter(input[right]) && left != right || (right == len && left != right)) {
            subStr = input.substring(left, right);

            if (isKeyword(subStr))
				output.push({'type': TYPE_KEYWORD, 'value': subStr});

            else if (isInteger(subStr))
                output.push({'type': TYPE_INTEGER, 'value': Number(subStr)});

            else if (isValidIdentifier(subStr) && !isDelimiter(input[right - 1]))
				output.push({'type': TYPE_IDENTIFIER, 'value': subStr});

            else if (!isValidIdentifier(subStr) && !isDelimiter(input[right - 1]))
                output.push({'type': TYPE_UNIDENTIFIED, 'value': subStr});
            left = right;
        }
    }
    return output;
}