import { sampleViewCallback } from './sample-view.js';
import { submitAddTaskModalCallback } from './task-modal.js';

export const register = (app) => {
  app.view('sample_view_id', sampleViewCallback);
  app.view('submit_add_task_modal', submitAddTaskModalCallback);
};
