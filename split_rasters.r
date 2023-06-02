library(terra)

files <- list.files("C:/Users/Eduardo/Desktop/bd_cata/results/", pattern = "*.tif", full.names = TRUE)


for (i in 1:length(files)) {
  r <- rast(files[i])
  for(j in 1:nlyr(r)) {
    writeRaster(r[[j]], paste0("C:/Users/Eduardo/Desktop/bd_cata/results/", names(r[[j]]), ".tif"), gdal = "COMPRESS=DEFLATE")
  }
}
