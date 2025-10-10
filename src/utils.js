function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}



const originalConsoleError = console.error;

// override console.error
console.error = function (...args) {
    originalConsoleError.apply(console, args);

    // convert error arguments to string
    const message = args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch (e) {
                return '[object with circular refs]';
            }
        }
        return String(arg);
    }).join(' ');

    // Add error to error view
    const p = document.createElement('p');
    p.style.color = 'red';
    p.textContent = message;

    document.querySelector(".error_view").appendChild(p);
};