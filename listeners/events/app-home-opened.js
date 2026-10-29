import { buildHomeView } from '../../utils/task-store.js';

const appHomeOpenedCallback = async ({ client, event, logger }) => {
  if (event.tab !== 'home') return;

  try {
    await client.views.publish({
      user_id: event.user,
      view: buildHomeView({ userId: event.user }),
    });
  } catch (error) {
    logger.error(error);
  }
};

export { appHomeOpenedCallback };
