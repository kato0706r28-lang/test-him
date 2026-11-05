import {
  addTask,
  buildChannelTaskListBlocks,
  buildTaskCreatedNotificationBlocks,
  loadTasks,
} from '../../utils/task-store.js';

export const appMentionCallback = async ({ event, say, logger }) => {
  try {
    const rawText = event.text.replace(/<@[a-zA-Z0-9_-]+>/g, '').trim();

    if (!rawText || ['help', 'ヘルプ', '使い方'].includes(rawText.toLowerCase())) {
      await say({
        text: '💡 *@test-him <タスク名>* と送信すると、このチャンネルにタスクを登録できます。また *@test-him 一覧* または */tasks* でこのチャンネルのタスクを確認できます。',
      });
      return;
    }

    if (['list', '一覧', 'tasks'].includes(rawText.toLowerCase())) {
      const allTasks = loadTasks(event.user);
      const channelTasks = allTasks.filter((t) => t.channelId === event.channel);

      await say({
        blocks: buildChannelTaskListBlocks(channelTasks, event.channel),
        text: `📋 <#${event.channel}> のタスク一覧`,
      });
      return;
    }

    const newTask = addTask({
      title: rawText,
      creatorId: event.user,
      assigneeId: event.user,
      channelId: event.channel,
      dueDate: new Date().toISOString().slice(0, 10),
    });

    await say({
      blocks: buildTaskCreatedNotificationBlocks(newTask),
      text: `📢 <#${event.channel}> にタスク *「${rawText}」* を追加しました！`,
    });
  } catch (error) {
    logger.error(error);
  }
};
