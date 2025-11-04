"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  LayoutDashboard,
  Menu,
  Settings,
  Wallet,
  CalendarCheck,
  Clock,
  Target,
  LineChart,
  GitMerge,
  Home,
  ChevronsLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/logo";
import { cn } from "@/lib/utils";
import { MotivationalHeader } from "./components/motivational-header";
import useLocalStorage from "@/hooks/use-local-storage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = { href: string; icon: React.ElementType; label: string };
type NavGroup = { title: string; items: NavItem[] };

const navItems: (NavItem | NavGroup)[] = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    title: "Planning",
    items: [
      { href: "/goals", icon: Target, label: "Goals" },
      { href: "/routine", icon: CalendarCheck, label: "Routine" },
      { href: "/roadmap", icon: GitMerge, label: "Roadmap" },
    ],
  },
  {
    title: "Tracking",
    items: [
      { href: "/applications", icon: Briefcase, label: "Applications" },
      { href: "/finances", icon: Wallet, label: "Finances" },
      { href: "/time-management", icon: Clock, label: "Time Management" },
      { href: "/performance", icon: LineChart, label: "Performance" },
    ],
  },
  {
    title: "General",
    items: [{ href: "/settings", icon: Settings, label: "Settings" }],
  },
];

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defer rendering until mounted to avoid React hydration errors between
  // server (no localStorage) and client (localStorage-driven UI state).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Schedule setting mounted asynchronously to avoid calling setState
    // synchronously within the effect body which can trigger cascading renders.
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const pathname = usePathname();
  // Auth: Show placeholder avatar by default; integrate provider when ready
  // Placeholder user data (auth not wired in production yet)
  const user = null as null;
  const [isCollapsed, setIsCollapsed] = useLocalStorage(
    "sidebarCollapsed",
    false
  );

  const NavLink = ({ href, icon: Icon, label }: NavItem) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === href && "bg-secondary text-primary",
            isCollapsed && "justify-center"
          )}
        >
          <Icon className="h-4 w-4" />
          <span className={cn("truncate", isCollapsed && "hidden")}>
            {label}
          </span>
        </Link>
      </TooltipTrigger>
      {isCollapsed && (
        <TooltipContent side="right">
          <p>{label}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );

  const sidebarContent = (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <div className="space-y-2">
        {navItems.map((item, index) => {
          if ("title" in item) {
            // It's a NavGroup
            return (
              <div key={item.title}>
                <h3
                  className={cn(
                    "mb-2 mt-4 px-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider",
                    isCollapsed && "hidden"
                  )}
                >
                  {item.title}
                </h3>
                <div className="space-y-1">
                  {item.items.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </div>
              </div>
            );
          }
          // It's a standalone NavItem
          return <NavLink key={item.href} {...item} />;
        })}
      </div>
    </nav>
  );

  if (!mounted) {
    // Render a minimal, markup-stable shell during SSR to prevent hydration
    // mismatches caused by client-only state (localStorage, media queries, etc).
    return (
      <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card md:block" />
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background-alt">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid min-h-screen w-full transition-[grid-template-columns] duration-300",
        isCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[280px_1fr]"
      )}
    >
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2 relative">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/home"
              className="flex items-center gap-2 font-semibold"
            >
              <Logo isCollapsed={isCollapsed} />
            </Link>
          </div>
          <TooltipProvider>
            <div className="flex-1 mt-4 overflow-y-auto">{sidebarContent}</div>
          </TooltipProvider>
          <div className="mt-auto p-4 border-t">
            <Button
              variant="ghost"
              size="icon"
              className="w-full justify-center"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronsLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/home">
                  <Logo />
                </Link>
              </div>
              <TooltipProvider>
                <div className="mt-4">{sidebarContent}</div>
              </TooltipProvider>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <MotivationalHeader />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage
                    src="https://picsum.photos/seed/user/100/100"
                    alt="User"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/auth/logout">Logout</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background-alt">
          {children}
        </main>
      </div>
    </div>
  );
}
