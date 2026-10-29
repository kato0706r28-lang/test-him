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
    };
    fakeLogger = {
      error: mock.fn(),
    };
  });

  it('should acknowledge and add task then update home view', async () => {
    await submitAddTaskModalCallback({
      ack: fakeAck,
      view: fakeView,
      body: fakeBody,
      client: fakeClient,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeAck.mock.callCount(), 1);
    assert.strictEqual(fakeClient.views.publish.mock.callCount(), 1);
  });
});

