import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const NAV_ITEMS = [
  { to: '/dashboard',     icon: '▦',  label: 'Dashboard' },
  { to: '/transactions',  icon: '↕',  label: 'Transacciones' },
  { to: '/chat',          icon: '✦',  label: 'Chat IA' },
]

export default function Layout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-white/5 flex flex-col">
        {/* Brand */}
        <div className="px-6 py-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-purple-500">₿</span>
            <span className="text-xl font-bold text-white">Fintrac</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 font-medium'
                    : 'text-gray-300 hover:bg-dark-700'
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-white/5 p-4 space-y-4">
          <div className="flex items-center gap-3 px-4">
            {user?.user_metadata?.avatar_url && (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="avatar" 
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            title="Cerrar sesión"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
          >
            <span>⎋</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}