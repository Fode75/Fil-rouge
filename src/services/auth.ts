// TODO: remplacer par l'authentification Supabase (supabase.auth.signInWithPassword)
export async function login(_email: string, _password: string): Promise<void> {
  throw new Error("La connexion n'est pas encore disponible : l'API n'est pas branchée.");
}

// TODO: remplacer par supabase.auth.signUp (le nom complet ira dans options.data)
export async function register(_name: string, _email: string, _password: string): Promise<void> {
  throw new Error("L'inscription n'est pas encore disponible : l'API n'est pas branchée.");
}