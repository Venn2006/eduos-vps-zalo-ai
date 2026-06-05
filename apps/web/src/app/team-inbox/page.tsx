import { TeamInboxClient } from './TeamInboxClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tin nhắn & Zalo | EduOS',
  description: 'Team Inbox and Zalo Hotline Governance',
};

export default function TeamInboxPage() {
  return <TeamInboxClient />;
}
