import { open, put, getall } from "./storage.js";
import { traverse, inverse } from "./json.js";

function getlocal(dbname, storename){

    return new Promise((resolve, reject) => {
        open(dbname, storename)
            .then((db) => getall(db, storename))
            .then((result) => {
                result.get('db').close();
                resolve(result.get('items'))
            })
            .catch((error) => reject(error));
    });
}

function getremote(url){
    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        // .then((data) => {
        //     console.log(data);
        // });
}

function get(input){
    // https://stackoverflow.com/questions/73542644/get-request-with-js
    // const url = "http://localhost:3000/posts?_embed=comments"; //"/books?" + new URLSearchParams({rank, title});

    // https://developer.mozilla.org/en-US/docs/Web/API/URL
    const url = new URL(input);
    
    return getlocal("unstaged", url.pathname + url.search)
        .then((items) => getlocal(url.hostname, url.pathname + url.search))
        .then((items) => getremote(url));
}

function toState(json){
    let items = [];
    
    for(let [key, value, path, parent] of traverse(json)) {

        if (value === null || typeof(value) !== "object"){
            items.push({id: path.join('.'), value: value})
        }
    }

    return items;
}

function fromState(items){
    let obj = isNaN(items && items.length > 0 && items[0].id.split('.')[0]) ? {} : [];
    
    for (let item of items){
        inverse(obj, item.id.split('.'), item.value);
    }

    return obj;
}


export { get, toState, fromState }

/*
[
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
]

0.id = 1
0.title = "json-server"
0.comments.0.id = 1
0.comments.0.body = "some comment"


  {
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
  }
*/
