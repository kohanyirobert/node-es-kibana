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
* Searching/querying aggregated data - `docker-compose exec nodejs node app.js search <ES index name> <path to JSON file>`
* Generate sample data - `docker-compose exec nodejs node app.js sample-data <ES index name> <number of samples>`

**Note**: when using `search` refer to `my.search.json` which defines the aggregation scheme. Change `calendar_interval`'s value to `3d`, `1w`, or similar ([refer to this documentation for allowed values](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-datehistogram-aggregation.html#calendar_intervals)).

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

Run this to create a more complex setup.

```
docker-compose exec nodejs node app.js create my_index
docker-compose exec nodejs node app.js putMapping my_index my.mapping.json
docker-compose exec nodejs node app.js sample-data my_index 10000
```

or run the appropriate `run-sample` script (`.ps1` or `.sh`).

After this open http://localhost:5601 and
* create an index pattern called `my_index` (on the startup screen or from the right-side menu, *Management* > *Index Patters*) and
* import one of the visualization as saved objects (go to *Management* > *Saved Objects*) by browser for the one of the `*-visualization.ndjson` file included in the repo in the import dialog.
* **Choose the index pattern you'd like to associate the visualization with.**
* Then go to *Visualize* and choose one the imported visualization.
* Configure the date selector like this `now - ~ in 8 days`. To do this select `now` in the "from" (left) panel and `relative` in the "to" (right) panel and choose _1 Weeks from now" (the `sample-data` command generate data from _now_ up till a few news in 15 minute increments).
* Finally, depending on the visualization 
  * go to the panel on the left go to *Buckets* and configure *X-axis* and choose the required time resolution in the *Minimum interval* dropdown, or
  * go to the bottom panel and open *Panel options* and change the *Interval* on the *Data* tab.  

Issue this command to delete indexed docs to restart, etc.

```
docker-compose exec nodejs node app.js delete my_index
```

To reset Elasticsearch's storage completely run

```
docker volume prune
```

and select `y`, but this **deletes all local data on any volume, beware!**

# Updating

Whenever `app.js` changes (or something else related to the up) run these commands.

`docker-compose up --build`

or

`docker-compose up --build -d`

This will rebuild images that are no longer up-to-date and recreate/restart them.

# Kibana Dev Tools

[Kibana's UI has a built-in dev tool](http://localhost:5601/app/kibana#/dev_tools) where it's possible to send queries and commands against its backing Elastic Search instance.

E.g. **to query samples for a particular sensor** open the dev tool window and into the editor write a query like this

```
GET my_index/_search
{
  ...
}
```

but replace the JSON payload with the contents of `my.sensor-time-range-search.json`.

To **delete the same data for a particular sensor** instead send a delete request

```
DELETE my_index/_delete_by_query
{
  ...
}
```

and use the same query JSON as the request's body.
