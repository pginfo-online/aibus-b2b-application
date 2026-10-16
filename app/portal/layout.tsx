import React from "react";
import { AgentShell } from "@/components/layout/agent-shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Agent Portal — AiBus B2B Bus Booking Platform",
  description: "Search buses, hold seats, manage bookings, top up wallet, and track commission earnings.",
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <AgentShell>{children}</AgentShell>;
}
