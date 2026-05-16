import { TopBar } from "@/components/layout/top-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeftRight, BookOpen, TrendingUp, TrendingDown } from "lucide-react";

const stats = [
  {
    title: "Total Revenue",
    value: "$0.00",
    description: "This month",
    icon: TrendingUp,
    trend: "up",
  },
  {
    title: "Total Expenses",
    value: "$0.00",
    description: "This month",
    icon: TrendingDown,
    trend: "down",
  },
  {
    title: "Transactions",
    value: "0",
    description: "This month",
    icon: ArrowLeftRight,
    trend: "neutral",
  },
  {
    title: "Accounts",
    value: "0",
    description: "Active accounts",
    icon: BookOpen,
    trend: "neutral",
  },
];

export default function DashboardPage() {
  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription>{stat.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No transactions yet. Add your first transaction to get started.
              </p>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                More features coming soon.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
