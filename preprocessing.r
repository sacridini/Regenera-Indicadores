df = data.table::fread("W:/regenera/table/Regenera_all_plot_data_produto2_ATBC.csv")
df = na.omit(df)
quatorze_classes = c("Age",
                     "CWD",
                     "MAP",
                     "temp.dry",
                     "HAND",
                     "Bulk.density",
                     "CEC",
                     "Clay",
                     "SCC",
                     "pH",
                     "landscape.forest.cover",
                     "local_deforest_frequency",
                     "local_fire_frequency",
                     "local_land.duration")
quatorze_classes = c(quatorze_classes, alvo)
df_sub = df[, ..quatorze_classes]

df_sf <- st_as_sf(na.omit(df), coords = c("longitude_degrees","latitude_degrees"))

num_linhas_com_na <- sum(apply(df, 1, function(x) any(is.na(x))))
print(num_linhas_com_na)

na_por_coluna <- colSums(is.na(df))
print(na_por_coluna)



my_vector = c("Age", 
              "MAT",
              "Seas.temp",
              "temp.dry",
              "MAP",
              "Seas.prec.",
              "MQwarm.prec",
              "CWD",
              "HAND",
              "Bulk.density",
              "CEC",
              "Clay",
              "N",
              "pH",
              "Sand",
              "SOC",
              "local_deforest_frequency",
              "local_fire_frequency",
              "local_nchanges",
              "local_land.duration",
              "landscape.forest.cover",
              "SCC",
              "inext_100ind")

df_sub = df[, ..my_vector]


files = list.files("W:\\regenera\\raster\\", full.names = T, pattern = "*.tif")

raster_stack = terra::rast(files[1:22])

raster_names = c("HAND",
                 "landscape.forest.cover",
                 "MAT",
                 "Seas.temp",
                 "temp.dry",
                 "MAP",
                 "Seas.prec.",
                 "MQwarm.prec",
                 "CWD",
                 "local_deforest_frequency",
                 "local_land.duration",
                 "local_fire_frequency",
                 "local_nchanges",
                 "Age",
                 "SCC",
                 "Bulk.density",
                 "CEC",
                 "Clay",
                 "N",
                 "pH",
                 "Sand",
                 "SOC")

names(raster_stack) = raster_names

terra::writeRaster(raster_stack, "W:\\regenera\\raster\\variables_stack.tif", gdal = "COMPRESS=DEFLATE", overwrite = TRUE)
