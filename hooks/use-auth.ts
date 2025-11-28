"use client"

import { useCallback } from "react"
import useSWR from "swr"

interface User {
  id: number
  email: string
  companyName: string
  plan: string
  qrLimit: number
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Not authenticated")
    return res.json()
  })

export function useAuth() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR<User>("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await mutate()
      return data
    },
    [mutate],
  )

  const register = useCallback(
    async (email: string, password: string, companyName: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, companyName }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await mutate()
      return data
    },
    [mutate],
  )

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    await mutate(undefined, { revalidate: false })
  }, [mutate])

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login,
    register,
    logout,
  }
}
