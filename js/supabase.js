/* ============================================================
 * Street Doctor SG — Supabase client + auth session
 * Loaded before data.js. Exposes:
 *   SB      — the Supabase client
 *   Session — { user, profile } for the signed-in user (null when logged out)
 *   Auth    — sign up / in / out helpers + role check
 * The publishable (anon) key is safe to ship in the browser; access is
 * controlled by Row Level Security in the database, not by hiding this key.
 * ============================================================ */
const SUPABASE_URL = "https://wpojjnuuuwqnkgrcwjlo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_N-qrrcA9ZVJCTRP572ROgg_vrAsT_L6";

const SB = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Current signed-in user + their profile (display name + role). Read by DB.
const Session = { user: null, profile: null };

const Auth = {
  // Load the current session + profile into Session (call at startup / on change).
  async refresh() {
    const { data } = await SB.auth.getSession();
    const session = data ? data.session : null;
    Session.user = session ? session.user : null;
    Session.profile = null;
    if (Session.user) {
      const { data: prof } = await SB.from("profiles")
        .select("id,display_name,role").eq("id", Session.user.id).single();
      Session.profile = prof || { id: Session.user.id, display_name: Session.user.email, role: "user" };
    }
  },
  async signUp(email, password, displayName) {
    return SB.auth.signUp({ email, password, options: { data: { display_name: (displayName || "").trim() } } });
  },
  async signIn(email, password) {
    return SB.auth.signInWithPassword({ email, password });
  },
  async signOut() { await SB.auth.signOut(); },

  isLoggedIn() { return !!Session.user; },
  isModerator() { return Session.profile && Session.profile.role === "moderator"; },
  displayName() {
    return (Session.profile && Session.profile.display_name) || (Session.user && Session.user.email) || "You";
  },
  email() { return Session.user ? Session.user.email : null; },
};
