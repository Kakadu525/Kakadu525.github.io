---
title: wallet-api
order: 3
label: repo
conf: 0.95
summary: Асинхронный REST API для кошельков на FastAPI и PostgreSQL. Повторный запрос с тем же ключом не спишет деньги дважды.
tag: fastapi
stack: [python, fastapi, sqlalchemy, postgresql, alembic, prometheus, docker, pytest]
year: 2026
repo: https://github.com/Kakadu525/wallet-api
preview: wallet
screenshot:
  src: ../../assets/projects/wallet-api.png
  alt: Панель тестирования Wallet API. Кошелёк, операции, проверка конкурентности и журнал операций.
features:
  - Баланс и журнал пишутся в одной транзакции, поэтому история не может разъехаться с балансом.
  - Токен показывается один раз, в базе лежит только его SHA-256.
  - Тесты гоняются против настоящего PostgreSQL, без SQLite и моков.
---

## Как это работает

1. Конкурентность. Баланс меняется одним атомарным `UPDATE` с условием `balance >= :amount`. Параллельный запрос ждёт блокировку строки, и списание не уходит в минус. Тест отправляет больше 20 параллельных запросов к одному кошельку, и итог сходится до копейки.
2. Идемпотентность. Заголовок `Idempotency-Key` и ограничение `UNIQUE(wallet_id, idempotency_key)`. Повтор возвращает результат первой операции и не трогает баланс, а тот же ключ с другой суммой получает `409`.
3. Защита и метрики. Rate limiting по скользящему окну отвечает `429` с `Retry-After`. На `/metrics` лежат метрики Prometheus, пути размечены по шаблону маршрута.
