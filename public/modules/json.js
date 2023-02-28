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
function* traverse(obj, path = []) {
    for (var key of Object.keys(obj)) {

        const itemPath = path.concat(key);

        yield [key, obj[key], itemPath, obj];
        
        if (obj[key] !== null && typeof(obj[key]) == "object") {
            //going one step down in the object tree!!
            yield* traverse(obj[key], itemPath);
        }
    }
}

function inverse(obj, path, value, index = 0){
    // https://stackoverflow.com/questions/33066787/access-a-nested-property-with-a-string
    let parent = path.slice(0, Math.min(index, path.length - 1)).reduce(function(p, prop) { return p[prop] }, obj);
    let key = path[index];
    
    if (index < path.length - 1) {

        let child = isNaN(path[index + 1]) ? {} : [];
        
        if (isNaN(key)){ // property node
            parent[key] = parent[key] ?? child;
        } else {         // index node
            if (parent.length - 1 < key){
                parent.push(child);
            }
        }

        inverse(obj, path, value, index + 1);
        
    } else if (index == path.length - 1){ // leaf
        parent[key] = value;
    }
}


export { traverse, inverse } 
