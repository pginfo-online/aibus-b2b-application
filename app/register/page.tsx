"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bus, Building2, User, Mail, Phone, Lock, MapPin, ArrowRight, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { NormalizedApiError } from "@/lib/error-normalizer";
import type { AgentOrganization, AuthTokens, UserProfile } from "@/types/api";

const registerAgentFormSchema = z.object({
  businessName: z.string().min(2, "Business / Agency name is required").max(200),
  contactPersonName: z.string().min(2, "Contact person name is required").max(100),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Valid 10-digit mobile number required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessAddress: z.string().min(5, "Business address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Must be a 6-digit postal code").optional().or(z.literal("")),
  gstNumber: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid 15-character GST format")
    .optional()
    .or(z.literal("")),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid 10-character PAN format (e.g. ABCDE1234F)")
    .optional()
    .or(z.literal("")),
});

type RegisterAgentFormData = z.infer<typeof registerAgentFormSchema>;

interface RegisterApiResponse {
  agent: AgentOrganization;
  user: UserProfile;
  tokens: AuthTokens;
}

export default function RegisterAgentPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterAgentFormData>({
    resolver: zodResolver(registerAgentFormSchema),
    defaultValues: {
      businessName: "",
      contactPersonName: "",
      email: "",
      phone: "",
      password: "",
      businessAddress: "",
      city: "",
      state: "",
      pincode: "",
      gstNumber: "",
      panNumber: "",
    },
  });

  const onSubmit = async (data: RegisterAgentFormData) => {
    setIsLoading(true);
    setFormError(null);

    // Filter empty optional strings to undefined
    const payload = {
      ...data,
      pincode: data.pincode || undefined,
      gstNumber: data.gstNumber ? data.gstNumber.toUpperCase() : undefined,
      panNumber: data.panNumber ? data.panNumber.toUpperCase() : undefined,
    };

    try {
      const response = await api.post<RegisterApiResponse>("/agents/register", payload, {
        skipAuth: true,
      });

      if (response && response.tokens && response.user) {
        setAuth({
          user: response.user,
          tokens: response.tokens,
          agent: response.agent,
        });

        toast.success("Agency registered successfully! Please submit your KYC documents to activate full ticketing.");
        router.push("/portal/profile");
      } else {
        throw new Error("Invalid response received from registration service");
      }
    } catch (err) {
      if (err instanceof NormalizedApiError) {
        setFormError(err.localizedMessage.en);
        toast.error(err.localizedMessage.en);
      } else if (err instanceof Error) {
        setFormError(err.message);
        toast.error(err.message);
      } else {
        setFormError("Failed to register agent account. Please check your details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D92D20] text-white shadow-lg shadow-red-600/30">
              <Bus className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Ai<span className="text-[#D92D20]">Bus</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-red-100 text-[#D92D20] dark:bg-red-950/60 dark:text-red-300 ml-1">
                B2B
              </span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Register Your Travel Agency
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Get instant access to nationwide bus inventory, live seat locks, and authoritative B2B commissions.
          </p>
        </div>

        {/* Form container */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          {formError && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Section 1: Business Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Building2 className="h-4 w-4 text-[#D92D20]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Agency & Contact Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Agency / Business Name *"
                  placeholder="e.g. Orbit Travels Pvt Ltd"
                  startIcon={<Building2 className="h-4 w-4" />}
                  error={errors.businessName?.message}
                  {...register("businessName")}
                />
                <Input
                  label="Contact Person Name *"
                  placeholder="e.g. Rajesh Kumar"
                  startIcon={<User className="h-4 w-4" />}
                  error={errors.contactPersonName?.message}
                  {...register("contactPersonName")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Business Email Address *"
                  type="email"
                  placeholder="rajesh@orbittravels.com"
                  startIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Input
                  label="Mobile Number *"
                  placeholder="+91 9876543210"
                  startIcon={<Phone className="h-4 w-4" />}
                  error={errors.phone?.message}
                  {...register("phone")}
                />
              </div>

              <Input
                label="Account Password *"
                type="password"
                placeholder="At least 8 characters"
                startIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            {/* Section 2: Address Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <MapPin className="h-4 w-4 text-[#D92D20]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Location & Postal Address
                </h2>
              </div>

              <Input
                label="Registered Business Address *"
                placeholder="Shop 14, Main Commercial Complex, MG Road"
                error={errors.businessAddress?.message}
                {...register("businessAddress")}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="City *"
                  placeholder="e.g. Bengaluru"
                  error={errors.city?.message}
                  {...register("city")}
                />
                <Input
                  label="State *"
                  placeholder="e.g. Karnataka"
                  error={errors.state?.message}
                  {...register("state")}
                />
                <Input
                  label="Pincode"
                  placeholder="560001"
                  error={errors.pincode?.message}
                  {...register("pincode")}
                />
              </div>
            </div>

            {/* Section 3: Tax & Identification */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FileText className="h-4 w-4 text-[#D92D20]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Tax Identification (Optional for Initial Sign-up)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="GSTIN Number"
                  placeholder="29AAAAA0000A1Z5"
                  helperText="Required for tax invoicing & input credit"
                  error={errors.gstNumber?.message}
                  {...register("gstNumber")}
                />
                <Input
                  label="PAN Number"
                  placeholder="ABCDE1234F"
                  helperText="Business or Proprietor PAN"
                  error={errors.panNumber?.message}
                  {...register("panNumber")}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold shadow-lg shadow-red-600/20"
            >
              Complete Registration & Start Earning
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Already have an active agency account?{" "}
            <Link
              href="/sign-in"
              className="font-bold text-[#D92D20] hover:underline dark:text-red-400"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
