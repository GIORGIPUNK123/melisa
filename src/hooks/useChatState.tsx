import { useState, useEffect } from 'react';
import { PublicProfileT } from '../types';

export const useChatState = () => {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [conversationMembers, setConversationMembers] = useState<
    PublicProfileT[]
  >([]);
  const [isChatInfoVisible, setIsChatInfoVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [isOpeningConversation, setIsOpeningConversation] = useState(false);

  // Auto-show sidebar when no conversation is active
  useEffect(() => {
    if (!activeConversationId) {
      setIsSidebarVisible(true);
    }
  }, [activeConversationId]);

  const handleFriendSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleMembersChange = (members: PublicProfileT[]) => {
    setConversationMembers(members);
  };

  const toggleChatInfo = () => {
    setIsChatInfoVisible(!isChatInfoVisible);
  };

  const beginConversationTransition = () => {
    setActiveTab('chats');
    setIsSidebarVisible(false);
    setIsOpeningConversation(true);
  };

  const endConversationTransition = () => {
    setIsOpeningConversation(false);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const closeSidebar = () => {
    setIsSidebarVisible(false);
  };

  const closeChatInfo = () => {
    setIsChatInfoVisible(false);
  };

  const selectConversationAndSwitchToChats = (conversationId: string) => {
    setActiveTab('chats');
    handleFriendSelect(conversationId);
    closeSidebar();
  };

  const clearActiveConversation = () => {
    setActiveConversationId(null);
    setConversationMembers([]);
    setIsOpeningConversation(false);
  };

  return {
    activeConversationId,
    conversationMembers,
    isChatInfoVisible,
    isSidebarVisible,
    activeTab,
    setActiveTab,
    handleFriendSelect,
    handleMembersChange,
    toggleChatInfo,
    toggleSidebar,
    closeSidebar,
    closeChatInfo,
    beginConversationTransition,
    endConversationTransition,
    isOpeningConversation,
    selectConversationAndSwitchToChats,
    clearActiveConversation,
  };
};
