import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, type RoomMateUser } from '../lib/api';

type AuthContextValue = { user: RoomMateUser | null; token: string | null; loading: boolean; setSession: (token: string, user: RoomMateUser) => void; logout: () => void; refreshUser: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('roommate_token'));
  const [user, setUser] = useState<RoomMateUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    if (!token) { setLoading(false); return; }
    api.me(token).then((profile) => { if (active) setUser(profile); })
      .catch(() => { localStorage.removeItem('roommate_token'); if (active) { setToken(null); setUser(null); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);
  const value = useMemo<AuthContextValue>(() => ({
    user, token, loading,
    setSession: (nextToken, nextUser) => { localStorage.setItem('roommate_token', nextToken); setToken(nextToken); setUser(nextUser); setLoading(false); },
    logout: () => { localStorage.removeItem('roommate_token'); setToken(null); setUser(null); },
    refreshUser: async () => { if (token) setUser(await api.me(token)); },
  }), [user, token, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value; }
