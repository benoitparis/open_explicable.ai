jupyter nbconvert --to notebook --execute process_data.ipynb
cp ./*.csv /out/
cp ./*.parquet /out/
cp ./*.json /out/