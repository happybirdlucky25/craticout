import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {children}
    </div>
  );
}