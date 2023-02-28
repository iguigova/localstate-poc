import { get, toState, fromState } from "./modules/state.js";

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

var s0 = [
  {
    "id": 1,
  }, {"id": 2 }];

var s =
  {
      "id": 1,
      "comment": {"text": "hello"}
  };

var s1 = [
  {
    "id": 1,
    "title": "json-server",
    "author": "typicode",
    "comments": [
      {
        "id": 1,
        "body": "some comment",
        "postId": 1
      }
    ]
  }
];


var s2 = {
    "created_at":"MonSep3004:04:53+00002013",
    "id_str":"384529256681725952",
    "user": {
      "id":31424214,
      "location":"COLUMBUS"
    },
    "coordinates":{
      "type":"Point",
      "values":[
         13,
         99
      ]
    }
};

console.log(s);
//console.log(toState(s));
//console.log(fromState(toState(s)));
console.log(JSON.stringify(fromState(toState(s))) === JSON.stringify(s));
