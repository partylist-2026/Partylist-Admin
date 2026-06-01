'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const schema = z.object({
  email: z.string().email('Valid email is required'),
  storeName: z.string().min(1, 'Store name is required'),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  serviceCity: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  autoApprove: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface CategoryOption {
  id: string;
  name: string;
}

interface AddVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddVendorDialog({ open, onOpenChange }: AddVendorDialogProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { autoApprove: false },
  });

  useEffect(() => {
    if (!open) return;
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((body) => {
        if (body.data) setCategories(body.data);
      })
      .catch(() => setCategories([]));
  }, [open]);

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    const res = await fetch('/api/admin/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        categoryId: values.categoryId || undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSubmitError(body.error ?? 'Failed to create vendor');
      return;
    }
    reset();
    onOpenChange(false);
    router.push(`/vendors/${body.data.vendorId}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add vendor</DialogTitle>
            <DialogDescription>
              Provision a vendor account for Partylist. The owner can sign in later with the
              same email via the vendor app.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="storeName">Store name</Label>
                <Input id="storeName" {...register('storeName')} />
                {errors.storeName && (
                  <p className="text-xs text-destructive">{errors.storeName.message}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Owner email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register('lastName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceCity">Service city</Label>
                <Input id="serviceCity" {...register('serviceCity')} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  className="flex h-10 w-full rounded-[var(--radius-md)] border border-border bg-input px-3 text-sm"
                  {...register('categoryId')}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className="flex w-full rounded-[var(--radius-md)] border border-border bg-input px-3 py-2 text-sm"
                  {...register('description')}
                />
              </div>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" {...register('autoApprove')} className="rounded" />
                <span className="text-sm text-foreground">Approve immediately</span>
              </label>
            </div>
            {submitError && (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-primary-gradient" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Create vendor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
