export const ROUTES = {
  home: "/",
  donation: "/criteres-de-don",
  info: "/infos-pratiques",
  items: "/objets",
  workshops: "/ateliers",
  workshop: (id: string) => `/ateliers/${id}`,
  login: "/connexion",
  register: "/inscription",
  unsubscribe: "/desinscription/:token",
  forbidden: "/403",
  me: "/espace-personnel",
  planning: "/espace-personnel/planning",
  registrations: "/espace-personnel/inscriptions",
  profile: "/espace-personnel/profil",
  shifts: "/espace-personnel/permanences",
} as const;

