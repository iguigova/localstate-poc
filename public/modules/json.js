// https://stackoverflow.com/questions/722668/traverse-all-the-nodes-of-a-json-object-tree-with-javascript
// function traverse(jsonObj) {
//     if( jsonObj !== null && typeof jsonObj == "object" ) {
//         Object.entries(jsonObj).forEach(([key, value]) => {
//             // key is either an array index or object key
//             traverse(value);
//         });
//     }
//     else {
//         // jsonObj is a number or string
//     }
// }
// TODO: add the logic for self-referencing nodes
function* traverse(o, path=[]) {
    for (var i of Object.keys(o)) {

        const itemPath = path.concat(i);

        yield [i, o[i], itemPath, o];
        
        if (o[i] !== null && typeof(o[i]) == "object") {
            //going one step down in the object tree!!
            yield* traverse(o[i], itemPath);
        }
    }
}


export { traverse } 
