import { TaskManagementClient } from './TaskManagementClient';

export const metadata = {
  title: 'Giao việc - EduOS',
  description: 'Giao việc và theo dõi tiến độ nhân sự',
};

export default function TasksPage() {
  return <TaskManagementClient />;
}
