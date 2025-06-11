library(terra)
library(sf)
library(mlr3)
library(mlr3learners)
library(future)

alvo = "prop_sp_large_birds"

# Input data preparation --------------------------------------------------
df = data.table::fread("D:\\BioGeo\\ribeiroe\\regenera\\table/Regenera_all_plot_data_produto2_ATBC.csv")
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

raster_paths = list.files("D:\\BioGeo\\ribeiroe\\regenera\\raster\\", full.names = T, pattern = "*.tif")
input_raster = terra::rast(raster_paths)
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
                 "Age",
                 "local_nchanges",
                 "SCC",
                 "Bulk.density",
                 "CEC",
                 "Clay",
                 "N",
                 "pH",
                 "Sand",
                 "SOC")

names(input_raster) = raster_names
# input_raster = subset(input_raster, which(names(input_raster) %in% quatorze_classes))

# Set input training data -------------------------------------------------
mlr3_tsk = mlr3::TaskRegr$new(
  id = alvo,
  backend = mlr3::as_data_backend(df_sub),
  target = alvo
)

# Escolha do modelo e dos seus par?metros
learner = mlr3::lrn("regr.ranger", importance = "impurity",
                    mtry = 5, num.trees = 500, max.depth = 5)

# Cross validation --------------------------------------------------------
future::plan("multisession", workers = 20)
resampling = mlr3::rsmp("repeated_cv", folds = 5, repeats = 10) # setting resampling method
rr_cv_rf = mlr3::resample(task = mlr3_tsk,
                          learner = learner,
                          resampling = resampling)



# Measuring accuracy ------------------------------------------------------
rr_cv_rf$aggregate(msr("regr.rmse"))
rr_cv_rf$aggregate(msr("regr.rsq")) 

acc_df = data.frame(method = c("rmse", "rsq"), 
                    result = c(rr_cv_rf$aggregate(msr("regr.rmse")) , rr_cv_rf$aggregate(msr("regr.rsq"))))

write.csv(acc_df, paste0("D:\\BioGeo\\ribeiroe\\regenera\\results_v3\\", alvo, "_acc.csv"))

# Train model -------------------------------------------------------------
set_threads(learner, n = 5)
model = learner$train(mlr3_tsk)
model$importance()
model$importance()/sum(model$importance())
write.csv(as.data.frame(model$importance()), paste0("D:\\BioGeo\\ribeiroe\\regenera\\results_v3\\", alvo, ".csv"))

# Run model (predict) -----------------------------------------------------
quatorze_classes = quatorze_classes[quatorze_classes != alvo]
input_raster = input_raster[[c(quatorze_classes)]]
tmp = input_raster[[2]]
tmp[tmp == 0] = 1
base_raster = tmp / tmp
r_df = terra::as.data.frame(input_raster, na.rm = F)
r_df[is.na(r_df)] = 0

num_models = 10
predicted_list = vector("list", length = num_models)
for (i in 1:num_models) {
  cat(i, "\r")
  model = learner$train(mlr3_tsk)
  predicted_list_raw = model$predict_newdata(r_df) # run predict
  predicted_raster = input_raster[[2]] * 0 # create base raster
  predicted_raster[] = predicted_list_raw$response # set result values
  predicted_raster = predicted_raster * base_raster
  predicted_list[[i]] = predicted_raster
}

# Uncertainties
predicted_stack = rast(predicted_list)
predicted_uncertainties = app(predicted_stack, sd) # calculo de incertezas espacial

# Salva os resultados
terra::writeRaster(predicted_raster, paste0("D:\\BioGeo\\ribeiroe\\regenera\\results/v3/", alvo, ".tif"), gdal = "COMPRESS=DEFLATE", overwrite = TRUE)
terra::writeRaster(predicted_uncertainties, paste0("D:\\BioGeo\\ribeiroe\\regenera\\results/v3/", alvo, "_uncertainties.tif"), gdal = "COMPRESS=DEFLATE", overwrite = TRUE)
save(model, file = paste0("D:\\BioGeo\\ribeiroe\\regenera\\results/v3/", alvo, "_model"))
