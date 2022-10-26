FROM python:3.11.0-bullseye
RUN python -m venv ml-env
RUN . ml-env/bin/activate
RUN pip install --upgrade pip
COPY requirements-base.txt ./
RUN pip install -r requirements-base.txt
COPY rulefitcustom ./rulefitcustom
RUN pip install -e ./rulefitcustom/
COPY requirements-explicable.txt ./
RUN pip install -r requirements-explicable.txt
COPY process_data.ipynb AmesHousing.csv run.sh ./
#RUN apt update
#RUN apt-get install net-tools
#EXPOSE 127.0.0.1:8888:8888
#CMD jupyter notebook --allow-root
CMD ./run.sh