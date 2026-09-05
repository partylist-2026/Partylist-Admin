import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getVendorDetail } from '@/lib/api/vendors';
import { VendorDetailView } from '@/components/vendors/vendor-detail-view';

export const metadata: Metadata = {
  title: 'Vendor details',
};

interface VendorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorDetailPage({ params }: VendorDetailPageProps) {
  const { id } = await params;

  try {
    const vendor = await getVendorDetail(id);
    return <VendorDetailView vendor={vendor} />;
  } catch {
    notFound();
  }
}
