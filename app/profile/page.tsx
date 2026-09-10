import { AppShell } from '@/components/layout/app-shell';
import { ProfilePage } from '@/components/profile/profile-pages';

export default function MyPage() {
  return <AppShell currentPath="/profile"><ProfilePage/></AppShell>;
}
