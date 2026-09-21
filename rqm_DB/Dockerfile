FROM postgres:16-alpine

# Копируем цитаты в папку автоинициализации базы данных
COPY data.sql /docker-entrypoint-initdb.d/init.sql

