"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  MessagesSquare, 
  Users, 
  Trophy, 
  Settings, 
  CheckSquare, 
  HandHeart, 
  Calendar,
  MessageCircle,
  Video,
  Hash,
  FolderKanban,
  Menu,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarItems = [
  {
    title: "Messages",
    icon: MessageCircle,
    href: "/dashboard/messages",
  },
  {
    title: "Channels",
    icon: Hash,
    href: "/dashboard/channels",
  },
  {
    title: "Meetings",
    icon: Video,
    href: "/dashboard/meetings",
  },
  {
    title: "Projects",
    icon: FolderKanban,
    href: "/dashboard/projects",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    href: "/dashboard/tasks",
  },
  {
    title: "Schedule",
    icon: Calendar,
    href: "/dashboard/schedule",
  },
  {
    title: "Volunteer",
    icon: HandHeart,
    href: "/dashboard/volunteer",
  },
  {
    title: "Members",
    icon: Users,
    href: "/dashboard/members",
  },
  {
    title: "Training",
    icon: BookOpen,
    href: "/dashboard/training",
  },
  {
    title: "Achievements",
    icon: Trophy,
    href: "/dashboard/achievements",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col space-y-2">
      {sidebarItems.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "justify-start transition-all duration-200",
            pathname === item.href && "bg-accent",
            isCollapsed ? "w-10 px-2" : "w-full px-4"
          )}
          asChild
          onClick={() => setIsMobileOpen(false)}
        >
          <Link href={item.href}>
            <item.icon className={cn(
              "h-5 w-5",
              !isCollapsed && "mr-3"
            )} />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        </Button>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="h-14">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-14 border-b px-4 flex items-center">
            <MessagesSquare className="h-6 w-6" />
            <span className="ml-2 font-semibold">Delegate</span>
          </div>
          <nav className="flex-1 p-2">
            <SidebarContent />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex border-r flex-col transition-all duration-200",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className={cn(
          "h-14 border-b px-4 flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center">
            <MessagesSquare className="h-6 w-6" />
            {!isCollapsed && <span className="ml-2 font-semibold">Delegate</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 p-2">
          <SidebarContent />
        </nav>
      </aside>
    </>
  );
}