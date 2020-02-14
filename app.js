const process = require('process')
const path = require('path')
const fs = require('fs')
const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://elasticsearch:9200' })

function random(low, high) {
  return Math.random() * (high - low) + low
}

function errHandler(err, result) {
    if (err) {
        console.error(JSON.stringify(err, null, 2))
    }
}

async function bulkIndex(size, remaining, datetime, step, sensor) {
    const dataset = []
    for (let i = 0; i < size; i++) {
        const timestamp = datetime.toISOString()
        dataset.push({
            sensor: sensor.id,
            timestamp: timestamp.substring(0, 10) + ' ' + timestamp.substring(11, 19),
            value: random(sensor.low, sensor.high)
        })
        datetime.setSeconds(datetime.getSeconds() + step)
    }
    await client.bulk({ body: dataset.flatMap(doc => [{ index: { _index: index } }, doc])})
    if (remaining >= size) {
        bulkIndex(size, remaining - size, datetime, step, sensor)
    } else if (remaining > 0) {
        bulkIndex(remaining, 0, datetime, step, sensor)
    }
}

if (process.argv.length <= 2) {
    console.error('First argument should be one of the following: index, create, delete, putMapping, sample-data')
    process.exit(-1)
}

if (process.argv.length <= 3) {
    console.error('First argument should be an Elastic Search index name.')
    process.exit(-1)
}

const command = process.argv[2]
const index = process.argv[3]
if (command === 'index' || command === 'putMapping' || command === 'search')  {
    if (process.argv.length <= 4) {
        console.error("Second argument should be a JSON file's path.")
        process.exit(-1)
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
    } else if (command === 'search') {
        client.search({
            index: index,
            filter_path: '**.by_sensor.buckets.key,**.by_timestamp.buckets.key_as_string,**.by_avg_value.value',
            body: json
        }, function(err, result) {
            if (err) {
                console.error(JSON.stringify(err, null, 2))
            }
            console.log(JSON.stringify(result.body))
        })
    }
} else if (command === 'create' || command === 'delete') {
    if (command === 'create') {
        client.indices.create({ index: index }, errHandler)
    } else {
        client.indices.delete({ index: index }, errHandler)
    }
} else if (command === 'sample-data') {
    if (process.argv.length <= 4) {
        console.error("Second argument should be the number of samples to generate per sensor")
        process.exit(-1)
    }
    const samples = parseInt(process.argv[4])
    const sensors = [
        {
            id: 'AAAAAAAA-11111111-AAAAAAAA',
            low: 25.0,
            high: 35.0
        },
        {
            id: 'BBBBBBBB-22222222-BBBBBBBB',
            low: 16.0,
            high: 20.0
        },
        {
            id: 'CCCCCCCC-33333333-CCCCCCCC',
            low: 16.0,
            high: 46.0
        },
        {
            id: 'DDDDDDDD-44444444-DDDDDDDD',
            low: 32.0,
            high: 34.0
        }
    ]
    const start = new Date()
    start.setHours(0)
    start.setMinutes(0)
    start.setSeconds(0)
    start.setMilliseconds(0)
    sensors.forEach((sensor) => {
        const datetime = new Date()
        datetime.setTime(start.getTime())
        const size = 1000
        if (samples >= size) {
            bulkIndex(size, samples - size, datetime, 1, sensor)
        } else if (samples > 0) {
            bulkIndex(samples, 0, datetime, 1, sensor)
        }
    })
} else {
    console.error(`Unkown command: ${command}`)
}
