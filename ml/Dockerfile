FROM python:3.10-slim-bullseye

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip install --upgrade pip

COPY cleaning/requirements-cleaning.txt ./
RUN pip install -r requirements-cleaning.txt

COPY requirements-base.txt ./
RUN pip install -r requirements-base.txt

COPY rulefitcustom ./rulefitcustom
RUN pip install -e ./rulefitcustom/

# hdbscan 0.8.28 c'est de la merde, ça veut pas upgrader une lib avec une CVE rapidement et ça a pas de wheel donc faut gcc
RUN pip install --upgrade joblib==1.1.0
RUN apt update && apt upgrade
RUN apt-get install -y gcc
COPY requirements-explicable.txt ./
RUN pip install -r requirements-explicable.txt

COPY cleaning/Cleaning.py process_data.ipynb AmesHousing.csv run.sh ./
#RUN apt update
#RUN apt-get install net-tools
#EXPOSE 127.0.0.1:8888:8888
#CMD jupyter notebook --allow-root
CMD ./run.sh