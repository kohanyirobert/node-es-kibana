# Running

Start with

`docker-compose up`

to see the log for each service in the foreground, or

`docker-compose up -d`

to leave services run in the background.

Wait for the services to start and visit
* http://localhost:9001 for Elasticsearch and
* http://localhost:5601 for Kibana.

**Note**: this also sets up a volume where Elasticsearch's data is going to be stored persistently across restarts.

# Commands

* Indexing documents - `docker-compose exec nodejs node app.js index <ES index name> <path to JSON file>`
* Creating indices - `docker-compose exec nodejs node app.js create <ES index name>`
* Deleting indices - `docker-compose exec nodejs node app.js delete <ES index name>`
* Creating/updating mappings - `docker-compose exec nodejs node app.js putMapping <ES index name> <path to JSON file>`
* Generate sample data - `docker-compose exec nodejs node app.js sample-data <ES index name>`

## Example

`docker-compose exec nodejs node app.js index my_index my.json`

Let's break it down.

* `docker-compose exec` is used to issue a command on a *running* container.
* `nodejs` is the name of the service which tells `docker-compose exec` on which container we'd like to run our command.
* `node app.js` is the command we'd like to run (our script).
* `index my_index my.json` are the three arguments we pass to the script
  * `index` is the name of the command we'd like to run,
  * `my_index` being an ES index's name and
  * `my.json` is file's path **in the current working directory**.

## Complex Example

```
docker-compose exec nodejs node app.js create my_index
docker-compose exec nodejs node app.js putMapping my_index my.mapping.json
docker-compose exec nodejs node app.js index my_index my.json
docker-compose exec nodejs node app.js sample-data my_index
docker-compose exec nodejs node app.js delete my_index
```

# Updating

Whenever `app.js` changes (or something else related to the up) run these commands.

`docker-compose up --build`

or

`docker-compose up --build -d`

This will rebuild images that are no longer up-to-date and recreate/restart them.
