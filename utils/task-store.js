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
    userStateMap.set(userId, {
      activeTab: 'tasks',
      activeFilter: 'all',
      selectedChannel: null,
    });
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
    channelId: null,
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
    channelId: null,
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

export const addTask = ({
  title,
  creatorId,
  assigneeId,
  channelId = null,
  priority = 'medium',
  dueDate,
  description = '',
}) => {
  const tasks = loadTasks(creatorId);
  const newTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    creatorId,
    assigneeId: assigneeId || creatorId,
    channelId: channelId || null,
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
  const myTasks = tasks.filter(
    (t) => t.assigneeId === userId || t.creatorId === userId,
  );
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

export const buildSingleTaskBlock = (task) => {
  const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const isDone = task.status === 'completed';
  const titleLine = isDone ? `~*${task.title}*~` : `*${task.title}*`;
  const descLine = task.description ? `\n> ${task.description}` : '';
  const channelLine = task.channelId ? ` | 📢 <#${task.channelId}>` : '';

  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${titleLine}\n作成: <@${task.creatorId}> | 担当: <@${task.assigneeId}>\n優先度: ${priorityInfo.emoji} ${priorityInfo.label} | 期限: 📅 ${task.dueDate}${channelLine}${descLine}`,
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
  };
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

  let filteredTasks = allTasks;
  if (state.selectedChannel) {
    filteredTasks = filteredTasks.filter(
      (t) => t.channelId === state.selectedChannel,
    );
  }
  if (state.activeFilter === 'my') {
    filteredTasks = filteredTasks.filter(
      (t) => t.assigneeId === userId || t.creatorId === userId,
    );
  }

  const channelTitle = state.selectedChannel
    ? `📢 <#${state.selectedChannel}> のタスク`
    : '🌐 全体共有タスク';

  const headerBlock = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${channelTitle} (${filteredTasks.length}件)`,
    },
    accessory: {
      type: 'button',
      text: { type: 'plain_text', text: '➕ タスクを新規登録', emoji: true },
      style: 'primary',
      action_id: 'open_add_task_modal',
    },
  };

  const channelFilterElements = [
    {
      type: 'conversations_select',
      action_id: 'filter_by_channel',
      placeholder: {
        type: 'plain_text',
        text: '📢 チャンネルで絞り込み...',
        emoji: true,
      },
      filter: {
        include: ['public', 'private'],
        exclude_bot_users: true,
      },
      ...(state.selectedChannel?.startsWith('C')
        ? { initial_conversation: state.selectedChannel }
        : {}),
    },
  ];

  if (state.selectedChannel) {
    channelFilterElements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: '❌ 全チャンネル表示に戻す',
        emoji: true,
      },
      action_id: 'filter_clear_channel',
    });
  }

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
    {
      type: 'actions',
      block_id: 'channel_filter_block',
      elements: channelFilterElements,
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
  } else if (state.selectedChannel) {
    for (const task of filteredTasks) {
      taskBlocks.push(buildSingleTaskBlock(task));
      taskBlocks.push({ type: 'divider' });
    }
  } else {
    const channelMap = new Map();
    for (const task of filteredTasks) {
      const key = task.channelId || 'none';
      if (!channelMap.has(key)) {
        channelMap.set(key, []);
      }
      channelMap.get(key).push(task);
    }

    for (const [chId, tasks] of channelMap.entries()) {
      const title =
        chId === 'none' ? '📌 チャンネル未指定' : `📢 <#${chId}>`;
      taskBlocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${title} (${tasks.length}件)*`,
        },
      });

      for (const task of tasks) {
        taskBlocks.push(buildSingleTaskBlock(task));
      }
      taskBlocks.push({ type: 'divider' });
    }
  }

  return {
    type: 'home',
    blocks: [...navBlocks, ...filterBlocks, ...taskBlocks],
  };
};

export const buildTaskModalView = ({ userId, defaultChannelId = null }) => {
  const channelElement = {
    type: 'conversations_select',
    action_id: 'channel_input',
    placeholder: {
      type: 'plain_text',
      text: '追加先チャンネルを選択...',
      emoji: true,
    },
    filter: {
      include: ['public', 'private'],
      exclude_bot_users: true,
    },
  };

  if (typeof defaultChannelId === 'string' && defaultChannelId.startsWith('C')) {
    channelElement.initial_conversation = defaultChannelId;
  }

  return {
    type: 'modal',
    callback_id: 'submit_add_task_modal',
    private_metadata: defaultChannelId || '',
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
        block_id: 'channel_block',
        optional: true,
        element: channelElement,
        label: {
          type: 'plain_text',
          text: '追加先チャンネル (任意)',
          emoji: true,
        },
      },
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
  };
};

export const buildChannelTaskListBlocks = (tasks, channelId) => {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📋 <#${channelId}> のタスク一覧 (${tasks.length}件)`,
        emoji: true,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '➕ タスクを追加', emoji: true },
          style: 'primary',
          action_id: 'open_add_task_modal_from_channel',
          value: channelId,
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📋 モーダルで一覧を開く',
            emoji: true,
          },
          action_id: 'open_channel_tasks_modal',
          value: channelId,
        },
      ],
    },
    { type: 'divider' },
  ];

  if (tasks.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `🎉 *<#${channelId}> に登録されているタスクはありません！*`,
      },
    });
    return blocks;
  }

  for (const task of tasks) {
    blocks.push(buildSingleTaskBlock(task));
    blocks.push({ type: 'divider' });
  }

  return blocks;
};

export const buildTaskCreatedNotificationBlocks = (task) => {
  const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const isDone = task.status === 'completed';
  const titleText = isDone ? `~*${task.title}*~` : `*${task.title}*`;
  const descLine = task.description ? `\n> ${task.description}` : '';

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📢 *新しいタスクが追加されました！*\n${titleText}\n作成: <@${task.creatorId}> | 担当: <@${task.assigneeId}>\n優先度: ${priorityInfo.emoji} ${priorityInfo.label} | 期限: 📅 ${task.dueDate}${descLine}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
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
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📋 タスク一覧を開く',
            emoji: true,
          },
          action_id: 'open_channel_tasks_modal',
          value: task.channelId || 'all',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '➕ タスクを追加',
            emoji: true,
          },
          action_id: 'open_add_task_modal_from_channel',
          value: task.channelId || '',
        },
      ],
    },
  ];
};

export const buildChannelTasksModalView = ({ channelId, userId }) => {
  const allTasks = loadTasks(userId);
  const channelTasks = channelId && channelId !== 'all' ? allTasks.filter((t) => t.channelId === channelId) : allTasks;

  const headerTitle =
    channelId && channelId !== 'all'
      ? `📢 <#${channelId}> のタスク一覧 (${channelTasks.length}件)`
      : `🌐 全体タスク一覧 (${channelTasks.length}件)`;

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: headerTitle,
      },
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: '➕ タスクを追加', emoji: true },
        style: 'primary',
        action_id: 'open_add_task_modal_from_channel',
        value: channelId || '',
      },
    },
    { type: 'divider' },
  ];

  if (channelTasks.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '現在登録されているタスクはありません。',
      },
    });
  } else {
    for (const task of channelTasks) {
      blocks.push(buildSingleTaskBlock(task));
      blocks.push({ type: 'divider' });
    }
  }

  return {
    type: 'modal',
    private_metadata: channelId || '',
    title: {
      type: 'plain_text',
      text: 'タスク一覧',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: '閉じる',
      emoji: true,
    },
    blocks,
  };
};

export const buildTaskCreatedNotificationBlocks = (task) => {
  const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;
  const isDone = task.status === 'completed';
  const titleText = isDone ? `~*${task.title}*~` : `*${task.title}*`;
  const descLine = task.description ? `\n> ${task.description}` : '';

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📢 *新しいタスクが追加されました！*\n${titleText}\n作成: <@${task.creatorId}> | 担当: <@${task.assigneeId}>\n優先度: ${priorityInfo.emoji} ${priorityInfo.label} | 期限: 📅 ${task.dueDate}${descLine}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
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
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📋 タスク一覧を開く',
            emoji: true,
          },
          action_id: 'open_channel_tasks_modal',
          value: task.channelId || 'all',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '➕ タスクを追加',
            emoji: true,
          },
          action_id: 'open_add_task_modal_from_channel',
          value: task.channelId || '',
        },
      ],
    },
  ];
};

export const buildChannelTasksModalView = ({ channelId, userId }) => {
  const allTasks = loadTasks(userId);
  const channelTasks =
    channelId && channelId !== 'all'
      ? allTasks.filter((t) => t.channelId === channelId)
      : allTasks;

  const headerTitle =
    channelId && channelId !== 'all'
      ? `📢 <#${channelId}> のタスク一覧 (${channelTasks.length}件)`
      : `🌐 全体タスク一覧 (${channelTasks.length}件)`;

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: headerTitle,
      },
      accessory: {
        type: 'button',
        text: { type: 'plain_text', text: '➕ タスクを追加', emoji: true },
        style: 'primary',
        action_id: 'open_add_task_modal_from_channel',
        value: channelId || '',
      },
    },
    { type: 'divider' },
  ];

  if (channelTasks.length === 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '現在登録されているタスクはありません。',
      },
    });
  } else {
    for (const task of channelTasks) {
      blocks.push(buildSingleTaskBlock(task));
      blocks.push({ type: 'divider' });
    }
  }

  return {
    type: 'modal',
    private_metadata: channelId || '',
    title: {
      type: 'plain_text',
      text: 'タスク一覧',
      emoji: true,
    },
    close: {
      type: 'plain_text',
      text: '閉じる',
      emoji: true,
    },
    blocks,
  };
};
