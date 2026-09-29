"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Home,
  Zap,
  Wrench,
  Car,
  Utensils,
  MoreHorizontal,
  Wallet,
  ReceiptText,
  Calculator,
  Trophy,
} from "lucide-react";
import { formatDateYearMonth, formatRupee, money } from "../../lib/utils";
import { ExpenseDashboardData } from "@/types/expenses-types";
import { Badge } from "@/components/ui/badge";

const CATEGORY_CONFIG: Record<
  string,
  {
    color: string;
    title: string;
    icon: React.ReactNode;
    bgcolor: string;
    textcolor: string;
    iconcolor: string;
    progressbar: string;
  }
> = {
  rent: {
    color: "bg-red-500",
    bgcolor: "bg-red-50",
    textcolor: "text-red-900",
    iconcolor: "text-red-600",
    progressbar: "bg-red-500",
    title: "Rent",
    icon: <Home className="size-4" />,
  },
  utilities: {
    color: "bg-emerald-500",
    bgcolor: "bg-emerald-50",
    textcolor: "text-emerald-900",
    iconcolor: "text-emerald-600",
    progressbar: "bg-emerald-500",
    title: "Utilities",
    icon: <Zap className="size-4" />,
  },
  maintenance: {
    color: "bg-amber-500",
    bgcolor: "bg-amber-50",
    textcolor: "text-amber-900",
    iconcolor: "text-amber-600",
    progressbar: "bg-amber-500",
    title: "Repair & Maintenance",
    icon: <Wrench className="size-4" />,
  },
  fuel: {
    color: "bg-blue-500",
    bgcolor: "bg-blue-50",
    textcolor: "text-blue-900",
    iconcolor: "text-blue-600",
    progressbar: "bg-blue-500",
    title: "Fuel",
    icon: <Car className="size-4" />,
  },
  food: {
    color: "bg-purple-500",
    bgcolor: "bg-purple-50",
    textcolor: "text-purple-900",
    iconcolor: "text-purple-600",
    progressbar: "bg-purple-500",
    title: "Food",
    icon: <Utensils className="size-4" />,
  },
  other: {
    color: "bg-slate-500",
    bgcolor: "bg-slate-50",
    textcolor: "text-slate-900",
    iconcolor: "text-slate-600",
    progressbar: "bg-slate-500",
    title: "Others",
    icon: <MoreHorizontal className="size-4" />,
  },
};

export function ExpenseDashboardStats({
  dashboardData,
}: {
  dashboardData: ExpenseDashboardData;
}) {
  const { categoryRows, total, date, expenseCount } = dashboardData;
  const totalNum = Number(total) || 0;

  const withShare = categoryRows.map((item) => ({
    ...item,
    share: totalNum > 0 ? (Number(item.total) / totalNum) * 100 : 0,
  }));
  const sorted = [...withShare].sort((a, b) => b.share - a.share);
  const topCategory = sorted[0];
  const avgPerExpense = expenseCount > 0 ? totalNum / Number(expenseCount) : 0;

  return (
    <div className="grid gap-3">
      {/* Bento grid: hero totals + category stats, full-width cover */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Hero — total metrics */}
        <Card className="border-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-white/10 p-2">
                  <Wallet className="size-4 text-white" />
                </div>
                <CardTitle className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
                  Total Expenses
                </CardTitle>
              </div>
              <Badge className="border-0 bg-white/10 text-[11px] text-white">
                {formatDateYearMonth(date)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="text-3xl font-bold tracking-tight sm:text-4xl">
              {formatRupee(totalNum)}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ReceiptText className="size-3.5" />
                  Transactions
                </div>
                <div className="mt-1 text-lg font-bold">{expenseCount}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Calculator className="size-3.5" />
                  Avg / expense
                </div>
                <div className="mt-1 text-lg font-bold">
                  {formatRupee(money(avgPerExpense))}
                </div>
              </div>
            </div>

            {sorted.length > 0 && (
              <div className="grid gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                  <Trophy className="size-3.5" />
                  Top spending
                </div>
                {sorted.slice(0, 3).map((item) => {
                  const config = CATEGORY_CONFIG[item.category];
                  if (!config) return null;
                  return (
                    <div key={item.category} className="grid gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">
                          {config.title}
                        </span>
                        <span className="text-slate-400">
                          {formatRupee(item.total)} · {item.share.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          style={{ width: `${item.share}%` }}
                          className={cn(
                            config.progressbar,
                            "h-full rounded-full transition-all",
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category bento tiles */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:col-span-8">
          {withShare.map((item) => {
            const config = CATEGORY_CONFIG[item.category];
            if (!config) return null;
            const isTop = topCategory?.category === item.category;

            return (
              <Card
                key={item.category}
                size="sm"
                className={cn(
                  "border-0 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md",
                  config.bgcolor,
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-1">
                    <div
                      className={cn(
                        "rounded-lg bg-white/70 p-1.5",
                        config.iconcolor,
                      )}
                    >
                      {config.icon}
                    </div>
                    <div className="flex items-center gap-1">
                      {isTop && (
                        <Badge
                          className={cn(
                            "border-0 px-1.5 py-0 text-[10px]",
                            config.progressbar,
                            "text-white",
                          )}
                        >
                          Top
                        </Badge>
                      )}
                      <Badge
                        className={cn(
                          "border-0 bg-white/80 px-1.5 py-0 text-[10px]",
                          config.textcolor,
                        )}
                      >
                        {item.share.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <CardTitle
                    className={cn(
                      "text-[11px] font-semibold tracking-wide uppercase opacity-70",
                      config.textcolor,
                    )}
                  >
                    {config.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1.5">
                  <div className={cn("text-lg font-bold", config.textcolor)}>
                    {formatRupee(item.total)}
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                    <div
                      style={{ width: `${item.share}%` }}
                      className={cn(
                        config.progressbar,
                        "h-full rounded-full transition-all",
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
