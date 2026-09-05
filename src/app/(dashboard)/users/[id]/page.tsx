import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUserDetail } from '@/lib/api/users';
import { getUserDisplayName } from '@/lib/api/users.types';
import { UserDetailView } from '@/components/users/user-detail-view';

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const user = await getUserDetail(id);
    return { title: `${getUserDisplayName(user)} — Profile` };
  } catch {
    return { title: 'User Profile' };
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;

  try {
    const user = await getUserDetail(id);
    return <UserDetailView user={user} />;
  } catch {
    notFound();
  }
}
