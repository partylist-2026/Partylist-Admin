'use client';

import { useState } from 'react';
import { VendorsPageHeader } from '@/components/vendors/vendors-page-header';
import { AddVendorDialog } from '@/components/vendors/add-vendor-dialog';
import type { VendorStatus } from '@/lib/api/vendors.types';

interface VendorsPageHeaderWithAddProps {
  statusFilter: VendorStatus | '';
}

export function VendorsPageHeaderWithAdd({ statusFilter }: VendorsPageHeaderWithAddProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <VendorsPageHeader
        statusFilter={statusFilter}
        onAddVendor={() => setAddOpen(true)}
      />
      <AddVendorDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
