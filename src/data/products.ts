import mix1 from "@/assets/mix-1.jpg";
import mix2 from "@/assets/mix-2.jpg";
import mix3 from "@/assets/mix-3.jpg";
import mix4 from "@/assets/mix-4.jpg";
import mix5 from "@/assets/mix-5.jpg";
import mix6 from "@/assets/mix-6.jpg";

export type Category = "Snacking" | "Sprouting" | "Garden" | "Birds";

export type Product = {
  id: string;
  name: string;
  blurb: string;
  contents: string;
  weight: string;
  price: number;
  category: Category;
  image: string;
};

export const categories: Category[] = ["Snacking", "Sprouting", "Garden", "Birds"];

export const products: Product[] = [
  {
    id: "six-seed-daily",
    name: "Six Seed Daily",
    blurb: "Our everyday house blend — toasty, balanced, endlessly useful.",
    contents: "Sunflower, pumpkin, flax, sesame, hemp, chia",
    weight: "500 g pouch",
    price: 14,
    category: "Snacking",
    image: mix1,
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    blurb: "Big, buttery kernels lightly toasted with sea salt.",
    contents: "Sunflower, pumpkin, golden flax",
    weight: "400 g pouch",
    price: 12,
    category: "Snacking",
    image: mix2,
  },
  {
    id: "tiny-three",
    name: "Tiny Three",
    blurb: "Micro seeds for smoothies, porridge and stirring into dough.",
    contents: "Chia, brown flax, poppy",
    weight: "350 g pouch",
    price: 11,
    category: "Snacking",
    image: mix3,
  },
  {
    id: "jar-sprouter",
    name: "Jar Sprouter",
    blurb: "Untreated sprouting seed that wakes up in three days flat.",
    contents: "Alfalfa, radish, broccoli, clover",
    weight: "250 g tin",
    price: 16,
    category: "Sprouting",
    image: mix4,
  },
  {
    id: "dooryard-birds",
    name: "Dooryard Birds",
    blurb: "No filler, no milo — a mix songbirds actually finish.",
    contents: "Black oil sunflower, white millet, cracked corn, safflower",
    weight: "2 kg sack",
    price: 22,
    category: "Birds",
    image: mix5,
  },
  {
    id: "kitchen-garden",
    name: "Kitchen Garden",
    blurb: "Open-pollinated heirlooms for a season of picking.",
    contents: "Tomato, squash, bush bean, basil, radish",
    weight: "5 packet set",
    price: 19,
    category: "Garden",
    image: mix6,
  },
];
