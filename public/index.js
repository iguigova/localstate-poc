import { get, stash, merge, diff, put } from "./modules/state.js";

function sync(url, ondata) {  
    get(url, (data) => ondata ? ondata(data) : console.log(data))
        .then((data) => stash(url, data))
        .then(() => merge(url))
        .then(() => diff(url))
        .then((responses) => console.log(responses))
        .catch((error) => console.error(error));
}

function update(method, url, data){
    put(method, url, data)
        .then(() => diff(url))
        .then((responses) => console.log(responses))
        .catch((error) => console.error(error));
}

var url = document.getElementById("url");
var getsubmit = document.getElementById("getsubmit")
var body = document.getElementById("body");
var putsubmit = document.getElementById("putsubmit");

url.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sync(new URL(url.value), (data) => body.value = JSON.stringify(data));
    }
});

getsubmit.addEventListener("click", function(event) {
    sync(new URL(url.value), (data) => body.value = JSON.stringify(data));
});

putsubmit.addEventListener("click", function(event) {
    update("PUT", new URL(url.value), JSON.parse(body.value));
});
