/*
    Terminal displaying functions
*/

const SCREEN_WIDTH  = 992;
const SCREEN_HEIGHT = 640;
const SCALE_RATIO   = 1;
const FONT_SIZE     = 16;

var screen_canvas;
var ctx;

function initScreen()
{
    screen_canvas = document.getElementById("terminal_screen");
    if (!screen_canvas) {
        console.error("error: could not find screen canvas");
        return -1;
    }

    screen_canvas.style.width  = (SCREEN_WIDTH * SCALE_RATIO) + "px";
    screen_canvas.style.height = (SCREEN_HEIGHT * SCALE_RATIO) + "px";
    screen_canvas.width  = SCREEN_WIDTH;
    screen_canvas.height = SCREEN_HEIGHT;

    ctx = screen_canvas.getContext("2d");
    ctx.scale(SCALE_RATIO, SCALE_RATIO);

    clearScreen();
}

function RGB332_to_RGB(color)
{
    let b = Math.round(255 * (color & 3) / 3);
    let g = Math.round(255 * ((color >> 2) & 7) / 7);
    let r = Math.round(255 * ((color >> 5) & 7) / 7);

    const toHex = (v) => v.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function writeCharacter(column, row, character, fg, bg)
{
    if (typeof character === "string" && character.length === 1)
    {
        const code = character.charCodeAt(0);
        if (code >= 32 && code <= 127)
        {
            ctx.font = FONT_SIZE + "px Arial";
            ctx.textBaseline = "alphabetic";

            ctx.fillStyle = RGB332_to_RGB(bg);
            ctx.fillRect(
                column * FONT_SIZE,
                row * FONT_SIZE,
                FONT_SIZE,
                FONT_SIZE
            );

            ctx.fillStyle = RGB332_to_RGB(fg);
            ctx.fillText(
                character,
                column * FONT_SIZE,
                (row + 1) * FONT_SIZE - (FONT_SIZE * 0.1)
            );
        }
    }
}

function clearScreen()
{
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}
