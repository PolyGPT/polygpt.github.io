import React, { useMemo } from 'react';
import ChatGPTMessage from './ChatGPTMessage';
import UserMessage from './UserMessage';
import { ROLE_ASSISTANT_TYPE, ROLE_USER_TYPE } from '../../../../../../../codes/RoleType';

const ChatRole = ({ chat, isWide }) => {
  const role = useMemo(() => {
    return chat.message.author.role;
  }, [chat]);
  if (role === ROLE_ASSISTANT_TYPE) {
    return <ChatGPTMessage chat={chat} isWide={isWide} />;
  }
  if (role === ROLE_USER_TYPE) {
    return <UserMessage chat={chat} isWide={isWide} />;
  }
  return null;
};

export default ChatRole;
