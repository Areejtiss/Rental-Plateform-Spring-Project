// Villes tunisiennes (gouvernorats principaux)
export const TUNISIAN_CITIES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Hammamet",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Sfax",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kebili",
  "Djerba",
];

// Emoji par catégorie (fallback générique)
export const CATEGORY_ICONS = {
  "Power Tools": "🔧",
  "Garden": "🌳",
  "Camping": "⛺",
  "Sports": "🏀",
  "Music": "🎸",
  "Cooking": "🍳",
};

export function categoryIcon(name) {
  return CATEGORY_ICONS[name] || "📦";
}
