import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Leaf, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import heroSeeds from "@/assets/hero-seeds.jpg";
import { categories, products, type Category } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fieldnote Seed Co. — Small-Batch Seed Mixes" },
      {
        name: "description",
        content:
          "Six small-batch seed mixes for snacking, sprouting, gardening and backyard birds. Milled fresh, packed in Vermont, shipped within two days.",
      },
      { property: "og:title", content: "Fieldnote Seed Co. — Small-Batch Seed Mixes" },
      {
        property: "og:description",
        content:
          "Browse and order small-batch seed mixes for snacking, sprouting, gardening and backyard birds.",
      },
    ],
  }),
  component: Storefront,
});

const orderSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  address: z.string().trim().min(10, "Please enter a full shipping address").max(300),
  notes: z.string().trim().max(500).optional(),
});

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents);

function Storefront() {
  const [filter, setFilter] = useState<Category | "All">("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visible = useMemo(
    () => (filter === "All" ? products : products.filter((p) => p.category === filter)),
    [filter],
  );

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
        .filter((l) => l.product),
    [cart],
  );

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
  const shipping = count === 0 || subtotal >= 50 ? 0 : 6;

  const add = (id: string, name: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    toast.success(`${name} added to your basket`);
  };

  const setQty = (id: string, qty: number) =>
    setCart((c) => {
      if (qty <= 0) {
        const { [id]: _drop, ...rest } = c;
        return rest;
      }
      return { ...c, [id]: qty };
    });

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = orderSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setCart({});
    setForm({ name: "", email: "", address: "", notes: "" });
    setCartOpen(false);
    toast.success("Order placed — we'll email your packing slip shortly.");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="#top" className="flex items-center gap-2">
            <Leaf className="size-5 text-primary" aria-hidden="true" />
            <span className="font-display text-lg font-semibold tracking-tight">
              Fieldnote Seed Co.
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#catalog" className="transition-colors hover:text-foreground">
              Catalog
            </a>
            <a href="#order" className="transition-colors hover:text-foreground">
              Order
            </a>
          </nav>
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ShoppingBasket className="size-4" aria-hidden="true" />
                Basket
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {count}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="font-display text-xl">Your basket</SheetTitle>
                <SheetDescription>
                  Free shipping on orders over {money(50)}.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-4">
                {lines.length === 0 ? (
                  <p className="py-10 text-sm text-muted-foreground">
                    Nothing here yet. Pick a mix from the catalog.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {lines.map(({ product, qty }) => (
                      <li key={product.id} className="flex gap-3 py-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          width={800}
                          height={800}
                          className="size-16 shrink-0 rounded-sm object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.weight}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-7"
                              aria-label={`Decrease ${product.name}`}
                              onClick={() => setQty(product.id, qty - 1)}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{qty}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-7"
                              aria-label={`Increase ${product.name}`}
                              onClick={() => setQty(product.id, qty + 1)}
                            >
                              <Plus className="size-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground"
                              aria-label={`Remove ${product.name}`}
                              onClick={() => setQty(product.id, 0)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">{money(product.price * qty)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border-t border-border bg-secondary/50 p-4">
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd>{money(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd>{shipping === 0 ? "Free" : money(shipping)}</dd>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-semibold">
                    <dt>Total</dt>
                    <dd>{money(subtotal + shipping)}</dd>
                  </div>
                </dl>
                <Button
                  className="mt-4 w-full"
                  disabled={lines.length === 0}
                  onClick={() => {
                    setCartOpen(false);
                    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Continue to order details
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-border">
          <img
            src={heroSeeds}
            alt="Assorted seed mixes in linen sacks on a wooden table"
            width={1600}
            height={1104}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-bark/70" />
          <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
            <p className="label-caps text-husk">Small batch · Vermont</p>
            <h1 className="mt-4 max-w-2xl text-4xl leading-[1.05] text-seed-foreground md:text-6xl">
              Seed mixes blended by the pound, not the pallet.
            </h1>
            <p className="mt-5 max-w-xl text-base text-husk md:text-lg">
              Six honest blends for snacking, sprouting, the vegetable bed and the birds
              outside the window. Milled to order and shipped within two days.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                className="gap-2"
                onClick={() =>
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Browse the catalog
              </Button>
            </div>
          </div>
        </section>

        <section id="catalog" className="paper mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-caps text-muted-foreground">The catalog</p>
              <h2 className="mt-2 text-3xl md:text-4xl">Six mixes, nothing filler</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["All", ...categories] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    filter === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <li
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-shadow hover:shadow-lift"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg">{p.name}</h3>
                    <span className="text-base font-semibold">{money(p.price)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.category} · {p.weight}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">{p.blurb}</p>
                  <p className="mt-3 text-xs leading-relaxed text-foreground/70">{p.contents}</p>
                  <Button
                    variant="secondary"
                    className="mt-5 w-full"
                    onClick={() => add(p.id, p.name)}
                  >
                    Add to basket
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="order" className="scroll-mt-20 border-t border-border bg-secondary/40">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="label-caps text-muted-foreground">Place your order</p>
              <h2 className="mt-2 text-3xl md:text-4xl">Tell us where it's going</h2>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                We blend and pack the morning after your order lands, then send tracking by
                email. Orders over {money(50)} ship free anywhere in the continental US.
              </p>

              <div className="mt-8 rounded-sm border border-border bg-card p-5">
                <h3 className="text-base">Order summary</h3>
                {lines.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Your basket is empty — add a mix from the catalog above.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm">
                    {lines.map(({ product, qty }) => (
                      <li key={product.id} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                          {qty} × {product.name}
                        </span>
                        <span>{money(product.price * qty)}</span>
                      </li>
                    ))}
                    <Separator className="my-2" />
                    <li className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{money(subtotal + shipping)}</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <form onSubmit={placeOrder} className="rounded-sm border border-border bg-card p-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    maxLength={100}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors['name'] && <p className="text-xs text-destructive">{errors['name']}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    maxLength={255}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors['email'] && <p className="text-xs text-destructive">{errors['email']}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Shipping address</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={form.address}
                    maxLength={300}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                  {errors['address'] && <p className="text-xs text-destructive">{errors['address']}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    value={form.notes}
                    maxLength={500}
                    placeholder="Gift wrap, delivery instructions, grind preference…"
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={lines.length === 0}>
                  {lines.length === 0
                    ? "Add a mix to order"
                    : `Place order · ${money(subtotal + shipping)}`}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-sm text-muted-foreground">
          <span>Fieldnote Seed Co. · Montpelier, Vermont</span>
          <span>hello@fieldnoteseed.co</span>
        </div>
      </footer>
    </div>
  );
}
