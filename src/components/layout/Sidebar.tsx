import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Package,
  Truck,
  Plane,
  Ship,
  Users,
  Phone,
  Menu,
  X,
  ChevronRight,
  User,
  LogIn,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Track Shipment", path: "/tracking", icon: Truck },
  { name: "Services", path: "/services", icon: Plane },
  { name: "About Us", path: "/about", icon: Users },
  { name: "Contact", path: "/contact", icon: Phone },
];

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav className="flex flex-col h-full py-8">
      {/* Logo - Text Based */}
      <Link
        to="/"
        className="flex items-center gap-3 px-6 mb-12"
        onClick={() => isMobile && setIsMobileOpen(false)}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
          <span className="text-lg font-black text-primary-foreground">CL</span>
        </div>
        <AnimatePresence>
          {(isExpanded || isMobile) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <span className="text-xl font-black text-foreground whitespace-nowrap tracking-tight">
                Chels<span className="text-primary">Logix</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-2 px-3">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                onClick={() => isMobile && setIsMobileOpen(false)}
                className={`
                  group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
                  ${active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {(isExpanded || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {(isExpanded || isMobile) && (
                  <ChevronRight
                    className={`w-4 h-4 ml-auto transition-transform ${
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    }`}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>

        {/* Account Link */}
        <div className="px-3 mb-4">
          <Link
            to={user ? "/dashboard" : "/auth"}
            onClick={() => isMobile && setIsMobileOpen(false)}
            className={`
              group flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive(user ? "/dashboard" : "/auth")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }
            `}
          >
            {user ? <User className="w-5 h-5 flex-shrink-0" /> : <LogIn className="w-5 h-5 flex-shrink-0" />}
            <AnimatePresence>
              {(isExpanded || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  {user ? "Dashboard" : "Sign In"}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Footer */}
        <div className="px-6 pt-6 border-t border-border/50">
          <AnimatePresence>
            {(isExpanded || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-muted-foreground"
              >
                <p>© 2026 ChelsLogix</p>
                <p className="mt-1">Global Logistics Solutions</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 280 : 80 }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className="hidden lg:flex fixed left-0 top-0 h-screen z-50 flex-col bg-transparent"
      >
        <div className="h-full glass-effect border-r border-border/30">
          <SidebarContent />
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-50 w-12 h-12 rounded-xl glass-effect flex items-center justify-center text-foreground border border-border/30"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-72 z-50 bg-card border-r border-border"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
