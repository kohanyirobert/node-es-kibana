& docker-compose exec nodejs node app.js create my_index
& docker-compose exec nodejs node app.js putMapping my_index my.mapping.json
& docker-compose exec nodejs node app.js sample-data my_index $(24 * 60 * 60)
& docker-compose exec nodejs node app.js search my_index my.search.json
