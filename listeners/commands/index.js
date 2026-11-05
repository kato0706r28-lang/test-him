import { sampleCommandCallback } from './sample-command.js';
import { taskCommandCallback, tasksCommandCallback } from './task-command.js';

export const register = (app) => {
  app.command('/sample-command', sampleCommandCallback);
  app.command('/task', taskCommandCallback);
  app.command('/tasks', tasksCommandCallback);
};
