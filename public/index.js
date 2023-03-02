import { get, stash } from "./modules/state.js";

function sync(input, ondata) {
    // https://developer.mozilla.org/en-US/docs/Web/API/URL
    const url = new URL(input);
    
    get(url, (data) => ondata ? ondata(data) : console.log(data))
        .then((data) => stash(url, data)) // then merge with unstaged // workers)
        .catch((error) => console.log(error));
}  

var input = document.getElementById("geturlinput");
var submit = document.getElementById("geturlsubmit")

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sync(input.value);
    }
});

submit.addEventListener("click", function(event) {
    sync(input.value);
});
