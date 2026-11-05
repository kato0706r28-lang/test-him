import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { submitAddTaskModalCallback } from '../../listeners/views/task-modal.js';

describe('task-modal', () => {
  let fakeAck;
  let fakeView;
  let fakeBody;
  let fakeClient;
  let fakeLogger;

  beforeEach(() => {
    fakeAck = mock.fn();
    fakeView = {
      state: {
        values: {
          channel_block: {
            channel_input: {
              selected_conversation: 'C1234',
            },
          },
          title_block: {
            title_input: {
              value: 'test task',
            },
          },
          assignee_block: {
            assignee_input: {
              selected_user: 'U9999',
            },
          },
          priority_block: {
            priority_input: {
              selected_option: {
                value: 'high',
              },
            },
          },
          due_block: {
            due_input: {
              selected_date: '2026-10-31',
            },
          },
          desc_block: {
            desc_input: {
              value: 'test description',
            },
          },
        },
      },
    };
    fakeBody = {
      user: {
        id: 'U1234',
      },
    };
    fakeClient = {
      views: {
        publish: mock.fn(),
      },
      chat: {
        postMessage: mock.fn(),
      },
    };
    fakeLogger = {
      error: mock.fn(),
    };
  });

  it('should acknowledge and add task, publish home view, and post message to channel', async () => {
    await submitAddTaskModalCallback({
      ack: fakeAck,
      view: fakeView,
      body: fakeBody,
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
    assert.strictEqual(fakeClient.chat.postMessage.mock.callCount(), 1);

    const postArg = fakeClient.chat.postMessage.mock.calls[0].arguments[0];
    assert.strictEqual(postArg.channel, 'C1234');
    assert(postArg.text.includes('test task'));
  });
});
