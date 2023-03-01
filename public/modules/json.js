
// summary: flatten obj by enumerating properties' path and value
// https://stackoverflow.com/questions/722668/traverse-all-the-nodes-of-a-json-object-tree-with-javascript
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

// summary: add value to obj at given path
function inverse(obj, path, value, index = 0){

    let child = next(path, value, index);

    if (child){
        // https://stackoverflow.com/questions/33066787/access-a-nested-property-with-a-string
        let parent = path.slice(0, Math.min(index, path.length - 1)).reduce(function(p, prop) { return p[prop] }, obj);
        let key = path[index];
    
        if (isNaN(key)) // property
        {
            parent[key] = parent[key] ?? child;
        }
        else if (parent.length - 1 < key) // index
        {
            parent.push(child);
        }

        inverse(obj, path, value, index + 1);
    }
}

// summary: build node at index for given path
function next(path, value, index){
    let node;
    
    if (index < path.length - 1)
    {
        node = isNaN(path[index + 1]) ? {} : [];
    }
    else if (index == path.length - 1) // leaf
    {
        node = value;
    }

    return node;
}


export { traverse, inverse } 
