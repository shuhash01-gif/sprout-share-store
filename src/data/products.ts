import pumpkin from "@/assets/p-pumpkin.jpg";
import sunflower from "@/assets/p-sunflower.jpg";
import almond from "@/assets/p-almond.jpg";
import cashew from "@/assets/p-cashew.jpg";
import flax from "@/assets/p-flax.jpg";
import sesame from "@/assets/p-sesame.jpg";
import raisin from "@/assets/p-raisin.jpg";
import dates from "@/assets/p-dates.jpg";

export type Category = "বীজ" | "বাদাম" | "শুকনো ফল";

export type Product = {
  id: string;
  name: string;
  blurb: string;
  benefits: string[];
  weight: string;
  price: number;
  category: Category;
  image: string;
};

export const categories: Category[] = ["বীজ", "বাদাম", "শুকনো ফল"];

export const products: Product[] = [
  {
    id: "pumpkin-seeds",
    name: "পাম্পকিন সিড",
    blurb: "ম্যাগনেসিয়াম ও অ্যান্টিঅক্সিডেন্টে ভরপুর কুমড়ার বীজ।",
    benefits: ["হার্টের স্বাস্থ্য ভালো রাখে", "প্রোস্টেট ফাংশনে সহায়ক"],
    weight: "২৫০ গ্রাম জার",
    price: 450,
    category: "বীজ",
    image: pumpkin,
  },
  {
    id: "sunflower-seeds",
    name: "সানফ্লাওয়ার সিড",
    blurb: "ভিটামিন-ই ও স্বাস্থ্যকর ফ্যাটে সমৃদ্ধ সূর্যমুখীর বীজ।",
    benefits: ["রোগ প্রতিরোধ ক্ষমতা বাড়ায়", "ত্বক ভালো রাখে"],
    weight: "২৫০ গ্রাম জার",
    price: 380,
    category: "বীজ",
    image: sunflower,
  },
  {
    id: "flax-seeds",
    name: "ফ্ল্যাক্স সিড",
    blurb: "ওমেগা-৩ ফ্যাটি অ্যাসিড ও ফাইবারে ভরপুর তিসির বীজ।",
    benefits: ["হজমে দারুণ সহায়ক", "ওজন নিয়ন্ত্রণে রাখে"],
    weight: "৩০০ গ্রাম জার",
    price: 320,
    category: "বীজ",
    image: flax,
  },
  {
    id: "sesame-seeds",
    name: "সিসেম সিড (তিল)",
    blurb: "ক্যালসিয়াম ও অ্যান্টিঅক্সিডেন্টে সমৃদ্ধ সাদা তিল।",
    benefits: ["হাড় মজবুত করে", "জয়েন্টের স্বাস্থ্যে সহায়ক"],
    weight: "৩০০ গ্রাম জার",
    price: 290,
    category: "বীজ",
    image: sesame,
  },
  {
    id: "almonds",
    name: "কাঠবাদাম",
    blurb: "প্রোটিন ও ফাইবারে ভরপুর প্রিমিয়াম কাঠবাদাম।",
    benefits: ["রক্তে সুগার নিয়ন্ত্রণে রাখে", "কোলেস্টেরল কমাতে সহায়ক"],
    weight: "৫০০ গ্রাম জার",
    price: 1150,
    category: "বাদাম",
    image: almond,
  },
  {
    id: "cashews",
    name: "কাজুবাদাম",
    blurb: "জিংক ও আয়রনের দারুণ উৎস, বাছাই করা কাজুবাদাম।",
    benefits: ["শরীরে এনার্জি জোগায়", "ব্রেন ফাংশন উন্নত করে"],
    weight: "৫০০ গ্রাম জার",
    price: 1350,
    category: "বাদাম",
    image: cashew,
  },
  {
    id: "raisins",
    name: "কিশমিশ",
    blurb: "প্রাকৃতিক এনার্জি বুস্টার, রসালো সোনালি কিশমিশ।",
    benefits: ["হজমে সহায়তা করে", "রক্তশূন্যতা মোকাবিলায় সহায়ক"],
    weight: "৫০০ গ্রাম জার",
    price: 520,
    category: "শুকনো ফল",
    image: raisin,
  },
  {
    id: "dates",
    name: "খেজুর",
    blurb: "প্রাকৃতিক মিষ্টতা ও ফাইবারে ভরপুর নরম খেজুর।",
    benefits: ["তাৎক্ষণিক এনার্জি দেয়", "সুগার নিয়ন্ত্রণে রাখতে সহায়ক"],
    weight: "৫০০ গ্রাম বক্স",
    price: 780,
    category: "শুকনো ফল",
    image: dates,
  },
];
