"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bus, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { NormalizedApiError } from "@/lib/error-normalizer";
import type { AgentOrganization, AuthTokens, UserProfile } from "@/types/api";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

interface LoginResponseData {
  user: UserProfile;
  tokens: AuthTokens;
}

export default function SignInPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await api.post<LoginResponseData>("/auth/login", data, { skipAuth: true });

      if (response && response.user && response.tokens) {
        // Fetch agent organization context if user has an agent profile
        let agentOrg: AgentOrganization | null = null;
        try {
          const agentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009/api/v1"}/agents/profile`, {
            headers: { Authorization: `Bearer ${response.tokens.accessToken}` },
          });
          if (agentRes.ok) {
            const agentJson = await agentRes.json();
            if (agentJson.success && agentJson.data) {
              agentOrg = agentJson.data;
            }
          }
        } catch {}

        setAuth({
          user: response.user,
          tokens: response.tokens,
          agent: agentOrg,
        });

        toast.success(`Welcome back, ${response.user.firstName || "Agent"}!`);
        router.push("/portal");
      } else {
        throw new Error("Invalid response from authentication server");
      }
    } catch (err) {
      if (err instanceof NormalizedApiError) {
        setFormError(err.localizedMessage.en);
        toast.error(err.localizedMessage.en);
      } else if (err instanceof Error) {
        setFormError(err.message);
        toast.error(err.message);
      } else {
        setFormError("Failed to sign in. Please verify your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
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
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Agent Sign In
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access real-time bus inventory, wallet ticketing & earnings
          </p>
        </div>

        {/* Card form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-5">
          {formError && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Agent Email Address"
              type="email"
              placeholder="agent@agency.com"
              startIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              startIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold shadow-md shadow-red-600/20 mt-2"
            >
              Sign In to Agent Portal
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Don&apos;t have an agency account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-[#D92D20] hover:underline dark:text-red-400"
            >
              Register your Agency
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400">
          <Link href="/" className="hover:underline">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
