import { sampleActionCallback } from './sample-action.js';
import {
  filterAllTasksCallback,
  filterByChannelCallback,
  filterClearChannelCallback,
  filterMyTasksCallback,
  navTabCounterCallback,
  navTabTasksCallback,
  openAddTaskModalCallback,
  toggleTaskStatusCallback,
} from './task-actions.js';

export const register = (app) => {
  app.action('sample_action_id', sampleActionCallback);
  app.action('nav_tab_tasks', navTabTasksCallback);
  app.action('nav_tab_counter', navTabCounterCallback);
  app.action('filter_all_tasks', filterAllTasksCallback);
  app.action('filter_my_tasks', filterMyTasksCallback);
  app.action('filter_by_channel', filterByChannelCallback);
  app.action('filter_clear_channel', filterClearChannelCallback);
  app.action('toggle_task_status', toggleTaskStatusCallback);
  app.action('open_add_task_modal', openAddTaskModalCallback);
};
