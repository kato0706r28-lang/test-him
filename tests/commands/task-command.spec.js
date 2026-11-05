import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { taskCommandCallback, tasksCommandCallback } from '../../listeners/commands/task-command.js';

describe('task-command', () => {
  let fakeAck;
  let fakeBody;
  let fakeClient;
  let fakeRespond;
  let fakeLogger;

  beforeEach(() => {
    fakeAck = mock.fn();
    fakeBody = {
      user_id: 'U1234',
      channel_id: 'C1234',
      text: '提出物の確認',
      trigger_id: 'trig123',
    };
    fakeClient = {
      views: {
        open: mock.fn(),
      },
    };
    fakeRespond = mock.fn();
    fakeLogger = {
      error: mock.fn(),
    };
  });

  it('should add task when text is provided', async () => {
    await taskCommandCallback({
      ack: fakeAck,
      body: fakeBody,
      client: fakeClient,
      respond: fakeRespond,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeRespond.mock.callCount(), 1);
    const arg = fakeRespond.mock.calls[0].arguments[0];
    assert(arg.text.includes('提出物の確認'));
    assert(arg.text.includes('C1234'));
  });

  it('should open modal when text is empty', async () => {
    fakeBody.text = '';
    await taskCommandCallback({
      ack: fakeAck,
      body: fakeBody,
      client: fakeClient,
      respond: fakeRespond,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.open.mock.callCount(), 1);
  });

  it('should list tasks with /tasks command', async () => {
    await tasksCommandCallback({
      ack: fakeAck,
      body: fakeBody,
      respond: fakeRespond,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeRespond.mock.callCount(), 1);
  });
});
