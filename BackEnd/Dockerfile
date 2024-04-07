FROM python:3.11

COPY . . 

RUN pip install -r BackEnd/requirements.txt

EXPOSE 5000



CMD ["waitress-serve", "--host=0.0.0.0", "--port=5000", "app:app"]
