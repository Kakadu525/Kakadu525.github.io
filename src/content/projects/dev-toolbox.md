---
title: dev-toolbox
order: 2
label: repo
conf: 0.96
summary: 19 утилит разработчика в одном .exe. Работает без интернета.
tag: c++20
stack: [c++20, winapi, webview2, cmake]
year: 2026
repo: https://github.com/Kakadu525/dev-toolbox
links:
  - label: скачать .exe
    href: https://github.com/Kakadu525/dev-toolbox/releases/latest/download/DevToolbox.exe
preview: toolbox
animation:
  src: /projects/dev-toolbox/demo.gif
  alt: Dev Toolbox в работе, переключение между инструментами.
  width: 1569
  height: 963
features:
  - Один portable .exe, интерфейс встроен в файл. Установка и права администратора не нужны.
  - Тёмная и светлая тема, интерфейс на русском и английском.
  - В сеть ходит только HTTP-клиент, и только туда, куда укажешь сам.
---

Токен, кусок конфига или лог с продакшена не стоит вставлять в незнакомый онлайн-сервис. Dev Toolbox делает то же самое локально, и данные остаются на машине.

## Что внутри

- Кодирование и хэши: Base64, MD5 и SHA256, разбор JWT.
- Генераторы: UUID v4 и QR-коды с экспортом в PNG.
- Форматтеры: JSON, XML, YAML и SQL.
- Текст: тестер регулярных выражений с подсветкой групп и построчный diff.
- Сеть: HTTP-клиент и сборщик команд curl.
- Цвета и картинки: конвертер HEX, RGB и HSL и конвертер изображений.
- Система: просмотр логов в режиме live-tail, список процессов и история буфера обмена.
- Разбор cron-выражений с ближайшими моментами запуска.
