import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { login as apiLogin, getProfile, type LoginPayload, type UserProfile } from '@/api/auth';

const TOKEN_KEY = 'auth_token';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  // login 已返回 user，跳过紧随其后的 effect 中冗余的 getProfile
  const skipProfileRef = useRef(false);

  useEffect(() => {
    // 监听 client 401 拦截器派发的事件，token 失效时立即清空本地态
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 无 token 直接结束加载态
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    // login 刚刚已设置 user，避免紧接一次冗余 getProfile：用 skip 标志跳过本轮
    if (skipProfileRef.current) {
      skipProfileRef.current = false;
      setLoading(false);
      return;
    }
    setLoading(true);

    getProfile()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        if (!cancelled) {
          try { localStorage.removeItem(TOKEN_KEY); } catch { /* localStorage 不可用时忽略 */ }
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await apiLogin(payload);
    skipProfileRef.current = true;
    try { localStorage.setItem(TOKEN_KEY, res.accessToken); } catch { /* localStorage 不可用时忽略 */ }
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* localStorage 不可用时忽略 */ }
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 已移除冗余：login 直接设置 user，effect 通过 skipProfileRef 跳过额外 getProfile
// eslint-disable-next-line react-refresh/only-export-components -- 与 AuthProvider 同文件导出 hook，便于统一管理
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
