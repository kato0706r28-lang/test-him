import { addTask, buildHomeView } from '../../utils/task-store.js';

export const submitAddTaskModalCallback = async ({ ack, view, body, client, logger }) => {
  try {
    await ack();

    const values = view.state.values;
    const title = values.title_block?.title_input?.value || '無題のタスク';
    const assigneeId = values.assignee_block?.assignee_input?.selected_user || body.user.id;
    const priority = values.priority_block?.priority_input?.selected_option?.value || 'medium';
    const dueDate = values.due_block?.due_input?.selected_date || null;
    const description = values.desc_block?.desc_input?.value || '';

    addTask({
      title,
      creatorId: body.user.id,
      assigneeId,
      priority,
      dueDate,
      description,
    });

    await client.views.publish({
      user_id: body.user.id,
      view: buildHomeView({ userId: body.user.id }),
    });
  } catch (error) {
    logger.error(error);
  }
};
