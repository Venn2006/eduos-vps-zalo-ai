import { Metadata } from 'next';
import MockOutboxClient from './MockOutboxClient';

export const metadata: Metadata = {
  title: 'Hàng đợi gửi giả lập',
  description: 'Kiểm tra quy trình gửi trong sandbox.',
};

export default function MockOutboxPage() {
  return <MockOutboxClient />;
}
