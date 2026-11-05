import {
  addTask,
  buildChannelTaskListBlocks,
  buildTaskCreatedNotificationBlocks,
  buildTaskModalView,
  loadTasks,
} from '../../utils/task-store.js';

export const taskCommandCallback = async ({ ack, body, client, respond, logger }) => {
  try {
    await ack();
    const text = (body.text || '').trim();
    const channelId = body.channel_id;

    if (!text) {
      await client.views.open({
        trigger_id: body.trigger_id,
        view: buildTaskModalView({
          userId: body.user_id,
          defaultChannelId: channelId,
        }),
      });
      return;
    }

    const newTask = addTask({
      title: text,
      creatorId: body.user_id,
      assigneeId: body.user_id,
      channelId,
      dueDate: new Date().toISOString().slice(0, 10),
    });

    await respond({
      response_type: 'in_channel',
      blocks: buildTaskCreatedNotificationBlocks(newTask),
      text: `📢 <#${channelId}> にタスク *「${text}」* を追加しました！`,
    });
  } catch (error) {
    logger.error(error);
  }
};

export const tasksCommandCallback = async ({ ack, body, respond, logger }) => {
  try {
    await ack();
    const channelId = body.channel_id;
    const allTasks = loadTasks(body.user_id);
    const channelTasks = allTasks.filter((t) => t.channelId === channelId);

    await respond({
      response_type: 'in_channel',
      blocks: buildChannelTaskListBlocks(channelTasks, channelId),
      text: `📋 <#${channelId}> のタスク一覧`,
    });
  } catch (error) {
    logger.error(error);
  }
};
