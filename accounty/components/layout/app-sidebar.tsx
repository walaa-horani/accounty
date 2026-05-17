"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  BookOpen,
  BarChart3,
  Settings,
  Receipt,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLAN_LABELS: Record<string, string> = {
  free_org: "Free",
  pro: "Pro",
  business: "Business",
};

type Plan = "free_org" | "pro" | "business";
const PLAN_PRIORITY: Record<Plan, number> = { free_org: 0, pro: 1, business: 2 };
const PLAN_BADGE: Record<Plan, string> = { free_org: "Free", pro: "Pro", business: "Business" };

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { title: "Chart of Accounts", href: "/dashboard/accounts", icon: BookOpen },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3, requiredPlan: "pro" as Plan },
  { title: "Receipt Scanner", href: "/dashboard/receipts", icon: Receipt, requiredPlan: "business" as Plan },
];

const bottomItems = [
  { title: "Members", href: "/dashboard/settings/members", icon: Users },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const billing = useQuery(api.billing.getOrgBilling);
  const plan = billing?.plan ?? "free_org";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full justify-start rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent",
            },
          }}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const locked =
                  item.requiredPlan &&
                  PLAN_PRIORITY[plan as Plan] < PLAN_PRIORITY[item.requiredPlan];
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      render={
                        <Link
                          href={item.href}
                          className={cn(
                            pathname === item.href && "font-medium",
                            locked && "opacity-60",
                          )}
                        />
                      }
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      {locked && item.requiredPlan && (
                        <Badge
                          variant="outline"
                          className="ml-auto text-[10px] px-1 py-0 h-4 group-data-[collapsible=icon]:hidden"
                        >
                          {PLAN_BADGE[item.requiredPlan]}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 space-y-2">
        <div className="group-data-[collapsible=icon]:hidden">
          <Link href="/dashboard/settings/billing">
            <Badge
              variant={plan === "business" ? "default" : "secondary"}
              className="w-full justify-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              {PLAN_LABELS[plan] ?? plan} Plan
            </Badge>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
          <div className="group-data-[collapsible=icon]:hidden min-w-0">
            <p className="text-sm font-medium leading-none truncate">Account</p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
