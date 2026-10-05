export const site = {
  name: 'Дмитрий',
  status: 'в поиске интересных предложений',
  typewriter: [
    'пишу десктоп на C++ и WinAPI',
    'собираю бэкенды на FastAPI',
    'ловлю баги в PR от нейросетей',
    'делаю инструменты для разработчиков',
  ],
  bio: 'Учусь на направлении «Информационные системы и технологии». На Хабре пишу о том, как проверять код от нейросетей и кто отвечает за ИИ-агентов. Готов подключиться к интересному open source проекту.',
  stack: ['c++20', 'winapi', 'webview2', 'python', 'fastapi', 'postgresql', 'docker', 'gh actions'],
  now: [
    'в поиске интересных предложений',
    'учу Docker, SQL и system design',
    'разбираюсь в компьютерном зрении',
  ],
  contacts: [
    { key: 'tg', label: '@medvedevds00', href: 'https://t.me/medvedevds00' },
    { key: 'mail', label: 'medvedka.dima@yandex.ru', href: 'mailto:medvedka.dima@yandex.ru' },
    { key: 'habr', label: '@MedSurg', href: 'https://habr.com/ru/users/MedSurg/' },
    { key: 'github', label: 'Kakadu525', href: 'https://github.com/Kakadu525' },
  ],
  telegram: 'https://t.me/medvedevds00',
  habrArticles: 'https://habr.com/ru/users/MedSurg/publications/articles/',
  stats: { toolboxUtilities: 19, marketplaceActions: 1 },
  meta: {
    title: 'Дмитрий · C++ и Python разработчик',
    description:
      'Проекты, статьи на Хабре и контакты. Десктоп на C++ и WinAPI, бэкенды на FastAPI, инструменты для проверки кода от нейросетей.',
  },
} as const;
