import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart";
import { money, stockLabel } from "@/lib/shop";

export function ProductCard({ product: p }: { product: Product }) {
  const { add } = useCart();
  const out = p.stock <= 0;

  return (
    <li className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <Link
        to="/product/$id"
        params={{ id: p.id }}
        className="block overflow-hidden"
        aria-label={`${p.name} এর বিস্তারিত দেখুন`}
      >
        <div className="relative">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            width={1024}
            height={1024}
            className={`aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
              out ? "opacity-60 grayscale" : ""
            }`}
          />
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${
              out
                ? "bg-destructive text-destructive-foreground"
                : p.stock <= 5
                  ? "bg-bark text-seed-foreground"
                  : "bg-card/90 text-foreground"
            }`}
          >
            {stockLabel(p.stock)}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg">
            <Link to="/product/$id" params={{ id: p.id }} className="hover:text-primary">
              {p.name}
            </Link>
          </h3>
          <span className="text-base font-semibold">{money(p.price)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {p.category} · {p.weight}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{p.blurb}</p>
        <ul className="mt-3 space-y-1 text-xs leading-relaxed text-foreground/70">
          {p.benefits.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-primary">•</span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" disabled={out} onClick={() => add(p)}>
            {out ? "স্টক আউট" : "ব্যাগে যোগ করুন"}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/product/$id" params={{ id: p.id }}>
              বিস্তারিত
            </Link>
          </Button>
        </div>
      </div>
    </li>
  );
}
