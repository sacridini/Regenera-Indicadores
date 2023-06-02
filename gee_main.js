var cwd = ee.Image("users/eduardolacerdageo/bd_cata/CWD_amz_albers_1km"),
    bulk_density = ee.Image("users/eduardolacerdageo/bd_cata/soilgrids_bulk_density_amz_albers_1km"),
    soil_cation = ee.Image("users/eduardolacerdageo/bd_cata/KrigeSoil_fernRcropNEW_albers_1km"),
    duration = ee.Image("users/eduardolacerdageo/bd_cata/duration_of_land_use_1986_2018_amz_albers_1km"),
    soil_clay = ee.Image("users/eduardolacerdageo/bd_cata/soilgrids_clay_amz_albers_1km"),
    deforestation_frequency = ee.Image("users/eduardolacerdageo/bd_cata/deforestation_frequency_1987_2019_amz_1km_nodata_moda");

var age = [5, 10, 15, 20];

var stack = cwd.addBands([bulk_density,soil_cation,duration,deforestation_frequency, soil_clay])
                .rename(["cwd", "bulk_density", "soil_cation", "duration", "deforestation_frequency", "soil_clay"]);

age.map(function(i) {

  // AGB - Aboveground Biomass
  var agb = stack.expression(
    '542.674038 + (44.5392656 * log('+ i +')) + (-383.34476 * bulk_density) + (-13.957715 * soil_clay) + (-1.254777 * 8)', {
      'cwd': stack.select('cwd'),
      'bulk_density': stack.select('bulk_density'),
      'soil_clay': stack.select('soil_clay')
  }).rename('agb_1km_year_'+ i);
  
  // BA - Basal Area
  var ba = stack.expression(
    '70.1934907 + (7.6752935 * log('+ i +')) + (-57.4251618 * bulk_density) + (-0.1557412 * 8) + (-1.0761708 * 1)', {
      'bulk_density': stack.select('bulk_density')
  }).rename('ba_1km_year_'+ i);
  
  // SH - Strutuctural heterogenity
  var sh = stack.expression(
    '0.506094951 + (0.053737717 * log('+ i +')) + (-0.316338839 * bulk_density) + (-0.007759209 * 1)', {
      'bulk_density': stack.select('bulk_density')
  }).rename('sh_1km_year_'+ i);
  
  // Max DBH - Diâmetro máximo de indíviduo no plot
  var max_dbh = stack.expression(
    '84.9099110 + (7.0475686 * log('+ i +')) + (-64.7356936 * bulk_density) + (-0.8634009 * 1)', {
      'bulk_density': stack.select('bulk_density')
  }).rename('max_dbh_1km_year_'+ i);
  
  /* // Stem density
  var stem_density = stack.expression(
    '4.607 + (0.389 * '+ i +') + (0.497 * pow('+ i +', 2)) +(-0.444 * pow('+ i +',3)) + (-0.285 * deforestation_frequency)', {
      'deforestation_frequency': stack.select('deforestation_frequency')
  }).rename('stem_density_1km_year_'+ i); */
  
  // Species richness
  var spc_rich = stack.expression(
    '6.9296226 + (9.5947973 * log('+ i +')) + (-2.1550957 * soil_clay)', {
      'soil_clay': stack.select('soil_clay')
  }).rename('spc_rich_1km_year_'+ i);
  
  // Diversity hill
    var div_hill = stack.expression(
    '-7.3434351 + (11.5952501 * log('+ i +')) + (-3.1079484 * soil_clay) + (-0.9760437 * 1)', {
      'soil_clay': stack.select('soil_clay')
  }).rename('div_hill_1km_year_'+ i);
  
  var results = agb.addBands([ba, sh, max_dbh, spc_rich, div_hill]);
  
  Export.image.toDrive({
    image: results,
    scale: 250,
    description: 'results_1km_year_'+ i,
    fileNamePrefix: 'results_1km_year_'+ i,
    folder: 'ee',
    maxPixels: 1e13
  });
  
});
