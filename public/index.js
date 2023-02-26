import { get } from "./modules/state.js";

function read(input) {
    get(input)
        .then((items) => console.log(items))
        .catch((error) => console.log(error));
}  

var input = document.getElementById("geturlinput");
var submit = document.getElementById("geturlsubmit")

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        read(input.value);
    }
});

submit.addEventListener("click", function(event) {
    read(input.value);
});
