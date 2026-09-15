import { AppShell } from '@/components/layout/app-shell';
import { ProfileEditPage } from '@/components/profile/profile-pages';

export default function EditMyPage() {
  return <AppShell currentPath="/profile/edit"><ProfileEditPage/></AppShell>;
}
