import { buildHomeView, buildTaskModalView, setUserState, toggleTaskStatus } from '../../utils/task-store.js';

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

export const filterAllTasksCallback = async ({ ack, body, client, logger }) => {
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

export const toggleTaskStatusCallback = async ({ ack, body, action, client, logger }) => {
  try {
    await ack();
    toggleTaskStatus(action.value, body.user.id);
    await client.views.publish({
      user_id: body.user.id,
      view: buildHomeView({ userId: body.user.id }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export const openAddTaskModalCallback = async ({ ack, body, client, logger }) => {
  try {
    await ack();
    await client.views.open({
      trigger_id: body.trigger_id,
      view: buildTaskModalView({ userId: body.user.id }),
    });
  } catch (error) {
    logger.error(error);
  }
};
