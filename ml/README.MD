    docker build -t run-explicable .
    docker run -v ${PWD}/../static/data:/out run-explicable
