# use this Dockerfile to load data from local sql file

FROM arm64v8/mysql:oracle

# Copy content from .sql to Docker mysql container
COPY ./backup.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 3306
