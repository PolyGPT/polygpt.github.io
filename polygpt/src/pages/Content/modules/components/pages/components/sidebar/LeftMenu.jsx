import React, { useCallback, useMemo, useState } from 'react';
import { SERVICE_NAME } from '../../../../../../../codes/Common';
import useConversationStore from '../../../store/conversationStore';
import LeftMenuItem from './LeftMenuItem';

const LeftMenu = () => {
  const conversations = useConversationStore((store) => store.conversations);
  const getConversations = useConversationStore((store) => store.getConversations);
  const [showButtonBlock, setShowButtonBlock] = useState(false);

  const onClickShowMore = useCallback(
    async (e) => {
      e.preventDefault();

      if (showButtonBlock === false) {
        setShowButtonBlock(true);
        await getConversations();
        setShowButtonBlock(false);
      }
      return false;
    },
    [getConversations, showButtonBlock],
  );

  const totalCount = useMemo(() => {
    if (conversations.total) {
      return conversations.total;
    }

    return 0;
  }, [conversations.total]);

  const conversationItemCount = useMemo(() => {
    if (conversations.items) {
      return conversations.items.length;
    }
    return 0;
  }, [conversations.items]);

  const conversationFilter = useMemo(() => {
    if (!conversations || !conversations.items) {
      return [];
    }
    return conversations.items.filter((item) => item.title.substring(0, SERVICE_NAME.length) !== SERVICE_NAME);
  }, [conversations]);

  if (conversations?.items === undefined) {
    return <div></div>;
  }

  return (
    <div className="overflow-y-auto scrollarea menu-list">
      <ul className="nav nav-pills flex-column mb-auto">
        {conversationFilter.map((item) => (
          <LeftMenuItem item={item} key={item.id} />
        ))}
        {totalCount > conversationItemCount && (
          <li className="mt-2 text-center">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClickShowMore} disabled={showButtonBlock}>
              show more
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default LeftMenu;
