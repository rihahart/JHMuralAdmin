import { NavLink, Outlet, useOutletContext } from "react-router-dom";
import { displayName, type AdminUser } from "@/features/auth";

interface Props {
  user: AdminUser;
  onSignOut: (message?: string) => void;
}

export interface OutletCtx {
  user: AdminUser;
  signOut: (message?: string) => void;
}

/** Access the signed-in user from any page rendered inside the Layout. */
export function useAdmin(): OutletCtx {
  return useOutletContext<OutletCtx>();
}

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/exhibitions", label: "Exhibitions", end: false },
];

export default function Layout({ user, onSignOut }: Props) {
  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <aside className="flex w-60 flex-col border-r border-neutral-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-neutral-200 p-5">
          <span className="text-lg font-bold">JH Mural Admin</span>
          <span className="truncate text-sm text-neutral-500" title={user.email}>
            {displayName(user)}
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-200 p-3">
          <button
            type="button"
            onClick={() => onSignOut()}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <Outlet context={{ user, signOut: onSignOut } satisfies OutletCtx} />
      </main>
    </div>
  );
}
