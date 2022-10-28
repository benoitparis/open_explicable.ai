FROM python:3.10-slim-bullseye

ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip install --upgrade pip

COPY requirements-cleaning.txt ./
RUN pip install -r requirements-cleaning.txt

COPY *.csv *.json *.py ./
CMD python Cleaning.test.py

