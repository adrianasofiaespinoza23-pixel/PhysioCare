import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  DollarSign,
  UserCog,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Settings,
  ChevronLeft,
  Activity,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Layout({
  children,
  currentView,
  onViewChange,
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);
  const [showMobileSidebar, setShowMobileSidebar] =
    useState(false);

  const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  { id: "patients", label: "Patients", icon: Users },
  {
    id: "appointments",
    label: "Appointments",
    icon: Calendar,
  },
  {
    id: "treatments",
    label: "Treatment Plans",
    icon: ClipboardList,
  },
  {
    id: "therapy-sessions",
    label: "Therapy Sessions",
    icon: Activity,
  },
  { id: "billing", label: "Billing", icon: DollarSign },
  { id: "staff", label: "Staff", icon: UserCog },
];
  return (
    <div className="flex h-screen overflow-hidden bg-accent">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } hidden md:flex flex-col bg-card border-r border-border transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#6f6ea7] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">PhysioCare</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setSidebarCollapsed(!sidebarCollapsed)
            }
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#7279a9] text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                } ${sidebarCollapsed ? "justify-center" : ""}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div
            className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}
          >
            <Avatar>
              <AvatarFallback className="bg-[#644790] text-white">
                DR
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Dr. 
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Administrator
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {showMobileSidebar && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setShowMobileSidebar(false)}
        >
          <aside
            className="w-64 h-full bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#217e6b] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold">
                  PhysioCare
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSidebar(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setShowMobileSidebar(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#217e6b] text-white"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients, appointments..."
                className="pl-9 w-64 lg:w-96"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-[#ef4444]">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}