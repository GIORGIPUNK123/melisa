import { useState } from 'react';
import { Navigate } from 'react-router';
import { Loading } from '../../../components/Loading';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCurrentUserProfile } from '../../friends/hooks/useCurrentUserProfile';
import { SettingsHeader } from '../components/SettingsHeader';
import { SettingsSidebar } from '../components/SettingsSidebar';
import { AccountSettingsTab } from '../components/tabs/AccountSettingsTab';
import { AppearanceSettingsTab } from '../components/tabs/AppearanceSettingsTab';
import { NotificationsSettingsTab } from '../components/tabs/NotificationsSettingsTab';
import { ProfileSettingsTab } from '../components/tabs/ProfileSettingsTab';
import type { SettingsUser } from '../services/settingsService';
import type { SettingsTabT } from '../types';

export const SettingsPage = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { profile, setProfile } = useCurrentUserProfile(userId);
  const setAuthProfile = useAuthStore((state) => state.setProfile);
  const [activeTab, setActiveTab] = useState<SettingsTabT>('profile');

  if (!user) return <Navigate to='/login' replace />;
  if (!profile) return <Loading />;

  const handleSaved = (updated: SettingsUser) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
    setAuthProfile((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  return (
    <div className='overflow-y-auto overflow-x-hidden overscroll-y-contain relative w-full min-w-0 h-full bg-background'>
      <SettingsHeader />

      <div className='flex flex-col gap-4 px-4 pt-0 pb-8 mx-auto w-full max-w-259 sm:px-6 lg:flex-row lg:justify-center lg:gap-8 lg:px-8 lg:py-8'>
        <SettingsSidebar activeTab={activeTab} onChange={setActiveTab} />

        <main className='mx-auto w-full min-w-0 max-w-180 lg:mx-0'>
          {activeTab === 'profile' && (
            <ProfileSettingsTab
              profile={profile}
              fallbackEmail={user.email}
              onSaved={handleSaved}
            />
          )}

          {activeTab === 'account' && (
            <AccountSettingsTab profile={profile} onSaved={handleSaved} />
          )}

          {activeTab === 'notifications' && <NotificationsSettingsTab />}

          {activeTab === 'appearance' && <AppearanceSettingsTab />}
        </main>
      </div>
    </div>
  );
};
