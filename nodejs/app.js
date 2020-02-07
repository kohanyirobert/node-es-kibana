const process = require('process')
const path = require('path')
const fs = require('fs')
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://elasticsearch:9200' })

const errIndent = 2

function errHandler(err, result) {
    if (err) {
        console.error(JSON.stringify(err, null, errIndent))
    }
}

if (process.argv.length <= 2) {
    console.error('First argument should be one of the following: index, create, delete, putMapping')
    process.exit(-1)
}

if (process.argv.length <= 3) {
    console.error('First argument should be an Elastic Search index name.')
    process.exit(-1)
}

const command = process.argv[2]
const index = process.argv[3]
if (command === 'index' || command === 'putMapping')  {
    if (process.argv.length <= 4) {
        console.error("Second argument should be a JSON file's path.")
        process.exit(-2)
    }
    
    let json = JSON.parse(fs.readFileSync(path.join('data', process.argv[4])).toString())
    if (command === 'index') {
        // NOTE: JSON objects and arrays can be indexed.
        if (!Array.isArray(json)) {
            json = [json]
        }
        json.forEach(data => client.index({ index: index, body: data }, errHandler))
    } else if (command === 'putMapping') {
        client.indices.putMapping({ index: index, body: json }, errHandler)
    }
} else if (command === 'create' || command === 'delete') {
    if (command === 'create') {
        client.indices.create({ index: index }, errHandler);
    } else {
        client.indices.delete({ index: index }, errHandler);
    }
} else {
    console.error(`Unkown command: ${command}`)
}
