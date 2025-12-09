import { MessageSquare, AtSign, FileText, Bell } from 'lucide-react';

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_comment':
    case 'reply':
      return MessageSquare;
    case 'mention':
      return AtSign;
    case 'new_post':
      return FileText;
    default:
      return Bell;
  }
};
