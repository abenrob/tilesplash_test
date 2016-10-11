var Tilesplash = require('tilesplash');
var app = new Tilesplash('postgres://postgres@localhost:5432/pop_pts');

app.server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.cache(function(tile){
  return app.defaultCacheKeyGenerator(tile);
}, 1000 * 60 * 60 * 24 * 30); //ttl 30 days

app.layer('canada', function(tile, render){
  render('SELECT id, ST_AsGeoJSON(the_geom) as the_geom_geojson, population FROM canada WHERE ST_Intersects(the_geom, !bbox_4326!)');
});

app.layer('canada2', function(tile, render){
  render({
    population: 'SELECT id, ST_AsGeoJSON(the_geom) as the_geom_geojson, population FROM canada WHERE ST_Intersects(the_geom, !bbox_4326!)'
  });
});

app.layer('uk', function(tile, render){
  render({
    population: 'SELECT "ID" as id, ST_AsGeoJSON(the_geom) as the_geom_geojson, ROUND("Census2011Popn") as population FROM ukcensus WHERE ST_Intersects(the_geom, !bbox_4326!)'
  });
});

app.layer('ukgrid', function(tile, render){
  if (tile.z < 7) {
    // id has layer appended for guaranteed uniqueness
    render('SELECT \'uk15000_\'||gid as id, st_y(centroid) as lat, st_x(centroid) as lng, ST_AsGeoJSON(the_geom) as the_geom_geojson FROM uk_grid15000 WHERE ST_Intersects(the_geom, !bbox_4326!)');
  } else if (tile.z < 9) {
    // id has layer appended for guaranteed uniqueness
    render('SELECT \'uk10000_\'||gid as id, st_y(centroid) as lat, st_x(centroid) as lng, ST_AsGeoJSON(the_geom) as the_geom_geojson FROM uk_grid10000 WHERE ST_Intersects(the_geom, !bbox_4326!)');
  } else if (tile.z < 11) {
    // id has layer appended for guaranteed uniqueness
    render('SELECT \'uk5000_\'||gid as id, st_y(centroid) as lat, st_x(centroid) as lng, ST_AsGeoJSON(the_geom) as the_geom_geojson FROM uk_grid5000 WHERE ST_Intersects(the_geom, !bbox_4326!)');
  }  else if (tile.z < 13) {
    // id has layer appended for guaranteed uniqueness
    render('SELECT \'uk1000_\'||gid as id, st_y(centroid) as lat, st_x(centroid) as lng, ST_AsGeoJSON(the_geom) as the_geom_geojson FROM uk_grid1000 WHERE ST_Intersects(the_geom, !bbox_4326!)');
  } else if (tile.z < 20) {
    // id has layer appended for guaranteed uniqueness
    render('SELECT \'uk500_\'||gid as id, st_y(centroid) as lat, st_x(centroid) as lng, ST_AsGeoJSON(the_geom) as the_geom_geojson FROM uk_grid500 WHERE ST_Intersects(the_geom, !bbox_4326!)');
  } else {
    render.empty();
  }
});


app.server.listen(3333, function () {
  console.log('Tilestream app listening on port 3333!');
});