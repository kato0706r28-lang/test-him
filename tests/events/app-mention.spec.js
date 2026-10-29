import assert from 'node:assert';
import { beforeEach, describe, it, mock } from 'node:test';
import { appMentionCallback } from '../../listeners/events/app-mention.js';

describe('app-mention', () => {
  let fakeEvent;
  let fakeSay;
  let fakeLogger;

  beforeEach(() => {
    fakeEvent = {
      user: 'U1234',
      channel: 'C1234',
      text: '<@U_BOT> 新しいタスク',
    };
    fakeSay = mock.fn();
    fakeLogger = {
      error: mock.fn(),
    };
  });

  it('should add task and reply to channel', async () => {
    await appMentionCallback({
      event: fakeEvent,
      say: fakeSay,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeSay.mock.callCount(), 1);
    const callArgs = fakeSay.mock.calls[0].arguments[0];
    assert(callArgs.text.includes('C1234'));
    assert(callArgs.text.includes('新しいタスク'));
  });

  it('should list tasks when requested', async () => {
    fakeEvent.text = '<@U_BOT> 一覧';
    await appMentionCallback({
      event: fakeEvent,
      say: fakeSay,
      logger: fakeLogger,
    });

    assert.strictEqual(fakeSay.mock.callCount(), 1);
  });
});

