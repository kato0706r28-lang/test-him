import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import {
  filterAllTasksCallback,
  filterMyTasksCallback,
  navTabCounterCallback,
  navTabTasksCallback,
  openAddTaskModalCallback,
  toggleTaskStatusCallback,
} from '../../listeners/actions/task-actions.js';

describe('task-actions', () => {
  let fakeAck;
  let fakeClient;
  let fakeBody;
  let fakeLogger;

  beforeEach(() => {
    fakeAck = mock.fn();
    fakeClient = {
      views: {
        publish: mock.fn(),
        open: mock.fn(),
      },
    };
    fakeBody = {
      user: { id: 'U1234' },
      trigger_id: 'trig123',
    };
    fakeLogger = {
      error: mock.fn(),
    };
  });

  it('should switch to tasks tab', async () => {
    await navTabTasksCallback({
      ack: fakeAck,
      body: fakeBody,
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
  });

  it('should switch to counter tab', async () => {
    await navTabCounterCallback({
      ack: fakeAck,
      body: fakeBody,
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
  });

  it('should filter all tasks', async () => {
    await filterAllTasksCallback({
      ack: fakeAck,
      body: fakeBody,
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
  });

  it('should filter my tasks', async () => {
    await filterMyTasksCallback({
      ack: fakeAck,
      body: fakeBody,
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
  });

  it('should toggle task status', async () => {
    await toggleTaskStatusCallback({
      ack: fakeAck,
      body: fakeBody,
      action: { value: 'task_1' },
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
  });

  it('should open task modal', async () => {
    await openAddTaskModalCallback({
      ack: fakeAck,
      body: fakeBody,
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.open.mock.callCount(), 1);
  });
});

