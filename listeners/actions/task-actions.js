import {
  buildChannelTaskListBlocks,
  buildChannelTasksModalView,
  buildHomeView,
  buildTaskCreatedNotificationBlocks,
  buildTaskModalView,
  getUserState,
  loadTasks,
  setUserState,
  toggleTaskStatus,
} from '../../utils/task-store.js';

export const navTabTasksCallback = async ({ ack, body, client, logger }) => {
  try {
    await ack();
    setUserState(body.user.id, { activeTab: 'tasks' });
    await client.views.publish({
      user_id: body.user.id,
      view: buildHomeView({ userId: body.user.id }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const navTabCounterCallback = async ({ ack, body, client, logger }) => {
  try {
    await ack();
    setUserState(body.user.id, { activeTab: 'counter' });
    await client.views.publish({
      user_id: body.user.id,
      view: buildHomeView({ userId: body.user.id }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const filterAllTasksCallback = async ({
  ack,
  body,
  client,
  logger,
}) => {
  try {
    await ack();
    setUserState(body.user.id, { activeFilter: 'all' });
    await client.views.publish({
      user_id: body.user.id,
      view: buildHomeView({ userId: body.user.id }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const filterMyTasksCallback = async ({ ack, body, client, logger }) => {
  try {
    await ack();
    setUserState(body.user.id, { activeFilter: 'my' });
    await client.views.publish({
      user_id: body.user.id,
      view: buildHomeView({ userId: body.user.id }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const filterByChannelCallback = async ({
  ack,
  body,
  action,
  client,
  logger,
}) => {
  try {
    await ack();
    setUserState(body.user.id, {
      selectedChannel: action.selected_conversation,
    });
    await client.views.publish({
      user_id: body.user.id,
      view: buildHomeView({ userId: body.user.id }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const filterClearChannelCallback = async ({
  ack,
  body,
  client,
  logger,
}) => {
  try {
    await ack();
    setUserState(body.user.id, { selectedChannel: null });
    await client.views.publish({
      user_id: body.user.id,
      view: buildHomeView({ userId: body.user.id }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const toggleTaskStatusCallback = async ({
  ack,
  body,
  action,
  client,
  respond,
  logger,
}) => {
  try {
    await ack();
    toggleTaskStatus(action.value, body.user.id);

    if (body.view?.type === 'home') {
      await client.views.publish({
        user_id: body.user.id,
        view: buildHomeView({ userId: body.user.id }),
      });
      return;
    }

    if (body.view?.type === 'modal') {
      const channelId = body.view.private_metadata || null;
      await client.views.update({
        view_id: body.view.id,
        view: buildChannelTasksModalView({ channelId, userId: body.user.id }),
      });
      return;
    }

    if (respond && body.channel?.id) {
      const allTasks = loadTasks(body.user.id);
      const task = allTasks.find((t) => t.id === action.value);
      const firstBlockText = body.message?.blocks?.[0]?.text?.text || '';

      if (firstBlockText.includes('タスクが追加されました') && task) {
        await respond({
          replace_original: true,
          blocks: buildTaskCreatedNotificationBlocks(task),
        });
        return;
      }

      const task = allTasks.find((t) => t.id === action.value);
      const firstBlockText = body.message?.blocks?.[0]?.text?.text || '';

      if (firstBlockText.includes('タスクが追加されました') && task) {
        await respond({
          replace_original: true,
          blocks: buildTaskCreatedNotificationBlocks(task),
        });
        return;
      }

      const channelTasks = allTasks.filter(
        (t) => t.channelId === body.channel.id,
      );
      await respond({
        replace_original: true,
        blocks: buildChannelTaskListBlocks(channelTasks, body.channel.id),
      });
    }
  } catch (error) {
    logger.error(error);
  }
};

export const openAddTaskModalCallback = async ({
  ack,
  body,
  client,
  logger,
}) => {
  try {
    await ack();
    const state = getUserState(body.user.id);
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildTaskModalView({
        userId: body.user.id,
        defaultChannelId: state.selectedChannel,
      }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const openAddTaskModalFromChannelCallback = async ({ ack, body, action, client, logger }) => {
  try {
    await ack();
    const channelId = action.value || body.channel?.id || null;
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildTaskModalView({
        userId: body.user.id,
        defaultChannelId: channelId,
      }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const openChannelTasksModalCallback = async ({ ack, body, action, client, logger }) => {
  try {
    await ack();
    const channelId = action.value || body.channel?.id || null;
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildChannelTasksModalView({
        channelId,
        userId: body.user.id,
      }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const openAddTaskModalFromChannelCallback = async ({
  ack,
  body,
  action,
  client,
  logger,
}) => {
  try {
    await ack();
    const channelId = action.value || body.channel?.id || null;
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildTaskModalView({
        userId: body.user.id,
        defaultChannelId: channelId,
      }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const openChannelTasksModalCallback = async ({
  ack,
  body,
  action,
  client,
  logger,
}) => {
  try {
    await ack();
    const channelId = action.value || body.channel?.id || null;
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildChannelTasksModalView({
        channelId,
        userId: body.user.id,
      }),
    });
  } catch (error) {
    logger.error(error);
  }
};
