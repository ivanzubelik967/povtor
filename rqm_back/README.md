# Random Quote Machine (Backend)

Это backend-часть приложения для выдачи случайных фраз. Проект написан на Java с использованием фреймворка Spring Boot.

## Требования
- Java 21
- PostgreSQL (или Docker для запуска базы данных)
- Maven (опционально, так как в проекте есть `mvnw`)

## Профили конфигурации

Приложение поддерживает три профиля для разных окружений:

| Профиль | Назначение | ddl-auto | Логирование | База данных |
|---------|-----------|---------|-----------|-----------|
| **dev** | 📝 Локальная разработка (по умолчанию) | `update` | DEBUG | localhost:5432/...\_dev |
| **test** | ✅ Тестирование | `create-drop` | WARN | localhost:5432/...\_test |
| **prod** | 🚀 Production | `validate` | WARN | Из переменных окружения |

### Файлы конфигурации
- `application.yml` — общие настройки (активирует `dev` по умолчанию)
- `application-dev.yml` — конфиг для разработки
- `application-test.yml` — конфиг для тестирования  
- `application-prod.yml` — конфиг для production

## Настройка базы данных

### Для разработки (профиль DEV)
По умолчанию БД подключается к `localhost:5432/random_quote_machine_dev`:
```bash
docker run --name rqm-postgres-dev -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=random_quote_machine_dev -p 5432:5432 -d postgres
```

### Для тестирования (профиль TEST)
```bash
docker run --name rqm-postgres-test -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=random_quote_machine_test -p 5432:5432 -d postgres
```

## Сборка проекта
Для сборки проекта используйте Maven Wrapper:
```bash
# На Linux/macOS
./mvnw clean package

# На Windows
mvnw.cmd clean package
```

## Запуск приложения

### Вариант А: Запуск напрямую в системе (без контейнеров)

#### 1️⃣ Установка PostgreSQL локально

**На Windows:**
- Скачайте installer с https://www.postgresql.org/download/windows/
- При установке запомните пароль для пользователя `postgres`
- PostgreSQL запустится автоматически на порту 5432

**На macOS (с Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**На Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 2️⃣ Создание баз данных для разных окружений

Подключитесь к PostgreSQL:
```bash
# На Windows/Linux/macOS
psql -U postgres
```

Выполните SQL-команды:
```sql
-- Создание БД для разработки
CREATE DATABASE random_quote_machine_dev;

-- Создание БД для тестирования
CREATE DATABASE random_quote_machine_test;

-- Создание БД для production
CREATE DATABASE random_quote_machine;

-- Проверка
\l
```

Выход: `\q`

#### 3️⃣ Запуск приложения локально

**Способ 1: Прямой запуск через Maven (рекомендуется для разработки)**

```bash
# На Linux/macOS - профиль DEV (по умолчанию)
./mvnw spring-boot:run

# На Windows - профиль DEV (по умолчанию)
mvnw.cmd spring-boot:run

# Профиль TEST
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=test"

# Профиль PROD с переменными окружения
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=random_quote_machine
export DB_USER=postgres
export DB_PASSWORD=postgres
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=prod"
```

**Способ 2: Запуск собранного JAR**

```bash
# Сборка
./mvnw clean package

# Запуск с DEV профилем
java -jar target/rqm_back-0.0.1-SNAPSHOT.jar

# Запуск с TEST профилем
java -jar target/rqm_back-0.0.1-SNAPSHOT.jar --spring.profiles.active=test

# Запуск с PROD профилем и переменными окружения (Windows PowerShell)
$env:SPRING_PROFILES_ACTIVE = "prod"
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "random_quote_machine"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "postgres"
java -jar target/rqm_back-0.0.1-SNAPSHOT.jar

# На Linux/macOS
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=random_quote_machine
export DB_USER=postgres
export DB_PASSWORD=postgres
java -jar target/rqm_back-0.0.1-SNAPSHOT.jar
```

#### 4️⃣ Проверка работы

Приложение запустится на `http://localhost:8080` (или указанном порту).

Проверьте здоровье приложения:
```bash
# На любой ОС
curl http://localhost:8080/

# Или откройте в браузере
http://localhost:8080/
```

#### 5️⃣ Логирование и отладка

Если нужно видеть SQL-запросы (профиль DEV/TEST):
```bash
# Логи выводятся в консоль автоматически
# DEV - показывает SQL и параметры
# TEST - минимальное логирование
```

Для PROD профиля логирование минимально, но можно увеличить:
```bash
java -jar target/rqm_back-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --logging.level.com.randomquote=DEBUG
```

### Вариант Б: Запуск в Docker контейнерах

#### Сборка образа:
```bash
docker build -t rqm-backend:latest .
```

#### Запуск контейнера с профилем PROD:
```bash
docker run -d \
  --name rqm-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=postgres-container \
  -e DB_PORT=5432 \
  -e DB_NAME=random_quote_machine \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  rqm-backend:latest
```

#### Docker Compose (рекомендуется для локального запуска с БД):
Создайте файл `docker-compose.yml` в корне проекта:
```yaml
version: '3.9'

services:
  database:
    image: postgres:15-alpine
    container_name: rqm-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: random_quote_machine
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: .
    container_name: rqm-backend
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: random_quote_machine
      DB_USER: postgres
      DB_PASSWORD: postgres
    depends_on:
      database:
        condition: service_healthy

volumes:
  postgres_data:
```

Запуск:
```bash
docker-compose up -d
```

Приложение будет доступно на `http://localhost:8080`

## Остановка контейнеров
```bash
# Остановить одиночный контейнер
docker stop rqm-backend

# Остановить Docker Compose
docker-compose down
```

## Решение частых проблем

### При запуске появляется ошибка "Connection refused" к БД

**Локальный запуск:**
```bash
# 1. Проверьте, запущен ли PostgreSQL
# На Windows
Get-Service postgresql-x64-15  # должен быть "Running"

# На macOS
brew services list | grep postgresql

# На Linux
systemctl status postgresql

# 2. Если БД не запущена, запустите её
# Windows - обычно запускается автоматически
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# 3. Проверьте, создана ли база данных
psql -U postgres -l | grep random_quote_machine

# 4. Если БД не существует, создайте её
psql -U postgres -c "CREATE DATABASE random_quote_machine_dev;"
```

**Docker:**
```bash
# Проверьте логи контейнера
docker logs rqm-backend

# Проверьте, запущен ли контейнер с БД
docker ps | grep postgres
```

### Приложение запустилось, но на localhost:8080 ничего нет

Возможно используется другой порт (TEST профиль использует 8081):
```bash
# Проверьте логи
java -jar target/rqm_back-0.0.1-SNAPSHOT.jar 2>&1 | grep "port"

# Или в Docker
docker logs rqm-backend | grep port
```

### Нужно изменить профиль без перезапуска

Просто используйте аргумент при запуске JAR:
```bash
java -jar target/rqm_back-0.0.1-SNAPSHOT.jar --spring.profiles.active=test
```

Приложение будет доступно по порту **8080**.
