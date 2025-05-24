import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../globals.css";
import AdminNavbar from "./components/AdminNavbar";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard | Fraganote",
  description: "Admin dashboard for Fraganote perfume store",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${montserrat.variable} font-sans min-h-screen bg-gray-100`}>
      {/* Special cases for login page and error pages */}
      {/* For all other admin pages, include the navigation */}
      <AdminNavbar />
      
      {/* Main content */}
      <div className="flex min-h-screen">
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
} 