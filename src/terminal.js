/*
    Terminal displaying functions (no screen_buffer)
*/

const SCREEN_WIDTH  = 640;
const SCREEN_HEIGHT = 400;
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

function displayScreen()
{
    // no buffer anymore, drawing is immediate
}

function updateScreenbuffer()
{
    // removed (kept for compatibility)
}

function writeCharacter(column, row, character)
{
    if (typeof character === "string" && character.length === 1) {
        const code = character.charCodeAt(0);
        if (code >= 32 && code <= 127) {
            ctx.font = FONT_SIZE + "px Arial";
            ctx.textBaseline = "alphabetic";

            ctx.fillStyle = "#000000";
            ctx.fillRect(
                column * FONT_SIZE,
                row * FONT_SIZE,
                FONT_SIZE,
                FONT_SIZE
            );

            ctx.fillStyle = "#ffffff";
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
