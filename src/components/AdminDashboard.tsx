import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LayoutDashboard, Users, Ticket, MapPin, ScrollText } from 'lucide-react';
import { api } from '../lib/api';

type Tab = 'overview' | 'users' | 'bookings' | 'destinations' | 'audit';

interface Props {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<{ users: number; bookings: number; favorites: number } | null>(null);
  const [users, setUsers] = useState<{ id: string; email: string; display_name: string; role: string; email_verified: number; created_at: string }[]>([]);
  const [bookings, setBookings] = useState<unknown[]>([]);
  const [destinations, setDestinations] = useState<
    { id: string; name: string; region: string; theme: string; budget: string; image: string; description: string; long_description: string; sort_order: number }[]
  >([]);
  const [logs, setLogs] = useState<unknown[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (t: Tab) => {
    setLoading(true);
    setErr(null);
    try {
      if (t === 'overview') {
        const s = await api<{ users: number; bookings: number; favorites: number }>('/admin/stats');
        setStats(s);
      }
      if (t === 'users') {
        const d = await api<{ users: typeof users }>('/admin/users');
        setUsers(d.users);
      }
      if (t === 'bookings') {
        const d = await api<{ bookings: unknown[] }>('/admin/bookings');
        setBookings(d.bookings);
      }
      if (t === 'destinations') {
        const d = await api<{ destinations: typeof destinations }>('/admin/destinations');
        setDestinations(d.destinations);
      }
      if (t === 'audit') {
        const d = await api<{ logs: unknown[] }>('/admin/audit');
        setLogs(d.logs);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const setRole = async (id: string, role: 'user' | 'admin') => {
    await api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) });
    load('users');
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user and related data?')) return;
    await api(`/admin/users/${id}`, { method: 'DELETE' });
    load('users');
  };

  const deleteDest = async (id: string) => {
    if (!confirm('Delete this destination?')) return;
    await api(`/admin/destinations/${encodeURIComponent(id)}`, { method: 'DELETE' });
    load('destinations');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-900 text-white">
            <div className="flex items-center gap-2 font-serif font-bold text-lg">
              <LayoutDashboard className="w-5 h-5 text-orange-400" />
              Admin dashboard
            </div>
            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 min-h-0">
            <nav className="w-52 border-r border-gray-100 bg-gray-50 p-3 flex flex-col gap-1 shrink-0">
              {(
                [
                  ['overview', 'Overview', LayoutDashboard],
                  ['users', 'Users', Users],
                  ['bookings', 'Bookings', Ticket],
                  ['destinations', 'Destinations', MapPin],
                  ['audit', 'Audit log', ScrollText],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-left ${
                    tab === id ? 'bg-orange-600 text-white' : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-y-auto p-6">
              {err && <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-xl border border-red-200">{err}</div>}
              {loading && <div className="text-gray-500">Loading…</div>}

              {!loading && tab === 'overview' && stats && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100">
                    <div className="text-sm text-orange-800 font-semibold">Users</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.users}</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                    <div className="text-sm text-blue-800 font-semibold">Bookings</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.bookings}</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
                    <div className="text-sm text-green-800 font-semibold">Favorites</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.favorites}</div>
                  </div>
                </div>
              )}

              {!loading && tab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-200">
                        <th className="pb-2 pr-4">Email</th>
                        <th className="pb-2 pr-4">Name</th>
                        <th className="pb-2 pr-4">Role</th>
                        <th className="pb-2 pr-4">Verified</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-mono text-xs">{u.email}</td>
                          <td className="py-2 pr-4">{u.display_name}</td>
                          <td className="py-2 pr-4">{u.role}</td>
                          <td className="py-2 pr-4">{u.email_verified ? 'Yes' : 'No'}</td>
                          <td className="py-2 flex flex-wrap gap-2">
                            <button type="button" className="text-xs font-bold text-orange-600" onClick={() => setRole(u.id, 'admin')}>
                              Make admin
                            </button>
                            <button type="button" className="text-xs font-bold text-gray-600" onClick={() => setRole(u.id, 'user')}>
                              Make user
                            </button>
                            <button type="button" className="text-xs font-bold text-red-600" onClick={() => deleteUser(u.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && tab === 'bookings' && (
                <div className="space-y-3 text-sm">
                  {(bookings as { id: string; email: string; item_json: string; payment_json: string; created_at: string }[]).map((b) => (
                    <div key={b.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                      <div className="font-mono text-xs text-gray-500">{b.id}</div>
                      <div className="font-semibold">{b.email}</div>
                      <div className="text-gray-600 mt-1">{new Date(b.created_at).toLocaleString()}</div>
                      <pre className="mt-2 text-xs overflow-x-auto bg-white p-2 rounded border border-gray-100">{JSON.stringify(JSON.parse(b.item_json), null, 2)}</pre>
                    </div>
                  ))}
                </div>
              )}

              {!loading && tab === 'destinations' && (
                <div className="space-y-4">
                  {destinations.map((d) => (
                    <div key={d.id} className="p-4 rounded-xl border border-gray-200 flex justify-between gap-4 items-start">
                      <div>
                        <div className="font-bold text-lg">{d.name}</div>
                        <div className="text-sm text-gray-600">
                          {d.region} • {d.theme} • {d.budget}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 font-mono">{d.id}</div>
                      </div>
                      <button type="button" className="text-red-600 font-bold text-sm shrink-0" onClick={() => deleteDest(d.id)}>
                        Delete
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">Add or edit destinations via API or future form — delete supported here.</p>
                </div>
              )}

              {!loading && tab === 'audit' && (
                <div className="space-y-2 text-xs font-mono max-h-[60vh] overflow-y-auto">
                  {(logs as { created_at: string; event_type: string; ip: string; details: string }[]).map((l) => (
                    <div key={l.created_at + l.event_type} className="p-2 border-b border-gray-100">
                      <span className="text-gray-500">{l.created_at}</span> <span className="font-bold">{l.event_type}</span> {l.ip}
                      {l.details && <div className="text-gray-600 truncate">{l.details}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
