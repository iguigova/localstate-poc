import { get, toState, fromState } from "./modules/state.js";

let sarr = [
    [{ "id": 1 }, {"id": 2 }],
    {
        "id": 1,
        "comment": {"text": "hello"}
    },
    [{
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
    }],
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
    }];

for (const s of sarr){
    console.assert(JSON.stringify(fromState(toState(s))) == JSON.stringify(s), "%o", { json: s, state: toState(s), result: fromState(toState(s))});
}

get('http://localhost:3000/posts?_embed=comments', (data) => console.assert(JSON.stringify(data) == JSON.stringify(sarr[2]), "%o", {json: sarr[2], result: data}));
