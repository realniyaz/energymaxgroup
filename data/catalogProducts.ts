export interface CatalogProduct {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  price: number;
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "prod-1",
    slug: "maxilin-superprobiotics-1-trillion-cfu-guava",
    title: "maXilin Guava Probiotic",
    subtitle: "20 Billion CFU live gut flora formula",
    category: "Probiotics",
    image: "/prod1.png",
    price: 9999,
  },
  {
    id: "prod-2",
    slug: "maxilin-superprobiotics-1-trillion-cfu-vanilla",
    title: "maXilin Vanilla Harmony",
    subtitle: "Clinical synbiotic mucosal defense blend",
    category: "Probiotics",
    image: "/prod2.png",
    price: 9999,
  },
  {
    id: "prod-3",
    slug: "maxilin-superprobiotics-1-trillion-cfu-green-apple",
    title: "maXilin Crisp Green Apple",
    subtitle: "High bio-availability antioxidant probiotic",
    category: "Immunity",
    image: "/prod3.png",
    price: 9999,
  },
  {
    id: "prod-4",
    slug: "maxilin-superprobiotics-1-trillion-cfu-passionfruit",
    title: "maXilin Passion Defense",
    subtitle: "High potency resilience & metabolic culture",
    category: "Probiotics",
    image: "/prod4.png",
    price: 9999,
  },
  {
    id: "prod-5",
    slug: "maxilin-superprobiotics-1-trillion-cfu-lemon",
    title: "maXilin Lemon Cleanse",
    subtitle: "Natural pH balance & daily detox stick",
    category: "Digestive Health",
    image: "/prod5.png",
    price: 9999,
  },
  {
    id: "prod-6",
    slug: "maxilin-superprobiotics-1-trillion-cfu-pineapple",
    title: "maXilin Pineapple Active",
    subtitle: "Active enzyme digestive matrix blend",
    category: "Enzyme Blends",
    image: "/prod6.png",
    price: 9999,
  },
];