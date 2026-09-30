"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "./authContext";
import { getProfile, logoutUser } from "@/services/auth.api";

function useMountEffect(fn) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fn(); }, []);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const data = await getProfile();
      const userData = data?.user !== undefined ? data.user : (data?._id ? data : null);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch {
      setUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  }, []);

  useMountEffect(() => { fetchUser(); });

  const info = useMemo(() => ({
    user,
    setUser,
    loading,
    fetchUser,
    logout,
  }), [user, loading, fetchUser, logout]);

  return (
    <AuthContext.Provider value={info}>
      {children}
    </AuthContext.Provider>
  );
}
