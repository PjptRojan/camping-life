/**
 * DashboardLayout.tsx
 * -----------------------------------------------------------------------------
 * The app shell: a sticky top navigation (brand, live cart badge, user profile)
 * plus a slot for page content. Reads the cart count straight from Redux so the
 * badge updates the instant any gear or service selection changes.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ShoppingCart, Tent, UserRound } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearCredentials } from "@/store/authSlice";
import { selectCartCount, selectUser } from "@/store/selectors";

interface DashboardLayoutProps {
  /** Page content rendered beneath the navigation bar. */
  children: ReactNode;
}

/** Global layout wrapper with the persistent navigation bar. */
export function DashboardLayout({
  children,
}: DashboardLayoutProps): JSX.Element {
  // Live counter — re-renders only when the derived count actually changes.
  const cartCount = useAppSelector(selectCartCount);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Open/close state for the user dropdown, plus a ref for click-outside.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking anywhere outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  /** Clear the session from Redux and bounce the user to sign-in. */
  const handleLogout = (): void => {
    dispatch(clearCredentials());
    setMenuOpen(false);
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <Tent className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-lg font-extrabold tracking-tight text-emerald-900">
                CamperLife
              </p>
              <p className="-mt-0.5 text-[11px] font-medium uppercase tracking-wider text-amber-600">
                Premium Outdoors
              </p>
            </div>
          </div>

          {/* Cart badge + user profile */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={`Cart: ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              className="relative rounded-xl border border-stone-200 p-2.5 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] animate-scale-in items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-white shadow">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Account menu"
                className="flex items-center gap-2.5 rounded-xl border border-stone-200 py-1.5 pl-1.5 pr-3 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.name ?? "Jordan Vale"}
                  </p>
                  <p className="-mt-0.5 text-xs text-slate-400">
                    {user?.email ?? "Gold Member"}
                  </p>
                </div>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-36 origin-top-right animate-scale-in overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
