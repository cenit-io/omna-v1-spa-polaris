Array.prototype.chunk = function (chunk_size) {
    let results = [];

    while ( this.length ) results.push(this.splice(0, chunk_size));

    return results;
};