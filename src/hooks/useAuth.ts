import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  display_name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = async (userId: string, email?: string) => {
    // First try to fetch existing profile
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("id", userId)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
    } else if (email) {
      // Profile doesn't exist (user created before profiles table), create one
      const displayName = email.split("@")[0].split(/[._-]/)[0];
      const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
      
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ id: userId, display_name: capitalizedName })
        .select("id, display_name")
        .single();
      
      if (newProfile) {
        setProfile(newProfile);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch profile after auth state change
        if (session?.user) {
          setTimeout(() => {
            fetchOrCreateProfile(session.user.id, session.user.email);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        fetchOrCreateProfile(session.user.id, session.user.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setProfile(null);
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
