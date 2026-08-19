import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, ShieldCheck, Truck } from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { products } from "@/data/products";
import { useCart } from "@/lib/cart";
import { bn, DELIVERY_TIME, FREE_SHIPPING, money, stockLabel } from "@/lib/shop";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "পণ্য পাওয়া যায়নি — Healthio" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — ${product.weight} | Healthio`;
    const description = `${product.blurb} ${product.benefits.join("। ")}। ক্যাশ অন ডেলিভারিতে অর্ডার করুন Healthio থেকে।`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const out = product.stock <= 0;
  const others = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          সব পণ্যে ফিরে যান
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <img
            src={product.image}
            alt={product.name}
            width={1024}
            height={1024}
            className="aspect-square w-full rounded-sm border border-border object-cover"
          />

          <div>
            <p className="label-caps text-muted-foreground">{product.category}</p>
            <h1 className="mt-2 text-3xl md:text-4xl">{product.name}</h1>
            <p className="mt-3 text-2xl font-semibold">{money(product.price)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{product.weight}</p>

            <span
              className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                out
                  ? "bg-destructive text-destructive-foreground"
                  : product.stock <= 5
                    ? "bg-bark text-seed-foreground"
                    : "bg-secondary text-foreground"
              }`}
            >
              {stockLabel(product.stock)}
            </span>

            <p className="mt-5 text-sm text-muted-foreground">{product.blurb}</p>

            <h2 className="mt-6 text-base">উপকারিতা</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
              {product.benefits.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {b}
                </li>
              ))}
            </ul>

            <Separator className="my-6" />

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-sm border border-border p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="পরিমাণ কমান"
                  disabled={out || qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="w-8 text-center text-sm">{bn(qty)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="পরিমাণ বাড়ান"
                  disabled={out || qty >= product.stock}
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
              <Button size="lg" disabled={out} onClick={() => add(product, qty)}>
                {out ? "স্টক আউট" : `ব্যাগে যোগ করুন · ${money(product.price * qty)}`}
              </Button>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Truck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {money(FREE_SHIPPING)} টাকার বেশি অর্ডারে ডেলিভারি ফ্রি · {DELIVERY_TIME}
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে টাকা দিন
              </li>
            </ul>
          </div>
        </div>

        <section className="mt-20">
          <h2 className="text-2xl">আরও পণ্য</h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
