FROM python:3
#RUN useradd --create-home --shell /bin/bash ml-user
#USER ml-env
RUN python3 -m venv ml-env
RUN . ml-env/bin/activate
COPY requirements-base.txt ./
RUN pip install -r requirements-base.txt
COPY rulefitcustom ./rulefitcustom
RUN pip install -e ./rulefitcustom/
RUN apt update
RUN apt-get install net-tools
COPY requirements-explicable.txt ./
RUN pip install -r requirements-explicable.txt
COPY process_data.ipynb ./
COPY AmesHousing.csv ./
#EXPOSE 127.0.0.1:8888:8888
#CMD jupyter notebook --allow-root
RUN jupyter nbconvert --to notebook --execute process_data.ipynb
