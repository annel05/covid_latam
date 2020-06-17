# Verificacion de datos

1. No hay ninguna lineas vacias en el archivo csv.
2. Asegurar que todas las columnas tengan los nombre correcto. Para la data de america latina en vez de `state_short` estoy usando `country_short`. Seria buena idea mirar bien rectificar las columnas de la data corriente antes de hacer una actualizacion.
3. Los dias estan formateado como: YYYY-MM-DD
4. Para la data del promedio del pais, los variables `state_short` y `state_name` deberian ser `Nacional`.
5. Para la data del promedio del pais, los variables relacionados a rankings deberian estar vacios.
6. Para data de México, el valor de `state_short` para Quintana Roo deberia ser `QRoo` y no `Q.Roo`.
7. Data sobre Brasil deberia tener `Brasil` como valor de `country`.
8. El archivo csv se deberia llamar `data_latest.csv` y estar en la carpeta de `data` del repositorio.