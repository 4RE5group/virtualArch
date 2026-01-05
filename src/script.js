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
    
    let j = 0;
    let mem_pos = PROGRAM_TEXT_MEMSTART; // start offset of program TEXT memory
    lines.forEach(line => {
        line = line.trim();
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
            {
                definitions.set(line, j.toString());
            }
            lines[j] = "#"+lines[j]; // comment line to skip it when running
        }
        j++;
    });
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
    ram._call_stack.length = 0;
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
            // 1. Check for Label (red)
            if (/^[A-Z0-9_]+:$/.test(line.trim())) {
                return `<span style="color:#D04040">${escapeHTML(line)}</span>`;
            }
            
            // 2. Process Comments (green) and Strings (orange)
            let html = "";
            let i = 0;
            let inString = false;
            let stringStart = -1;

            while (i < line.length)
            {
                const char = line[i];
                
                if (inString) {
                    if (char === "'")
                    {
                        // End of string
                        inString = false;
                        html += `<span style="color:#CE9178">'${escapeHTML(line.substring(stringStart + 1, i))}'</span>`;
                    }
                    i++;
                }
                else
                {
                    if (line[i] == 'A' || line[i] == 'D' || (i + 1 < line.length && line[i] == '*' && line[i] == 'A'))
                    {
                        html += `<span style="color:#96D2F2">${escapeHTML(line[i] + ((line[i] == '*')?line[i+1]:""))}</span>`;
                        i+=(line[i] == '*')+1;
                    }
                    else if ((char == 'J' || char == 'R') && i + 2 < line.length)
                    {
                        if (line[i+1] == 'M' || line[i+1] == 'N' || line[i+1] == 'L' || line[i+1] == 'E' || line[i+1] == 'Q')
                            if (line[i+2] == 'P' || line[i+2] == 'E' || line[i+2] == 'T' || line[i+2] == 'Q')
                            {
                                html += `<span style="color:#A6BD9A">${escapeHTML(line[i]+line[i+1]+line[i+2])}</span>`;
                                i+=3;
                                //break;
                            }
                    }
                    else if (char === "#")
                    {
                        // Comment starts, goes to end of line
                        html += `<span style="color:#6A9955">${escapeHTML(line.substring(i))}</span>`;
                        break;
                    }
                    else if (char === "'")
                    {
                        // String starts
                        inString = true;
                        stringStart = i;
                        i++;
                    }
                    else
                    {
                        html += escapeHTML(char);
                        i++;
                    }
                }
            }
            
            // If line ended while in string (unclosed string)
            if (inString)
                html += `<span style="color:orange">'${escapeHTML(line.substring(stringStart + 1))}</span>`;
            
            return html;
        }).join("\n");
        
        // Handle trailing newline
        if (code.endsWith("\n")) {
            highlight.innerHTML += "\n ";
        }
    };

    update("asm_code_editor", "asm_highlight");
    update("c_code_editor", "c_highlight");
}