const process = require('process')
const path = require('path')
const fs = require('fs')
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://elasticsearch:9200' })

if (process.argv.length <= 2) {
    console.error('First argument should be an Elastic Search index name.')
    process.exit(-1)
}

if (process.argv.length <= 3) {
    console.error("Second argument should be a JSON file's path.")
    process.exit(-2)
}

const index = process.argv[2]
const json = fs.readFileSync(path.join('data', process.argv[3])).toString()

const result = client.index({
    index: index,
    body: json
}, (err, result) => {
    if (err) {
        console.log(err)
    } else {
        console.log("OK")
    }
})

