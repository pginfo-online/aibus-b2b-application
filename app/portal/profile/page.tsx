'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  FileCheck2,
  Landmark,
  Users,
  Upload,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { useToastStore } from '@/store/toast-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AgentOrganization,
  AgentKycDocument,
  AgentBankAccount,
  AgentStaffMember,
  AgentKycDocType,
} from '@/types/api';

// Validation Schema for Profile Editing
const profileFormSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  contactPersonName: z.string().min(2, 'Contact person name is required'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  businessAddress: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional().or(z.literal('')),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format')
    .optional()
    .or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Bank account schema
const bankAccountSchema = z.object({
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  accountNumber: z.string().min(8, 'Account number must be at least 8 digits').max(20),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g., HDFC0001234)'),
  bankName: z.string().min(2, 'Bank name is required'),
  isPrimary: z.boolean(),
});

type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

// Staff invite schema
const staffInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['MANAGER', 'BOOKING_AGENT', 'ACCOUNTANT', 'VIEWER']),
});

type StaffInviteFormValues = z.infer<typeof staffInviteSchema>;

export default function AgentProfilePage() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<string>('details');

  // Modals state
  const [isBankModalOpen, setIsBankModalOpen] = useState<boolean>(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const [selectedDocType, setSelectedDocType] = useState<AgentKycDocType>('PAN_CARD');
  const [mockFileUrl, setMockFileUrl] = useState<string>('');

  // 1. Fetch Profile Data
  const {
    data: profile,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: ['agent-profile'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AgentOrganization }>('/agents/profile');
      return res.data;
    },
    staleTime: 60_000,
  });

  // 2. Fetch KYC Documents
  const {
    data: kycData,
    isLoading: isKycLoading,
  } = useQuery({
    queryKey: ['agent-kyc-status'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: { status: string; documents: AgentKycDocument[] } }>(
        '/agents/kyc/status'
      );
      return res.data;
    },
    staleTime: 60_000,
  });

  // 3. Fetch Bank Accounts
  const {
    data: bankAccounts,
    isLoading: isBanksLoading,
  } = useQuery({
    queryKey: ['agent-bank-accounts'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AgentBankAccount[] }>('/agents/bank-accounts');
      return res.data;
    },
    staleTime: 60_000,
  });

  // 4. Fetch Staff Members
  const {
    data: staffMembers,
    isLoading: isStaffLoading,
  } = useQuery({
    queryKey: ['agent-staff'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AgentStaffMember[] }>('/agents/staff');
      return res.data;
    },
    staleTime: 60_000,
  });

  // Profile Form Hook
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
    reset: resetProfileForm,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: profile
      ? {
          businessName: profile.businessName || '',
          contactPersonName: profile.contactPersonName || '',
          phone: profile.phone || '',
          businessAddress: profile.businessAddress || '',
          city: profile.city || '',
          state: profile.state || '',
          pincode: profile.pincode || '',
          gstNumber: profile.gstNumber || '',
        }
      : undefined,
  });

  // Bank Form Hook
  const {
    register: registerBank,
    handleSubmit: handleBankSubmit,
    formState: { errors: bankErrors },
    reset: resetBankForm,
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      isPrimary: true,
    },
  });

  // Staff Form Hook
  const {
    register: registerStaff,
    handleSubmit: handleStaffSubmit,
    formState: { errors: staffErrors },
    reset: resetStaffForm,
  } = useForm<StaffInviteFormValues>({
    resolver: zodResolver(staffInviteSchema),
    defaultValues: {
      email: '',
      role: 'BOOKING_AGENT',
    },
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await api.put<{ success: boolean; data: AgentOrganization }>('/agents/profile', values);
      return res.data;
    },
    onSuccess: (updated) => {
      addToast({
        type: 'success',
        title: 'Profile Saved',
        message: 'Your agency business information has been updated.',
      });
      queryClient.setQueryData(['agent-profile'], updated);
      resetProfileForm(updated as unknown as ProfileFormValues);
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Unable to update profile. Please verify all fields.',
      });
    },
  });

  const addBankMutation = useMutation({
    mutationFn: async (values: BankAccountFormValues) => {
      const res = await api.post<{ success: boolean; data: AgentBankAccount }>('/agents/bank-accounts', values);
      return res.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Bank Account Added',
        message: 'Settlement bank account linked successfully.',
      });
      setIsBankModalOpen(false);
      resetBankForm();
      queryClient.invalidateQueries({ queryKey: ['agent-bank-accounts'] });
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: 'error',
        title: 'Failed to Add Bank',
        message: err.message || 'Could not verify or link bank account.',
      });
    },
  });

  const submitKycMutation = useMutation({
    mutationFn: async (payload: { docType: AgentKycDocType; fileUrl: string; storageKey: string }) => {
      const res = await api.post<{ success: boolean; message: string; data: AgentKycDocument }>(
        '/agents/kyc/documents',
        payload
      );
      return res.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'KYC Document Uploaded',
        message: 'Document submitted for administrative compliance verification.',
      });
      setIsKycModalOpen(false);
      setMockFileUrl('');
      queryClient.invalidateQueries({ queryKey: ['agent-kyc-status'] });
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message || 'Failed to submit KYC document.',
      });
    },
  });

  const inviteStaffMutation = useMutation({
    mutationFn: async (values: StaffInviteFormValues) => {
      const res = await api.post<{ success: boolean; data: unknown }>('/agents/staff/invite', values);
      return res.data;
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Staff Invited',
        message: 'An onboarding invitation has been generated for the staff member.',
      });
      setIsStaffModalOpen(false);
      resetStaffForm();
      queryClient.invalidateQueries({ queryKey: ['agent-staff'] });
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: 'error',
        title: 'Invitation Failed',
        message: err.message || 'Unable to invite staff member.',
      });
    },
  });

  const removeStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const res = await api.delete<{ success: boolean; message: string }>(`/agents/staff/${staffId}`);
      return res;
    },
    onSuccess: () => {
      addToast({
        type: 'info',
        title: 'Staff Removed',
        message: 'Staff member credentials have been revoked.',
      });
      queryClient.invalidateQueries({ queryKey: ['agent-staff'] });
    },
    onError: (err: { message?: string }) => {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Unable to remove staff member.',
      });
    },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary-red" />
            Agency Profile & Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your registered travel agency identity, KYC compliance, settlement bank accounts, and delegated staff.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant={
              profile?.status === 'APPROVED'
                ? 'success'
                : profile?.status === 'REJECTED'
                ? 'error'
                : 'warning'
            }
            className="text-xs px-3 py-1 uppercase tracking-wider font-bold"
          >
            {profile?.status?.replace(/_/g, ' ') || 'ACTIVE'}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 max-w-xl">
          <TabsTrigger value="details" className="flex items-center gap-2 text-xs">
            <Building2 className="w-4 h-4" />
            <span>Agency</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2 text-xs">
            <FileCheck2 className="w-4 h-4" />
            <span>KYC Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="banks" className="flex items-center gap-2 text-xs">
            <Landmark className="w-4 h-4" />
            <span>Bank Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2 text-xs">
            <Users className="w-4 h-4" />
            <span>Staff Roles</span>
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Tab 1: Agency Details ---------------- */}
        <TabsContent value="details" className="mt-6">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Registered Travel Agency Details
              </CardTitle>
              <p className="text-xs text-neutral-500">
                These business details appear on customer bus tickets, invoices, and GST tax statements.
              </p>
            </CardHeader>

            <CardContent>
              {isProfileLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <form
                  onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Agency Business Name *
                      </label>
                      <Input {...registerProfile('businessName')} error={profileErrors.businessName?.message} />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Primary Contact Person *
                      </label>
                      <Input
                        {...registerProfile('contactPersonName')}
                        error={profileErrors.contactPersonName?.message}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Contact Phone *
                      </label>
                      <Input {...registerProfile('phone')} error={profileErrors.phone?.message} />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block flex items-center gap-1">
                        <span>Registered Email (Immutable)</span>
                        <Lock className="w-3 h-3 text-neutral-400" />
                      </label>
                      <Input value={profile?.email || ''} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                      Registered Business Address *
                    </label>
                    <Input
                      {...registerProfile('businessAddress')}
                      error={profileErrors.businessAddress?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        City *
                      </label>
                      <Input {...registerProfile('city')} error={profileErrors.city?.message} />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        State *
                      </label>
                      <Input {...registerProfile('state')} error={profileErrors.state?.message} />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Pincode
                      </label>
                      <Input {...registerProfile('pincode')} error={profileErrors.pincode?.message} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        GST Identification Number (GSTIN)
                      </label>
                      <Input {...registerProfile('gstNumber')} error={profileErrors.gstNumber?.message} />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block flex items-center gap-1">
                        <span>PAN Number (Locked with KYC)</span>
                        <Lock className="w-3 h-3 text-neutral-400" />
                      </label>
                      <Input value={profile?.panNumber || '—'} disabled className="bg-neutral-50 dark:bg-neutral-800" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={updateProfileMutation.isPending || !isProfileDirty}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Tab 2: KYC Compliance ---------------- */}
        <TabsContent value="kyc" className="mt-6 space-y-6">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  KYC Verification & Regulatory Documents
                </CardTitle>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Mandatory under RBI/GST guidelines for B2B commercial bus ticketing and commission settlements.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsKycModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {isKycLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (kycData?.documents?.length ?? 0) === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                    <FileCheck2 className="w-6 h-6 text-neutral-400" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    No documents uploaded yet
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Upload your PAN Card, GST Certificate, and Business Registration to unlock higher wallet credit limits.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsKycModalOpen(true)}
                    className="mt-4"
                  >
                    Upload First Document
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {kycData?.documents?.map((doc) => {
                    const isVerified = Boolean(doc.verifiedAt);
                    const isRejected = Boolean(doc.rejectedAt);

                    return (
                      <div key={doc.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isVerified
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                                : isRejected
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/40'
                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
                            }`}
                          >
                            {isVerified ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isRejected ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                              {doc.docType.replace(/_/g, ' ')}
                            </div>
                            <div className="text-xs text-neutral-500">
                              Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                              {doc.rejectReason && (
                                <span className="text-red-500 ml-2 font-medium">
                                  Reason: {doc.rejectReason}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Badge
                          variant={isVerified ? 'success' : isRejected ? 'error' : 'warning'}
                          size="sm"
                        >
                          {isVerified ? 'VERIFIED' : isRejected ? 'REJECTED' : 'PENDING REVIEW'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Tab 3: Bank Accounts ---------------- */}
        <TabsContent value="banks" className="mt-6 space-y-6">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Settlement & Withdrawal Bank Accounts
                </CardTitle>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Linked accounts for commission payouts, automated refunds, and wallet redemption.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsBankModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Bank Account
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {isBanksLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (bankAccounts?.length ?? 0) === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                    <Landmark className="w-6 h-6 text-neutral-400" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    No bank accounts linked
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Link your verified business bank account to receive automated commission deposits.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBankModalOpen(true)}
                    className="mt-4"
                  >
                    Add Bank Account
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {bankAccounts?.map((bank) => (
                    <div key={bank.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                          <Landmark className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <span>{bank.bankName}</span>
                            {bank.isPrimary && (
                              <Badge variant="info" size="sm">
                                Primary Settlement
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 font-mono">
                            A/C: {bank.accountNumber} • IFSC: {bank.ifscCode} • Holder: {bank.accountHolderName}
                          </div>
                        </div>
                      </div>

                      <Badge variant={bank.isVerified ? 'success' : 'warning'} size="sm">
                        {bank.isVerified ? 'VERIFIED' : 'PENNY DROP PENDING'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Tab 4: Staff Roles ---------------- */}
        <TabsContent value="staff" className="mt-6 space-y-6">
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <CardTitle className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Staff Delegation & Role-Based Access
                </CardTitle>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Authorize booking agents, managers, and accountants to issue tickets from your shared wallet balance.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsStaffModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Invite Staff Member
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {isStaffLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (staffMembers?.length ?? 0) === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-neutral-400" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    No delegated staff members
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Add counter agents or branch operators to search and book buses under your agency credit limit.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsStaffModalOpen(true)}
                    className="mt-4"
                  >
                    Invite First Staff Member
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {staffMembers?.map((staff) => (
                    <div key={staff.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {staff.user?.email || staff.userId}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Role: <span className="font-semibold">{staff.role}</span> • Invited:{' '}
                          {new Date(staff.invitedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="default" size="sm">
                          {staff.role}
                        </Badge>
                        {staff.role !== 'OWNER' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStaffMutation.mutate(staff.id)}
                            disabled={removeStaffMutation.isPending}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 px-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Add Bank Account */}
      <Dialog open={isBankModalOpen} onOpenChange={setIsBankModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary-red" />
              Link Settlement Bank Account
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleBankSubmit((data: BankAccountFormValues) => addBankMutation.mutate(data))} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                Account Holder Name *
              </label>
              <Input
                placeholder="As printed on bank cheque"
                {...registerBank('accountHolderName')}
                error={bankErrors.accountHolderName?.message}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                Account Number *
              </label>
              <Input
                type="password"
                placeholder="e.g. 50100234567890"
                {...registerBank('accountNumber')}
                error={bankErrors.accountNumber?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                  IFSC Code *
                </label>
                <Input
                  placeholder="HDFC0001234"
                  {...registerBank('ifscCode')}
                  error={bankErrors.ifscCode?.message}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                  Bank Name *
                </label>
                <Input
                  placeholder="HDFC Bank"
                  {...registerBank('bankName')}
                  error={bankErrors.bankName?.message}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsBankModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={addBankMutation.isPending}>
                {addBankMutation.isPending ? 'Verifying...' : 'Link Bank Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Upload KYC Document */}
      <Dialog open={isKycModalOpen} onOpenChange={setIsKycModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary-red" />
              Upload Regulatory KYC Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                Document Category *
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value as AgentKycDocType)}
                className="w-full h-10 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
              >
                <option value="PAN_CARD">Agency / Director PAN Card</option>
                <option value="GST_CERTIFICATE">GST Registration Certificate</option>
                <option value="BUSINESS_REGISTRATION">Shop Act / Udyam / Certificate of Inc.</option>
                <option value="CANCELLED_CHEQUE">Cancelled Cheque / Bank Statement</option>
                <option value="OWNER_IDENTITY">Owner Identity (Aadhaar / Passport)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                Document File URL / Cloud S3 Link *
              </label>
              <Input
                placeholder="https://storage.aibus.in/kyc/doc-sample.pdf"
                value={mockFileUrl}
                onChange={(e) => setMockFileUrl(e.target.value)}
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Accepts PDF, JPG, or PNG files under 5 MB.
              </p>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsKycModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  submitKycMutation.mutate({
                    docType: selectedDocType,
                    fileUrl: mockFileUrl || 'https://storage.aibus.in/kyc/verified-pan.pdf',
                    storageKey: `kyc_${Date.now()}`,
                  })
                }
                disabled={submitKycMutation.isPending}
              >
                {submitKycMutation.isPending ? 'Submitting...' : 'Submit for Compliance'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Invite Staff */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-red" />
              Invite Agency Staff Member
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleStaffSubmit((data) => inviteStaffMutation.mutate(data))} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                Staff Email Address *
              </label>
              <Input
                type="email"
                placeholder="agent.staff@youragency.com"
                {...registerStaff('email')}
                error={staffErrors.email?.message}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                Assigned Role & Permissions *
              </label>
              <select
                {...registerStaff('role')}
                className="w-full h-10 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-neutral-100"
              >
                <option value="BOOKING_AGENT">BOOKING_AGENT (Can search and issue tickets)</option>
                <option value="MANAGER">MANAGER (Can manage staff and view earnings)</option>
                <option value="ACCOUNTANT">ACCOUNTANT (Can view ledger and export reports)</option>
                <option value="VIEWER">VIEWER (Read-only access)</option>
              </select>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsStaffModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={inviteStaffMutation.isPending}>
                {inviteStaffMutation.isPending ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
