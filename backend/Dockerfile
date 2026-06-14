FROM python:3.12-slim
WORKDIR /backend
COPY ./requirements.txt /backend/requirements.txt
RUN pip install --no-cache-dir --upgrade -r ./requirements.txt
COPY ./app /backend/app
CMD ["fastapi", "run", "app/main.py", "--port", "9090"]

