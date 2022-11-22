#jupyter nbconvert --to notebook --execute process_data.ipynb
python process_data.py
cp ./*.csv /out/
cp ./*.parquet /out/
cp ./*.json /out/
cp ./*.xlsx /out/