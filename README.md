# Running

Start with

`docker-compose up`

to see the log for each service in the foreground, or

`docker-compose up -d`

to leave services run in the background.

Wait for the services to start and visit
* http://localhost:9001 for Elastic Search and
* http://localhost:5601 for Kibana.

# Indexing

Run

`docker-compose exec nodejs node index.js <ES index name> <path to JSON file>`

e.g.

`docker-compose exec nodejs node index.js my_index my.json`

Let's break it down.

* `docker-compose exec` is used to issue a command on a *running* container.
* `nodejs` is the name of the service which tells `docker-compose exec` on which container we'd like to run our command.
* `node index.js` is the command we'd like to run (our script).
* `my_index my.json` are the two arguments we pass to the script, `my_index` being an ES index's name and `my.json` is file's path **in the current working directory**.

# Updating

Whenever `index.js` changes (or something else related to the up) run these commands.

`docker-compose up --build`

or

`docker-compose up --build -d`

This will rebuild images that are no longer up-to-date and recreate/restart them.
