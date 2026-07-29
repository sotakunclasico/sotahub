"use client";

import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await signOut({ redirectTo: "/" });
  }

  return <Button type="button" variant="secondary" onClick={logout} disabled={loading}>
    {loading ? <LoaderCircle className="animate-spin" size={16}/> : <LogOut size={16}/>}
    {loading ? "Cerrando sesión…" : "Cerrar sesión"}
  </Button>;
}
