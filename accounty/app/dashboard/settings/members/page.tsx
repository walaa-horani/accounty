"use client";

import { useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TopBar } from "@/components/layout/top-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import Link from "next/link";

const SEAT_LIMITS: Record<string, number> = {
  free_org: 1,
  pro: 3,
  business: 5,
};

const PLAN_LABELS: Record<string, string> = {
  free_org: "Free",
  pro: "Pro",
  business: "Business",
};

const ROLE_LABELS: Record<string, string> = {
  "org:admin": "Admin",
  "org:accountant": "Accountant",
  "org:viewer": "Viewer",
};

export default function MembersPage() {
  const { organization, memberships } = useOrganization({
    memberships: { pageSize: 50, keepPreviousData: true },
  });
  const billing = useQuery(api.billing.getOrgBilling);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("org:viewer");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const plan = billing?.plan ?? "free_org";
  const seatLimit = SEAT_LIMITS[plan] ?? 1;
  const memberCount = organization?.membersCount ?? 0;
  const atLimit = memberCount >= seatLimit;

  async function handleInvite() {
    if (!organization || !email.trim()) return;
    setInviting(true);
    setError("");
    setSuccess(false);
    try {
      await organization.inviteMember({ emailAddress: email.trim(), role });
      setEmail("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite.");
    } finally {
      setInviting(false);
    }
  }

  return (
    <>
      <TopBar title="Members" />
      <main className="flex-1 p-4 md:p-6 max-w-2xl space-y-6">
        {/* Seat usage */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-4" />
                Seat Usage
              </CardTitle>
              <Badge variant={atLimit ? "destructive" : "secondary"}>
                {memberCount} / {seatLimit} seats
              </Badge>
            </div>
            <CardDescription>
              {PLAN_LABELS[plan]} plan ·{" "}
              {atLimit
                ? "Seat limit reached."
                : `${seatLimit - memberCount} seat${seatLimit - memberCount === 1 ? "" : "s"} remaining.`}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Invite form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite Member</CardTitle>
            <CardDescription>Send an invitation by email address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {atLimit ? (
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached the {seatLimit}-seat limit on the{" "}
                {PLAN_LABELS[plan]} plan.{" "}
                <Link
                  href="/dashboard/settings/billing"
                  className="underline hover:no-underline"
                >
                  Upgrade your plan
                </Link>{" "}
                to invite more members.
              </p>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSuccess(false);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(v) => v && setRole(v)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="org:admin">Admin</SelectItem>
                      <SelectItem value="org:accountant">Accountant</SelectItem>
                      <SelectItem value="org:viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && (
                  <p className="text-sm text-emerald-600">Invite sent successfully.</p>
                )}
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !email.trim()}
                  className="w-full"
                >
                  {inviting ? "Sending…" : "Send Invite"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Member list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Members</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!memberships?.data && (
              <p className="text-sm text-muted-foreground px-4 py-3">Loading…</p>
            )}
            {memberships?.data?.length === 0 && (
              <p className="text-sm text-muted-foreground px-4 py-3">No members found.</p>
            )}
            {memberships?.data?.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3 border-b last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {m.publicUserData?.firstName} {m.publicUserData?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.publicUserData?.identifier}
                  </p>
                </div>
                <Badge variant="outline" className="ml-4 shrink-0">
                  {ROLE_LABELS[m.role] ?? m.role}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
