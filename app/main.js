const greeter = require('./Greeter.js');
const style = require('./main.css')
console.log(greeter);
document.querySelector("#root").appendChild(greeter());
