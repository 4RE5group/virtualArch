/*
    Terminal displaying functions
*/

const SCREEN_WIDTH  = 320; // screen width  in pixels
const SCREEN_HEIGHT = 200; // screen height in pixels
const SCALE_RATIO   = 2;   // screen scale ratio
const FONT_SIZE		= 8;  // terminal font size


var screen_buffer = new Array(SCREEN_WIDTH*SCREEN_HEIGHT).fill(0);
var screen_canvas;
var ctx;
var screen_image_data;

function    initScreen()
{
    // get canvas
    screen_canvas = document.getElementById("terminal_screen");
    if (!screen_canvas) {
        console.error("error: could not find screen canvas");
        return (-1);
    }
    // fix canvas size (CSS size)
    screen_canvas.style.width = (SCREEN_WIDTH * SCALE_RATIO) + "px";
    screen_canvas.style.height = (SCREEN_HEIGHT * SCALE_RATIO) + "px";
    // set canvas logical size (for drawing)
    screen_canvas.width = SCREEN_WIDTH;
    screen_canvas.height = SCREEN_HEIGHT;
    // init canvas context
    ctx = screen_canvas.getContext('2d', {willReadFrequently: true});
    ctx.scale(SCALE_RATIO, SCALE_RATIO);
    // create image data with logical dimensions
    screen_image_data = ctx.createImageData(SCREEN_WIDTH, SCREEN_HEIGHT);
}

function displayScreen()
{
    const data = screen_image_data.data;
    const canvasWidth = screen_image_data.width;
    const canvasHeight = screen_image_data.height;
    const totalPixels = canvasWidth * canvasHeight;

    // Clear the canvas
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 0;       // R
        data[i + 1] = 0;   // G
        data[i + 2] = 0;   // B
        data[i + 3] = 255; // A
    }

    // Fill only the pixels for which we have data
    const pixelsToFill = Math.min(screen_buffer.length, totalPixels);
    for (let i = 0; i < pixelsToFill; i++) {
        const grayValue = Math.min(255, screen_buffer[i] * 255);
        data[i * 4] = grayValue;     // R
        data[i * 4 + 1] = grayValue; // G
        data[i * 4 + 2] = grayValue; // B
        data[i * 4 + 3] = 255;       // A
    }

    ctx.putImageData(screen_image_data, 0, 0);
}

function    updateScreenbuffer()
{
    // Get the current pixel data from the canvas
    const imageData = ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    const data = imageData.data;

    for (let i = 0; i < SCREEN_WIDTH * SCREEN_HEIGHT; i++) {
        // Check if any of R, G, or B is non-zero (i.e., pixel is not black)
        // You can also use data[4*i + 3] to check alpha if needed
        const pixelIndex = 4 * i;
        const isPixelSet = (data[pixelIndex] > 0 || data[pixelIndex + 1] > 0 || data[pixelIndex + 2] > 0);
        screen_buffer[i] = isPixelSet ? 1 : 0;
    }
}


function	writeCharacter(column, row, character)
{
	if (typeof(character) == 'string' && character.length === 1 && typeof(FONT_SIZE) == 'number')
	{
		ctx.font = FONT_SIZE+"px Arial";
		ctx.fillStyle = "#ffffff";
		ctx.fillText(character, column*FONT_SIZE, (row+1)*FONT_SIZE);
        updateScreenbuffer();
	} else {
		console.error("error: invalid input");
	}
}

function clearScreen()
{
	// clean screen buffer
	screen_buffer = new Array(SCREEN_WIDTH*SCREEN_HEIGHT).fill(0);
    displayScreen();
}