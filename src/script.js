var result = 0;
var global_definitions = new Map();

const asmEditor = document.getElementById("asm_code_editor");
const cEditor = document.getElementById("c_code_editor");
const asmLines = document.getElementById("asm_line_numbers");
const cLines = document.getElementById("c_line_numbers");
const pcNum = document.getElementById("pc_num");
const registersPanel = document.querySelector(".registers-panel");
const binarySwitches = document.querySelector(".binary-switches").children;




// add memory mapping
global_definitions.set("COLOR_BG", RAMSIZE-14); ram._memory[global_definitions.get("COLOR_BG")] = 0x00;
global_definitions.set("COLOR_FG", RAMSIZE-13); ram._memory[global_definitions.get("COLOR_FG")] = 0xFF;
global_definitions.set("STACK_PUSH", addMemoryMapping("stack_push", "W", RAMSIZE-12, RAMSIZE-11, (index, type, value) => {
	ram._stack.push(value);
}));
global_definitions.set("STACK_POP", addMemoryMapping("stack_pop", "R", RAMSIZE-11, RAMSIZE-10, (index, type, value) => {
	if (ram._stack.length == 0)
		return (-1);
	return (ram._stack.pop());
}));
global_definitions.set("TMP0", RAMSIZE-10);
global_definitions.set("TMP1", RAMSIZE-9);
global_definitions.set("TMP2", RAMSIZE-8);
global_definitions.set("TMP3", RAMSIZE-7);
global_definitions.set("TMP4", RAMSIZE-6);
global_definitions.set("TMP5", RAMSIZE-5);
global_definitions.set("TMP6", RAMSIZE-4);
global_definitions.set("CURSOR", RAMSIZE-3);
global_definitions.set("KEYPRESS", RAMSIZE);
global_definitions.set("WRITE", addMemoryMapping("character_display", "W", RAMSIZE-2, RAMSIZE-1, (index, type, value) => {
	// cursor pos is stored in memory
	let cursor_idx = global_definitions.get("CURSOR");
	let fg_idx = global_definitions.get("COLOR_FG");
	let bg_idx = global_definitions.get("COLOR_BG");
	if (!cursor_idx || !fg_idx || !bg_idx)
	{
		console.error("error: CURSOR, COLOR_FG or COLOR_BG definitions are not defined");
		return;
	}
	let cursor = ram._memory[cursor_idx];
	let fg = ram._memory[fg_idx];
	let bg = ram._memory[bg_idx];
	let max_char_per_line = SCREEN_WIDTH / (FONT_SIZE);
	let x = Math.trunc(cursor % max_char_per_line);
	let y = Math.trunc(cursor / max_char_per_line);
	writeCharacter(x, y, String.fromCharCode(registers.d), fg, bg);
}));
initScreen();
document.getElementById("terminal_input").addEventListener("keydown", (e) => {
	let output_char = 0;
	//console.log(e.code);
	if (e.code.startsWith("Key") || e.code.startsWith("Digit") || e.code.startsWith("Numpad"))
		output_char = e.code.replace("Key", "").replace("Digit", "").replace("Numpad", "").trim().charCodeAt(0);
	else 
	{
		switch (e.code)
		{
			case 'Space':
				output_char = " ".charCodeAt(0);
				break;
			case 'Backspace':
				output_char = 8;
				break;
			case 'Enter':
				output_char = "\n".charCodeAt(0);
				break;
			case 'Escape':
				output_char = 27;
				break;
			case 'Period':
				output_char = ".".charCodeAt(0);
				break;
			case 'Comma':
				output_char = ",".charCodeAt(0);
				break;
			case 'Slash':
				output_char = "/".charCodeAt(0);
				break;
			case 'Semicolon':
				output_char = ";".charCodeAt(0);
				break;
			case 'Quote':
				output_char = "'".charCodeAt(0);
				break;
			case 'Backslash':
				output_char = "\\".charCodeAt(0);
				break;
		}
	}
	let keypress_idx = global_definitions.get("KEYPRESS");
	if (keypress_idx)
		ram._memory[keypress_idx] = output_char;
});

// tab handling
document.getElementById("asm_code_editor").addEventListener("keydown", e => puttab(e));
document.getElementById("c_code_editor").addEventListener("keydown", e => puttab(e));

// to make lines follow code input
const syncScroll = (editorId, lineNumbersId, highlightId) => {
	const editor = document.getElementById(editorId);
	const lineNumbers = document.getElementById(lineNumbersId);
	const highlight = document.getElementById(highlightId);
	
	editor.addEventListener("scroll", () => {
		lineNumbers.scrollTop = editor.scrollTop;
		highlight.scrollTop = editor.scrollTop;
		highlight.scrollLeft = editor.scrollLeft;
	});
};

syncScroll("asm_code_editor", "asm_line_numbers", "asm_highlight");
syncScroll("c_code_editor", "c_line_numbers", "c_highlight");

document.querySelectorAll(".line-numbers").forEach(elem => {
	elem.style.height = (document.querySelector(".code-editor").clientHeight - 20)+"px";
})
highlightCurrentLine();
detectLanguage();
editRom(); 
updateHighlight();

function escapeHTML(s) {
  return s.replace(/&/g, "&amp;")
		  .replace(/</g, "&lt;")
		  .replace(/>/g, "&gt;");
}


function puttab(e)
{
	let ta = e.currentTarget;
	if (e.key === "Tab")
	{
		e.preventDefault();


		const start = ta.selectionStart;
		const end   = ta.selectionEnd;

		ta.setRangeText("\t", start, end, "end");
		editRom(); 
		updateHighlight();
	}
}

function detectLanguage()
{
	// check if language is C or ASM
	let c_wrapper = document.getElementById("c_editor_wrapper");
	let asm_wrapper = document.getElementById("asm_editor_wrapper");
	let asm_code_editor = document.getElementById("asm_code_editor");
	let asm_code_lines_numbers = document.getElementById("asm_line_numbers");
	let c_code_lines_numbers = document.getElementById("c_line_numbers");
	
	if (document.getElementById("language_selector").value === "C")
	{
		c_wrapper.style.display = "block";
		c_code_lines_numbers.style.display = "block";
		asm_wrapper.style.width = "50%";
		asm_code_editor.disabled = true;
	}
	else
	{
		c_code_lines_numbers.style.display = "none";
		c_wrapper.style.display = "none";
		asm_wrapper.style.width = "100%";
		asm_code_editor.disabled = false;
	}
}
function viewUpdate()
{
	let result = 0;
	for (let i = 0; i < 16; i++)
		if (binarySwitches[i].querySelector("input").checked)
			result |= (1 << (15 - i));

	document.getElementById("decimal_result").innerText = result;
	document.getElementById("hexadecimal_result").innerText = "0x" + (result & 0xffff).toString(16);

	const fmt = v => "0x" + (v & 0xffff).toString(16).padStart(4, "0");

	registersPanel.children[0].children[1].innerText = fmt(registers.a);
	registersPanel.children[0].children[2].innerText = `(${registers.a})`;
	registersPanel.children[1].children[1].innerText = fmt(registers.d);
	registersPanel.children[1].children[2].innerText = `(${registers.d})`;
	registersPanel.children[2].children[1].innerText = fmt(ram._memory[registers.a]);
	registersPanel.children[2].children[2].innerText = `(${ram._memory[registers.a]})`;
}
function editRom() 
{
	// clear terminal
	console.clear();
	document.querySelector(".error_view").innerHTML = ""; // reset error view
	// check if language mode is asm or c
	var code;
	if (document.getElementById("language_selector").value === "C")
	{
		code = document.getElementById("c_code_editor").value;
		code = compile(code); // compile C code to asm
		if (code != -1)
			document.getElementById("asm_code_editor").value = code;
		else
			return; // an error occured
	} else {
		code = document.getElementById("asm_code_editor").value;
	}
	var lines = code.split("\n");
	// load definitions
	var definitions = new Map();
	definitions = global_definitions;
	
	var macros = new Map();
	let in_macro = false;
	let current_macro_name = "";
	let current_macro_args = [];
	let current_macro_body = [];

	let j = 0;
	let mem_pos = PROGRAM_TEXT_MEMSTART; // start offset of program TEXT memory
	for(let i = 0; i < lines.length; i++) {
		let line = lines[i].trim();
		if (line.startsWith("#")) {
			let directive = line.replace("#", "").trim();
			if (directive.startsWith("MACRO ")) {
				in_macro = true;
				let parts = directive.split(" ").filter(p => p.trim() !== "");
				current_macro_name = parts[1];
				current_macro_args = parts.slice(2);
				current_macro_body = [];
				lines[i] = "#" + lines[i];
				j++;
				continue;
			} else if (directive === "ENDMACRO") {
				in_macro = false;
				macros.set(current_macro_name, { args: current_macro_args, body: current_macro_body.join("\n") });
				lines[i] = "#" + lines[i];
				j++;
				continue;
			}
		}

		if (in_macro) {
			current_macro_body.push(line);
			lines[i] = "#" + lines[i];
			j++;
			continue;
		}

		if (line.startsWith("#"))
		{
			if (line.replace("#", "").trim().startsWith("DEFINE "))

			{
				line = line.split("DEFINE")[1].trim();
				while (line.includes("  ")) // trim spaces between
					line = line.replaceAll("  ", " ");
				var elements = line.split(" ");
				if (elements.length != 2)
				{
					console.error("error: invalid DEFINE preprocessor flag: '"+line+"'");
					return;
				}
				// save definition
				definitions.set(elements[0].trim(), elements[1].trim());
			}
		}
		else if (line.trim().endsWith(":")) // labels
		{
			line = line.split(":")[0].trim();
			if (line == "TEXT") // text section
			{
				let k = j+1;
				while (lines[k] != undefined && (lines[k].startsWith(" ") || lines[k].startsWith("\t")))
				{
					let start_offset = -1;
					lines[k] = lines[k].trim();
					while(lines[k].includes("  "))
						lines[k] = lines[k].replaceAll("  ", " ");
					let elements = [
						...lines[k].split(" ").slice(0, 1), 
						lines[k].split(" ").slice(1).join(' ').trim() // merge the rest into a single string
					];
					// string type
					if (elements[1].startsWith('"') && elements[1].endsWith('"'))
					{
						start_offset = mem_pos;
						for(let _ = 1; _ < elements[1].length-1; _++)
						{
							ram._memory[mem_pos++] = elements[1].charCodeAt(_);
						}
						ram._memory[mem_pos++] = 0;
						console.log("registered a string at offset "+(mem_pos-elements[1].length+1));
					} else if (elements[1].startsWith('[') && elements[1].endsWith(']')) {
						start_offset = mem_pos;
						let content = elements[1].substring(1, elements[1].length - 1);
						let nums = content.split(",");
						for(let raw of nums) {
							let val = raw.trim();
							if (val === "") continue;
							if (isNumeric(val)) {
								ram._memory[mem_pos++] = Number(val);
							} else {
								console.error("error: invalid array element: '" + val + "'");
								return;
							}
						}
						console.log("registered an array at offset "+start_offset);
					} else if (isNumeric(elements[1])) {
						start_offset = mem_pos;
						ram._memory[mem_pos++] = Number(elements[1]);
						console.log("registered a number at offset "+mem_pos);
					} else {
						console.error("error: invalid TEXT definition type: "+elements[1]);
						return;
					}
					definitions.set(elements[0], start_offset.toString());
					lines[k] = "#"+lines[k];
					k++;
				}
			}
			else
				definitions.set(line, j.toString());
			lines[i] = "#"+lines[i]; // comment line to skip it when running
		}
		j++;
	}

	// Process macro usages
	for(let i=0; i<lines.length; i++) {
		let line = lines[i].trim();
		if (line.startsWith("#")) continue;

		for (const [mName, mData] of macros.entries()) {
			if (line.startsWith(mName)) {
				// Parse arguments
				let argsStr = line.substring(mName.length).trim();
				let args = argsStr.length > 0 ? argsStr.split(",").map(a => a.trim()) : [];
				
				let replacement = mData.body;
				for(let k=0; k<mData.args.length; k++) {
					// replace arg placeholders (like %1, %2 if they use it, or just exact names)
					// assuming they use the names directly
					const escapedArg = mData.args[k].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					const regex = new RegExp(`(^|[^a-zA-Z0-9_-])(${escapedArg})(?=[^a-zA-Z0-9_-]|$)`, 'g');
					replacement = replacement.replace(regex, `$1${args[k]}`);
				}
				lines[i] = replacement;
				break;
			}
		}
	}

	// flatten lines that became multi-line from macro replacements
	lines = lines.flatMap(line => line.split("\n"));

	// apply definitions
	definitions.forEach((value, key) => {
		// escape the key for use in a regex
		const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(^|[^a-zA-Z0-9_-])(${escapedKey})(?=[^a-zA-Z0-9_-]|$)`, 'g');
		for(let i=0; i<lines.length; i++)
		{
			// replace definition keyword in every lines
			lines[i] = lines[i].replace(regex, `$1${value}`);
		}
	});
	console.log(lines.join("\n"));
	console.log(definitions);
	let i = 0;
	rom = [];
	lines.forEach(line => {
		// replace all char to its ascii value
		line = line.replace(/(['"])(?:\\.|.)\1/g, (match, quote) => { 
			try
			{
				const content = match.slice(1, -1);
				// parse the content to handle escape sequences
				const char = JSON.parse(`"${content}"`);
				return char.charCodeAt(0);
			} catch (e) {
				return match;
			}
		 });
		// skip comments and new lines
		if (line.includes("#"))
			line = line.split("#")[0];
		if (line.trim() != "" && !line.trim().endsWith(":")) { // skip empty lines and labels
			let num = asm_to_opcode(line.trim());
			if (num == -1) {
				console.error(`error at line ${i+1}`);
				reset();
				return;
			}
			rom[i] = Number(num);
		}
		else
			rom[i] == null;
		
		i++;
	});
	console.log(`successfully writted ${i} op codes to rom!`);
	reset();
}
function highlightCurrentLine(pc)
{
	const update = (editor, linesElem) => {
		const count = editor.value.split('\n').length;
		let html = "";
		for (let i = 1; i <= count; i++)
			html += `<div${i === pc ? ' class="highlight-line"' : ''}>${i}</div>`;
		linesElem.innerHTML = html;
	};
	update(asmEditor, asmLines);
	update(cEditor, cLines);
}
function stepExec()
{
	let pc = ++registers.pc;
	if (pc <= 0) return;
	if (pc > rom.length) stop();

	pcNum.innerText = pc;
	highlightCurrentLine(pc);

	const op = rom[pc - 1];
	if (op != null) asm_exec_opcode(op);

	viewUpdate();
}
function reset()
{
	clearScreen();
	registers._a = 0;
	registers._d = 0;
	registers._pc = 0;
	pcNum.innerText = 1;
	highlightCurrentLine(1);
}
var stopRun = false;
var runTimer = null;
var runSpeed = 250;

function getRunSpeed()
{
	return 250 - document.getElementById("runSpeedController").value;
}

function run()
{
	stopRun = false;

	if (runTimer !== null)
		clearInterval(runTimer);

	runTimer = setInterval(tick, getRunSpeed());
}

function tick()
{
	if (stopRun)
	{
		clearInterval(runTimer);
		runTimer = null;
		return;
	}
	stepExec();

	const newSpeed = getRunSpeed();
	if (runTimer && runTimer._speed !== newSpeed)
	{
		clearInterval(runTimer);
		runTimer = setInterval(tick, newSpeed);
		runTimer._speed = newSpeed;
	}
}

function stop()
{
	stopRun = true;
	if (runTimer !== null)
	{
		clearInterval(runTimer);
		runTimer = null;
	}
}

var samples_opened = false;
function toggle_samples()
{
	let samples = document.querySelector(".exemples_dropdown");
	samples_opened = !samples_opened;
	if (samples_opened)
	{
		samples.style.height = "41px";
		samples.style.width = "41px";
		samples.querySelector(".exemples_cross").innerText = "☰";
	} else {
		samples.querySelector(".exemples_cross").innerText = "✕";
		samples.style.height = "auto";
		samples.style.width = "auto";
	}
}
function load_sample(name)
{
	fetch("./exemples/"+name).then(response => {
		return response.text();
	}).then(text => {
		if (name.endsWith(".c") || name.endsWith(".C"))
		{
			document.getElementById("c_code_editor").value = text;
			document.getElementById("language_selector").value = "C";
		}
		else
		{
			document.getElementById("asm_code_editor").value = text;
			document.getElementById("language_selector").value = "ASM";
		}
		detectLanguage();
		editRom();
		updateHighlight();
	});
}
function updateHighlight()
{
	const update = (editorId, highlightId) => {
		const editor = document.getElementById(editorId);
		const highlight = document.getElementById(highlightId);
		const code = editor.value;

		const lines = code.split("\n");
		highlight.innerHTML = lines.map(line => {
			// Label
			if (/^\s*[A-Za-z0-9_]+:\s*$/.test(line)) {
				return `<span style="color: #D04040">${escapeHTML(line)}</span>`;
			}

			// Definition (preserve spacing)
			let regex_definition = /^(\s*(?:A|a|D|d|\*A|\*a)\s*)(=)(\s*[A-Za-z0-9_']+\s*)$/.exec(line);
			if (regex_definition)
			{
				let value = regex_definition[3].trim();
				let value_color;

				if (isNumeric(value))
					value_color = "#b5cea8";
				else if (value.startsWith("'") && value.endsWith("'"))
					value_color = "#CE9178";
				else
					value_color = "#D04040";

				return (
					`<span>` +
					`<span style="color:#96D2F2">${escapeHTML(regex_definition[1])}</span>` +
					`<span>${escapeHTML(regex_definition[2])}</span>` +
					`<span style="color:${value_color}">${escapeHTML(regex_definition[3])}</span>` +
					`</span>`
				);
			}

			let html = "";
			let i = 0;
			let inString = false;
			let quoteChar = null;
			let stringStart = -1;
			while (i < line.length)
			{
				const char = line[i];

				if (inString)
				{
					if (char === quoteChar)
					{
						inString = false;
						html += `<span style="color: #CE9178">${quoteChar}${escapeHTML(line.substring(stringStart + 1, i))}${quoteChar}</span>`;
					}
				}
				else
				{
					if (
						(char === 'J' || char === 'R') &&
						i + 2 < line.length &&
						"MNLEQG".includes(line[i + 1]) &&
						"PETQ".includes(line[i + 2])
					)
					{
						html += `<span style="color: #c586c0">${escapeHTML(line.substr(i, 3))}</span>`;
						i += 2;
					}
					else if (char === "#")
					{
						html += `<span style="color: #6A9955">${escapeHTML(line.substring(i))}</span>`;
						break;
					}
					else if (char === "'" || char === '"')
					{
						inString = true;
						quoteChar = char;
						stringStart = i;
					}
					else
						html += escapeHTML(char);
				}
				i++;
			}

			if (inString)
				html += `<span style="color: orange">${quoteChar}${escapeHTML(line.substring(stringStart + 1))}</span>`;

			return html;
		}).join("\n");

		if (code.endsWith("\n"))
			highlight.innerHTML += "\n ";
	};

	update("asm_code_editor", "asm_highlight");
	update("c_code_editor", "c_highlight");
}
