var result = 0;
var global_definitions = new Map();
// add memory mapping
global_definitions.set("TMP0", RAMSIZE-10);
global_definitions.set("TMP1", RAMSIZE-9);
global_definitions.set("TMP2", RAMSIZE-8);
global_definitions.set("TMP3", RAMSIZE-7);
global_definitions.set("TMP4", RAMSIZE-6);
global_definitions.set("CURSOR", RAMSIZE-3);
global_definitions.set("KEYPRESS", RAMSIZE);
global_definitions.set("WRITE", addMemoryMapping("character_display", "W", RAMSIZE-2, RAMSIZE-1, (index, type, value) => {
    // cursor pos is stored in memory
    let cursor_idx = global_definitions.get("CURSOR");
    if (!cursor_idx)
    {
        console.error("error: CURSOR definition is not defined");
        return;
    }
    let cursor = ram._memory[cursor_idx];
    let max_char_per_line = SCREEN_WIDTH / (FONT_SIZE);
    let x = Math.trunc(cursor % max_char_per_line);
    let y = Math.trunc(cursor / max_char_per_line);
    writeCharacter(x, y, String.fromCharCode(registers.d));
}));
initScreen();
displayScreen();
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
// to make lines follow code input
document.getElementById("asm_code_editor").addEventListener("scroll", () => {
    document.getElementById("asm_line_numbers").scrollTop = document.getElementById("asm_code_editor").scrollTop;
});
document.getElementById("c_code_editor").addEventListener("scroll", () => {
    document.getElementById("c_line_numbers").scrollTop = document.getElementById("c_code_editor").scrollTop;
});

document.querySelectorAll(".line-numbers").forEach(elem => {
    elem.style.height = (document.querySelector(".code-editor").clientHeight - 20)+"px";
})
highlightCurrentLine();
detectLanguage();
function detectLanguage()
{
    // check if language is C or ASM
    let c_code_editor = document.getElementById("c_code_editor");
    let asm_code_editor = document.getElementById("asm_code_editor");
    let asm_code_lines_numbers = document.getElementById("asm_line_numbers");
    let c_code_lines_numbers = document.getElementById("c_line_numbers");
    if (document.getElementById("language_selector").value === "C")
    {
        c_code_editor.style.display = "block";
        c_code_lines_numbers.style.display = "block";
        asm_code_editor.style.width = "50%";
        asm_code_editor.disabled = true;
    }
    else
    {
        c_code_lines_numbers.style.display = "none";
        c_code_editor.style.display = "none";
        asm_code_editor.style.width = "100%";
        asm_code_editor.disabled = false;
    }
}
function viewUpdate()
{
    result = 0;
    for (i = 0; i < 16; i++) {
        var elem = document.querySelector(".binary-switches").children.item(i).querySelector("input");
        if (elem.checked == true) {
            result |= (1 << (15 - i));
        }
    }
    document.getElementById("decimal_result").innerText = result;
    document.getElementById("hexadecimal_result").innerText = "0x" + result.toString(16);
    // Helper function to format 16-bit unsigned hex
    function formatHex(value)
    {
        // Convert to 16-bit unsigned integer
        const unsignedValue = value & 0xffff;
        return "0x" + unsignedValue.toString(16).padStart(4, '0');
    }
    // a
    document.querySelector(".registers-panel").children.item(0).children.item(1).innerText = formatHex(registers.a);
    document.querySelector(".registers-panel").children.item(0).children.item(2).innerText = "(" + registers.a + ")";
    // d
    document.querySelector(".registers-panel").children.item(1).children.item(1).innerText = formatHex(registers.d);
    document.querySelector(".registers-panel").children.item(1).children.item(2).innerText = "(" + registers.d + ")";
    // *a
    document.querySelector(".registers-panel").children.item(2).children.item(1).innerText = formatHex(registers.a_ptr);
    document.querySelector(".registers-panel").children.item(2).children.item(2).innerText = "(" + registers.a_ptr + ")";
	displayScreen();
    detectLanguage();
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
                while (lines[k].startsWith(" ") || lines[k].startsWith("\t"))
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
    ["asm_code_editor", "c_code_editor"].forEach(element => {
        const lines = document.getElementById(element).value.split('\n');
        const lineNumbers = document.getElementById(element.split("code_editor")[0]+'line_numbers');
        lineNumbers.innerHTML = lines.map((_, i) =>
            `<div${i+1 === pc ? ' class="highlight-line"' : ''}>${i+1}</div>`
        ).join('');
    });
}
function stepExec()
{
    registers.pc++;
    if (registers.pc <= 0)
    {
        alert("error: pc is outside range '"+registers.pc+"'");
        return;
    }
    if (registers.pc > rom.length) registers.pc = 1;
    highlightCurrentLine(registers.pc);
    document.getElementById("pc_num").innerText = registers.pc;
    if (rom[registers.pc - 1] != null) // skip comments/non code lines
        asm_exec_opcode(rom[registers.pc - 1]);
    viewUpdate();
}
function reset()
{
	clearScreen();
    registers.pc = 0;
    document.getElementById("pc_num").innerText = registers.pc + 1;
    highlightCurrentLine(1);
}
var stopRun = false;
var runSpeed = 250;
function run()
{
    stopRun = false;
    run_recur();
}
function stop()
{
    stopRun = true;
}
function run_recur()
{
    runSpeed = 250 - document.getElementById("runSpeedController").value;
    setTimeout(() => {
        stepExec();
        if (!stopRun)
            run_recur();
    }, runSpeed);
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