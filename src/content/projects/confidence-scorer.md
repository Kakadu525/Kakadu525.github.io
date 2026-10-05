---
title: confidence-scorer
order: 1
featured: true
label: repo
conf: 0.98
summary: Оценивает PR от нейросети по шкале от 0 до 100. Старую и новую версию каждой изменённой функции запускает на одних и тех же входах, и если поведение разошлось, мерж блокируется.
tag: python
badge: ★ marketplace
stack: [python, hypothesis, fast-check, ollama, github actions]
year: 2026
repo: https://github.com/Kakadu525/confidence-scorer
links:
  - label: marketplace
    href: https://github.com/marketplace/actions/confidence-scorer
  - label: статья на Хабре
    href: https://habr.com/ru/articles/1088564/
preview: scorer
screenshot:
  src: ../../assets/projects/confidence-scorer.png
  alt: Отчёт confidence-score на демо-примере. Найден контрпример, score 35 из 100.
features:
  - Подтверждённый контрпример ограничивает score, что бы ни сказали AI-ревьюеры.
  - Чем меньше проверок отработало, тем ниже потолок. Прогон без AI-ключей не покажет 100 из 100.
  - Работает с Anthropic, OpenAI, DeepSeek, Qwen, бесплатными моделями OpenRouter или полностью локальной Ollama.
---

AI пишет всё больше PR. Такой дифф проходит линтер и юнит-тесты, но тесты обычно писала та же модель, что и код. Они подтверждают, что модель сделала задуманное, и ничего не говорят о том, ведёт ли себя код как раньше.

## Как это работает

1. Differential-тесты. Старая и новая версия каждой изменённой функции запускаются на одних и тех же входах, случайных и намеренно граничных. Для Python входы генерирует Hypothesis, для JS и TS их генерирует fast-check.
2. Semantic diff. Модель описывает, как изменилось поведение каждой функции.
3. Второй ревьюер. Дифф независимо проверяет другая модель или взвешенная панель из нескольких моделей.

## Пример

В демо «AI-упрощение» убирает проверку `percent < 0`. Differential-тест находит вход `percent = -0.5`: старая версия бросала `ValueError`, новая возвращает `0.0`. Score 35 из 100, мерж заблокирован.
