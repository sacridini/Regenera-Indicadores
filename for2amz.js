var cwd = ee.Image("users/eduardolacerdageo/bd_cata/CWD_amz_albers_1km"),
    bulk_density = ee.Image("users/eduardolacerdageo/bd_cata/soilgrids_bulk_density_amz_albers_1km"),
    soil_cation = ee.Image("users/eduardolacerdageo/bd_cata/KrigeSoil_fernRcropNEW_albers_1km"),
    duration = ee.Image("users/eduardolacerdageo/bd_cata/duration_of_land_use_1986_2018_amz_albers_1km"),
    soil_clay = ee.Image("users/eduardolacerdageo/bd_cata/soilgrids_clay_amz_albers_1km"),
    deforestation_frequency = ee.Image("users/eduardolacerdageo/bd_cata/deforestation_frequency_1987_2019_amz_1km_nodata_moda");

var year = [5, 10, 20];

var stack = cwd.addBands([bulk_density,soil_cation,duration,deforestation_frequency, soil_clay])
                .rename(["cwd", "bulk_density", "soil_cation", "duration", "deforestation_frequency", "soil_clay"]);

year.map(function(i) {

  // AGB - Aboveground Biomass
  var agb = stack.expression(
    '624.75849 + (3.77776 * '+ i +') + (0.18765 * cwd) + (-383.34476 * bulk_density) + (107.11829 * soil_cation) + (-1.33201 * duration) + (-12.11599 * deforestation_frequency)', {
      'cwd': stack.select('cwd'),
      'bulk_density': stack.select('bulk_density'),
      'soil_cation': stack.select('soil_cation'),
      'duration': stack.select('duration'),
      'deforestation_frequency': stack.select('deforestation_frequency')
  }).rename('agb_1km_year_'+ i);
  
  // BA - Basal Area
  var ba = stack.expression(
    '95.54062 + (0.5179 * '+ i +') + (-68.24228 * bulk_density) + (7.91044 * soil_cation) + (-0.28491 * duration) + (-1.14331 * deforestation_frequency)', {
      'bulk_density': stack.select('bulk_density'),
      'soil_cation': stack.select('soil_cation'),
      'duration': stack.select('duration'),
      'deforestation_frequency': stack.select('deforestation_frequency')
  }).rename('ba_1km_year_'+ i);
  
  // SH - Strutuctural heterogenity
  var sh = stack.expression(
    '0.7317 + (0.003345 * '+ i +') + (-0.4368 * bulk_density) + (-0.008744 * deforestation_frequency)', {
      'bulk_density': stack.select('bulk_density'),
      'deforestation_frequency': stack.select('deforestation_frequency')
  }).rename('sh_1km_year_'+ i);
  
  // Max DBH - Diâmetro máximo de indíviduo no plot
  var max_dbh = stack.expression(
    '113.9943 + (0.4538 * '+ i +') + (-79.7391 * bulk_density) + (-0.9628 * deforestation_frequency)', {
      'bulk_density': stack.select('bulk_density'),
      'deforestation_frequency': stack.select('deforestation_frequency')
  }).rename('max_dbh_1km_year_'+ i);
  
  // Stem density
  var stem_density = stack.expression(
    '4.607 + (0.389 * '+ i +') + (0.497 * pow('+ i +', 2)) +(-0.444 * pow('+ i +',3)) + (-0.285 * deforestation_frequency)', {
      'deforestation_frequency': stack.select('deforestation_frequency')
  }).rename('stem_density_1km_year_'+ i);
  
  // Species richness
  var spc_rich = stack.expression(
    '26.02426 + (0.54569 * '+ i +') + (-2.38023 * soil_clay) + (-1.5045 * deforestation_frequency)', {
      'soil_clay': stack.select('soil_clay'),
      'deforestation_frequency': stack.select('deforestation_frequency')
  }).rename('spc_rich_1km_year_'+ i);
  
  // Diversity hill
    var div_hill = stack.expression(
    '12.11846 + (0.75912 * '+ i +') + (7.65384 * soil_cation) + ( -0.8243 * deforestation_frequency)', {
      'soil_cation': stack.select('soil_cation'),
      'deforestation_frequency': stack.select('deforestation_frequency')
  }).rename('div_hill_1km_year_'+ i);
  
  var results = agb.addBands([ba, sh, max_dbh, stem_density, spc_rich, div_hill]);
  
  Export.image.toDrive({
    image: results,
    scale: 1000,
    description: 'results_1km_year_'+ i,
    fileNamePrefix: 'results_1km_year_'+ i,
    folder: 'ee',
    maxPixels: 1e13
  });
  
});

// Map.centerObject(max_dbh.geometry(), 5);
// Map.addLayer(max_dbh);
