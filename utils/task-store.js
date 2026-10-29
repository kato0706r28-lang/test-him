import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

export const PRIORITY_MAP = {
  high: { label: '高', emoji: '🔴' },
  medium: { label: '中', emoji: '🟡' },
  low: { label: '低', emoji: '🟢' },
};

const userStateMap = new Map();

export const getUserState = (userId) => {
  if (!userStateMap.has(userId)) {
    userStateMap.set(userId, { activeTab: 'tasks', activeFilter: 'all' });
  }
  return userStateMap.get(userId);
};

export const setUserState = (userId, partialState) => {
  const current = getUserState(userId);
  userStateMap.set(userId, { ...current, ...partialState });
};

const createDefaultTasks = (userId) => [
  {
    id: 'task_2',
    title: 'task2',
    creatorId: userId,
    assigneeId: userId,
    priority: 'medium',
    dueDate: '2026-10-30',
    description: 'aa',
    status: 'pending',
    createdAt: '2026-10-29',
  },
  {
    id: 'task_1',
    title: 'task1',
    creatorId: userId,
    assigneeId: userId,
    priority: 'medium',
    dueDate: '2026-10-29',
    description: 't',
    status: 'pending',
    createdAt: '2026-10-29',
  },
];

export const loadTasks = (currentUserId = 'U_USER') => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const defaults = createDefaultTasks(currentUserId);
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaults, null, 2), 'utf8');
      return defaults;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const tasks = JSON.parse(raw || '[]');
    return tasks.map((task) => {
      if (task.creatorId === 'U_CURRENT_USER') task.creatorId = currentUserId;
      if (task.assigneeId === 'U_CURRENT_USER') task.assigneeId = currentUserId;
      return task;
    });
  } catch {
    return createDefaultTasks(currentUserId);
  }
};

export const saveTasks = (tasks) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (error) {
    console.error(error);
  }
};

export const addTask = ({ title, creatorId, assigneeId, priority = 'medium', dueDate, description = '' }) => {
  const tasks = loadTasks(creatorId);
  const newTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    creatorId,
    assigneeId: assigneeId || creatorId,
    priority,
    dueDate: dueDate || new Date().toISOString().slice(0, 10),
    description,
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  return newTask;
};

export const toggleTaskStatus = (taskId, currentUserId) => {
  const tasks = loadTasks(currentUserId);
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    saveTasks(tasks);
  }
  return tasks;
};

const buildCounterBlocks = (tasks, userId) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = total - completed;
  const myTasks = tasks.filter((t) => t.assigneeId === userId || t.creatorId === userId);
  const myPending = myTasks.filter((t) => t.status !== 'completed').length;

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📊 タスク集計カウンター*',
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*📋 総タスク数:*\n${total} 件`,
        },
        {
          type: 'mrkdwn',
          text: `*⏳ 未完了タスク:*\n${pending} 件`,
        },
        {
          type: 'mrkdwn',
          text: `*✅ 完了済みタスク:*\n${completed} 件`,
        },
        {
          type: 'mrkdwn',
          text: `*👤 あなたの未完了タスク:*\n${myPending} 件`,
        },
      ],
    },
  ];
};

export const buildHomeView = ({ userId }) => {
  const state = getUserState(userId);
  const allTasks = loadTasks(userId);

  const navBlocks = [
    {
      type: 'actions',
      block_id: 'tab_navigation_block',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '📋 タスク一覧', emoji: true },
          style: state.activeTab === 'tasks' ? 'primary' : undefined,
          action_id: 'nav_tab_tasks',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '📊 カウンター', emoji: true },
          style: state.activeTab === 'counter' ? 'primary' : undefined,
          action_id: 'nav_tab_counter',
        },
      ],
    },
    { type: 'divider' },
  ];

  if (state.activeTab === 'counter') {
    return {
      type: 'home',
      blocks: [...navBlocks, ...buildCounterBlocks(allTasks, userId)],
    };
  }

  const filteredTasks =
    state.activeFilter === 'my' ? allTasks.filter((t) => t.assigneeId === userId || t.creatorId === userId) : allTasks;

  const headerBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `🌐 全体共有タスク (${filteredTasks.length}件)`,
    },
    accessory: {
      type: 'button',
      text: { type: 'plain_text', text: '➕ タスクを新規登録', emoji: true },
      style: 'primary',
      action_id: 'open_add_task_modal',
    },
  };

  const filterBlocks = [
    headerBlock,
    {
      type: 'actions',
      block_id: 'filter_navigation_block',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '🌐 全体タスク', emoji: true },
          style: state.activeFilter === 'all' ? 'primary' : undefined,
          action_id: 'filter_all_tasks',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '👤 自分のタスク', emoji: true },
          style: state.activeFilter === 'my' ? 'primary' : undefined,
          action_id: 'filter_my_tasks',
        },
      ],
    },
    { type: 'divider' },
  ];

  const taskBlocks = [];

  if (filteredTasks.length === 0) {
    taskBlocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'タスクはありません。',
      },
    });
  } else {
    for (const task of filteredTasks) {
      const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
      const isDone = task.status === 'completed';
      const titleLine = isDone ? `~*${task.title}*~` : `*${task.title}*`;
      const descLine = task.description ? `\n> ${task.description}` : '';

      taskBlocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${titleLine}\n作成: <@${task.creatorId}> | 担当: <@${task.assigneeId}>\n優先度: ${priorityInfo.emoji} ${priorityInfo.label} | 期限: 📅 ${task.dueDate}${descLine}`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: isDone ? '↩️ 未完了に戻す' : '✅ 完了にする',
            emoji: true,
          },
          style: isDone ? undefined : 'primary',
          action_id: 'toggle_task_status',
          value: task.id,
        },
      });
      taskBlocks.push({ type: 'divider' });
    }
  }

  return {
    type: 'home',
    blocks: [...navBlocks, ...filterBlocks, ...taskBlocks],
  };
};

export const buildTaskModalView = ({ userId }) => ({
  type: 'modal',
  callback_id: 'submit_add_task_modal',
  title: {
    type: 'plain_text',
    text: 'タスクを新規登録',
    emoji: true,
  },
  submit: {
    type: 'plain_text',
    text: '登録する',
    emoji: true,
  },
  close: {
    type: 'plain_text',
    text: 'キャンセル',
    emoji: true,
  },
  blocks: [
    {
      type: 'input',
      block_id: 'title_block',
      element: {
        type: 'plain_text_input',
        action_id: 'title_input',
        placeholder: {
          type: 'plain_text',
          text: 'タスク名を入力',
        },
      },
      label: {
        type: 'plain_text',
        text: 'タスク名',
        emoji: true,
      },
    },
    {
      type: 'input',
      block_id: 'assignee_block',
      element: {
        type: 'users_select',
        action_id: 'assignee_input',
        initial_user: userId,
        placeholder: {
          type: 'plain_text',
          text: '担当者を選択',
        },
      },
      label: {
        type: 'plain_text',
        text: '担当者',
        emoji: true,
      },
    },
    {
      type: 'input',
      block_id: 'priority_block',
      element: {
        type: 'static_select',
        action_id: 'priority_input',
        initial_option: {
          text: { type: 'plain_text', text: '🟡 中', emoji: true },
          value: 'medium',
        },
        options: [
          {
            text: { type: 'plain_text', text: '🔴 高', emoji: true },
            value: 'high',
          },
          {
            text: { type: 'plain_text', text: '🟡 中', emoji: true },
            value: 'medium',
          },
          {
            text: { type: 'plain_text', text: '🟢 低', emoji: true },
            value: 'low',
          },
        ],
      },
      label: {
        type: 'plain_text',
        text: '優先度',
        emoji: true,
      },
    },
    {
      type: 'input',
      block_id: 'due_block',
      element: {
        type: 'datepicker',
        action_id: 'due_input',
        placeholder: {
          type: 'plain_text',
          text: '期限日を選択',
        },
      },
      label: {
        type: 'plain_text',
        text: '期限日',
        emoji: true,
      },
    },
    {
      type: 'input',
      block_id: 'desc_block',
      optional: true,
      element: {
        type: 'plain_text_input',
        action_id: 'desc_input',
        multiline: true,
        placeholder: {
          type: 'plain_text',
          text: '詳細やメモがあれば入力',
        },
      },
      label: {
        type: 'plain_text',
        text: '詳細・メモ',
        emoji: true,
      },
    },
  ],
});
