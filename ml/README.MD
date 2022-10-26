    docker build -t run-explicable .
    docker run -v ${PWD}/../public/data:/out run-explicable
