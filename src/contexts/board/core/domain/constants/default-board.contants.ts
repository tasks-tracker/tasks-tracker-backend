export const defaultColumnsWithTasks = [
  {
    title: 'To Do',
    order: 0,
    tasks: [
      {
        title: 'Изучить документацию',
        description: 'Прочитать руководство пользователя',
      },
      {
        title: 'Настроить профиль',
        description: 'Заполнить информацию о себе',
      },
    ],
  },
  {
    title: 'In Progress',
    order: 1,
    tasks: [
      {
        title: 'Создать первую задачу',
        description: 'Добавить задачу в колонку To Do',
      },
    ],
  },
  {
    title: 'Review',
    order: 2,
    tasks: [
      {
        title: 'Проверить настройки',
        description: 'Убедиться что все работает корректно',
      },
    ],
  },
  {
    title: 'Done',
    order: 3,
    tasks: [
      {
        title: 'Регистрация завершена',
        description: 'Добро пожаловать в систему!',
      },
    ],
  },
];
export const BOARD_ALREADY_EXISTS = 'BOARD_ALREADY_EXISTS';
export const DEFAULT_BOARD = 'Board';
