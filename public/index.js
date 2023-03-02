import { get } from "./modules/state.js";

function sync(input) {
    get(input, (data) => console.log(data))
        //.then((data) => //write to host state and merge with unstaged // workers)
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
