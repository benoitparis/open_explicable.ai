FROM python:3.11.0-bullseye
RUN python -m venv ml-env
RUN . ml-env/bin/activate
RUN pip install --upgrade pip
COPY requirements-cleaning.txt ./
RUN pip install -r requirements-cleaning.txt
COPY *.csv ./
COPY Cleaning.py Cleaning.test.py run.sh ./
CMD ./run.sh