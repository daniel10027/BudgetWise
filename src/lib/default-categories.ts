export const DEFAULT_CATEGORIES = [
  { name: "Alimentation", type: "expense" as const, color: "#f97316", icon: "utensils", monthlyLimit: 0 },
  { name: "Logement", type: "expense" as const, color: "#6366f1", icon: "home", monthlyLimit: 0 },
  { name: "Transport", type: "expense" as const, color: "#0ea5e9", icon: "car", monthlyLimit: 0 },
  { name: "Santé", type: "expense" as const, color: "#ef4444", icon: "heart-pulse", monthlyLimit: 0 },
  { name: "Loisirs", type: "expense" as const, color: "#a855f7", icon: "gamepad-2", monthlyLimit: 0 },
  { name: "Éducation", type: "expense" as const, color: "#14b8a6", icon: "book-open", monthlyLimit: 0 },
  { name: "Factures", type: "expense" as const, color: "#eab308", icon: "receipt", monthlyLimit: 0 },
  { name: "Autres dépenses", type: "expense" as const, color: "#64748b", icon: "more-horizontal", monthlyLimit: 0 },
  { name: "Salaire", type: "income" as const, color: "#22c55e", icon: "briefcase", monthlyLimit: 0 },
  { name: "Freelance", type: "income" as const, color: "#10b981", icon: "laptop", monthlyLimit: 0 },
  { name: "Investissements", type: "income" as const, color: "#06b6d4", icon: "trending-up", monthlyLimit: 0 },
  { name: "Autres revenus", type: "income" as const, color: "#84cc16", icon: "plus-circle", monthlyLimit: 0 },
];
