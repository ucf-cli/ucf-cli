#!/usr/bin/env node
debugger;
console.log('hello world! at '+ (new Date()).toString());
debugger;
var args = require('minimist')(process.argv.slice(2), {
    string: ["hello"]
});

console.log(args);