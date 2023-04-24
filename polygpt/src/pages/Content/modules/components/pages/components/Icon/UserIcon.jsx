import React, { useMemo } from 'react';
import useConversationStore from '../../../store/conversationStore';

const UserIcon = () => {
  const userSession = useConversationStore((store) => store.userSession);

  const picture = useMemo(() => {
    if (userSession && userSession.user && userSession.user.picture) {
      return userSession.user.picture;
    }
  }, [userSession]);

  return <img src={picture} alt="" className="me-2 rounded user-image flex-shrink-1" />;
};

export default UserIcon;
