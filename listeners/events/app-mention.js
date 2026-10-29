import { addTask, loadTasks } from '../../utils/task-store.js';

export const appMentionCallback = async ({ event, say, logger }) => {
  try {
    const rawText = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();

    if (!rawText || ['help', 'ヘルプ', '使い方'].includes(rawText.toLowerCase())) {
      await say({
        text: '💡 *@test-him <タスク名>* と送信すると、このチャンネルにタスクを登録できます。また *@test-him 一覧* でこのチャンネルのタスクを確認できます。',
      });
      return;
    }

    if (['list', '一覧', 'tasks'].includes(rawText.toLowerCase())) {
      const allTasks = loadTasks(event.user);
      const channelTasks = allTasks.filter((t) => t.channelId === event.channel);
      if (channelTasks.length === 0) {
        await say({
          text: `🎉 <#${event.channel}> に登録されているタスクはありません！`,
        });
        return;
      }

      const lines = channelTasks.map((t) => {
        const check = t.status === 'completed' ? '✅' : '⬜';
        const title = t.status === 'completed' ? `~${t.title}~` : t.title;
        return `${check} *${title}* (担当: <@${t.assigneeId}> | 期限: 📅 ${t.dueDate})`;
      });

      await say({
        text: `📋 *<#${event.channel}> のタスク一覧 (${channelTasks.length}件)*\n${lines.join('\n')}`,
      });
      return;
    }

    addTask({
      title: rawText,
      creatorId: event.user,
      assigneeId: event.user,
      channelId: event.channel,
      dueDate: new Date().toISOString().slice(0, 10),
    });

    await say({
      text: `✅ <#${event.channel}> にタスク *「${rawText}」* を追加しました！`,
    });
  } catch (error) {
    logger.error(error);
  }
};

