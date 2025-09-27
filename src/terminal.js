/*
    Terminal displaying functions
*/

const SCREEN_WIDTH  = 320; // screen width  in pixels
const SCREEN_HEIGHT = 200; // screen height in pixels

var screen_buffer = new Array(SCREEN_WIDTH*SCREEN_HEIGHT).fill(0);
var screen_canvas;
var ctx;
var screen_image_data;

function    initScreen()
{
    screen_canvas = document.getElementById("terminal_screen");
    if (!screen_canvas) {
        console.error("error: could not find screen canvas");
        return (-1);
    }
    // init canva context
    ctx = screen_canvas.getContext('2d');
    screen_image_data = ctx.createImageData(screen_canvas.width, screen_canvas.height);
}

function displayScreen()
{
    const data = screen_image_data.data;
    // fill up screen pixels
    for (let i = 0; i < data.length; i += 4)
    {
        data[i] =     screen_buffer[i / 4];   // R
        data[i + 1] = screen_buffer[i / 4];   // G
        data[i + 2] = screen_buffer[i / 4];   // B
        data[i + 3] = 255; // A (alpha)
    }
    ctx.putImageData(screen_image_data, 0, 0);
}