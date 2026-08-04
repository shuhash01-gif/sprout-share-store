import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Leaf, Minus, Plus, ShoppingBasket, Trash2, Truck, ShieldCheck, Sprout } from "lucide-react";
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
      { title: "Healthio — ফ্রেশ ও খাঁটি সিডস, বাদাম ও শুকনো ফল" },
      {
        name: "description",
        content:
          "Healthio থেকে অর্ডার করুন ফ্রেশ ও খাঁটি পাম্পকিন সিড, সানফ্লাওয়ার সিড, কাঠবাদাম, কাজুবাদাম, ফ্ল্যাক্স সিড, তিল, কিশমিশ ও খেজুর। সারা দেশে ক্যাশ অন ডেলিভারি।",
      },
      { property: "og:title", content: "Healthio — ফ্রেশ ও খাঁটি সিডস ও বাদাম" },
      {
        property: "og:description",
        content:
          "৮টি প্রিমিয়াম আইটেম — সিডস, বাদাম ও শুকনো ফল। ঘরে বসেই অর্ডার করুন Healthio থেকে।",
      },
    ],
  }),
  component: Storefront,
});

const orderSchema = z.object({
  name: z.string().trim().min(2, "আপনার পুরো নাম লিখুন").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন (যেমন ০১৭XXXXXXXX)"),
  address: z.string().trim().min(10, "সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন").max(300),
  notes: z.string().trim().max(500).optional(),
});

const money = (amount: number) =>
  new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);

const bn = (n: number) => new Intl.NumberFormat("bn-BD").format(n);

const FREE_SHIPPING = 1500;
const DELIVERY_FEE = 70;

function Storefront() {
  const [filter, setFilter] = useState<Category | "সব">("সব");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visible = useMemo(
    () => (filter === "সব" ? products : products.filter((p) => p.category === filter)),
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
  const shipping = count === 0 || subtotal >= FREE_SHIPPING ? 0 : DELIVERY_FEE;

  const add = (id: string, name: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    toast.success(`${name} ব্যাগে যোগ হয়েছে`);
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
    setForm({ name: "", phone: "", address: "", notes: "" });
    setCartOpen(false);
    toast.success("অর্ডার সম্পন্ন হয়েছে — আমরা শীঘ্রই ফোনে কনফার্ম করব।");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="#top" className="flex items-center gap-2">
            <Leaf className="size-5 text-primary" aria-hidden="true" />
            <span className="font-display text-lg font-semibold tracking-tight">
              HEALTHIO
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#catalog" className="transition-colors hover:text-foreground">
              পণ্য
            </a>
            <a href="#order" className="transition-colors hover:text-foreground">
              অর্ডার করুন
            </a>
          </nav>
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ShoppingBasket className="size-4" aria-hidden="true" />
                ব্যাগ
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {bn(count)}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="font-display text-xl">আপনার ব্যাগ</SheetTitle>
                <SheetDescription>
                  {money(FREE_SHIPPING)} টাকার বেশি অর্ডারে ডেলিভারি ফ্রি।
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-4">
                {lines.length === 0 ? (
                  <p className="py-10 text-sm text-muted-foreground">
                    এখনো কিছু নেই। পণ্যের তালিকা থেকে পছন্দের আইটেম যোগ করুন।
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {lines.map(({ product, qty }) => (
                      <li key={product.id} className="flex gap-3 py-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          width={1024}
                          height={1024}
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
                              aria-label={`${product.name} কমান`}
                              onClick={() => setQty(product.id, qty - 1)}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{bn(qty)}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-7"
                              aria-label={`${product.name} বাড়ান`}
                              onClick={() => setQty(product.id, qty + 1)}
                            >
                              <Plus className="size-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground"
                              aria-label={`${product.name} বাদ দিন`}
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
                    <dt className="text-muted-foreground">সাবটোটাল</dt>
                    <dd>{money(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">ডেলিভারি চার্জ</dt>
                    <dd>{shipping === 0 ? "ফ্রি" : money(shipping)}</dd>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-semibold">
                    <dt>সর্বমোট</dt>
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
                  অর্ডার সম্পন্ন করুন
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
            alt="জারে সাজানো নানা রকম বীজ, বাদাম ও শুকনো ফল"
            width={1600}
            height={1104}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-bark/70" />
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
            <p className="label-caps text-husk">ছোট্ট বীজ · বিশাল উপকার</p>
            <h1 className="mt-4 max-w-2xl text-4xl leading-[1.15] text-seed-foreground md:text-6xl">
              ফ্রেশ ও খাঁটি সিডস, বাদাম আর শুকনো ফল
            </h1>
            <p className="mt-5 max-w-xl text-base text-husk md:text-lg">
              ফাইবার, প্রোটিন ও ওমেগা-৩ এ ভরপুর ৮টি প্রিমিয়াম আইটেম। স্মুদি, দই বা সালাদের
              সাথে মিশিয়ে খেতে পারেন প্রতিদিন — Healthio, Fuel Your Day The Natural Way।
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                onClick={() =>
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                পণ্য দেখুন
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card">
          <ul className="mx-auto grid max-w-6xl gap-6 px-6 py-8 sm:grid-cols-3">
            {[
              { icon: Sprout, title: "১০০% খাঁটি ও ফ্রেশ", text: "কোনো ভেজাল বা প্রিজারভেটিভ নেই" },
              { icon: Truck, title: "সারা দেশে ডেলিভারি", text: "ঢাকায় ২৪ ঘণ্টা, বাইরে ২-৩ দিন" },
              { icon: ShieldCheck, title: "ক্যাশ অন ডেলিভারি", text: "পণ্য হাতে পেয়ে টাকা দিন" },
            ].map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <f.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="catalog" className="paper mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-caps text-muted-foreground">আমাদের পণ্য</p>
              <h2 className="mt-2 text-3xl md:text-4xl">৮টি আইটেম, সবই বাছাই করা</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["সব", ...categories] as const).map((c) => (
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
                  width={1024}
                  height={1024}
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
                  <ul className="mt-3 space-y-1 text-xs leading-relaxed text-foreground/70">
                    {p.benefits.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span className="text-primary">•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="secondary"
                    className="mt-5 w-full"
                    onClick={() => add(p.id, p.name)}
                  >
                    ব্যাগে যোগ করুন
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="order" className="scroll-mt-20 border-t border-border bg-secondary/40">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="label-caps text-muted-foreground">অর্ডার করুন</p>
              <h2 className="mt-2 text-3xl md:text-4xl">ঠিকানাটা জানিয়ে দিন</h2>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                অর্ডার পাওয়ার পর আমরা ফোনে কনফার্ম করে পণ্য প্যাক করি। {money(FREE_SHIPPING)}{" "}
                টাকার বেশি অর্ডারে সারা দেশে ডেলিভারি একদম ফ্রি।
              </p>

              <div className="mt-8 rounded-sm border border-border bg-card p-5">
                <h3 className="text-base">অর্ডার সামারি</h3>
                {lines.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    আপনার ব্যাগ খালি — উপরের তালিকা থেকে পণ্য যোগ করুন।
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm">
                    {lines.map(({ product, qty }) => (
                      <li key={product.id} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                          {bn(qty)} × {product.name}
                        </span>
                        <span>{money(product.price * qty)}</span>
                      </li>
                    ))}
                    <Separator className="my-2" />
                    <li className="flex justify-between font-semibold">
                      <span>সর্বমোট</span>
                      <span>{money(subtotal + shipping)}</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <form onSubmit={placeOrder} className="rounded-sm border border-border bg-card p-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">পুরো নাম</Label>
                  <Input
                    id="name"
                    value={form.name}
                    maxLength={100}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors['name'] && <p className="text-xs text-destructive">{errors['name']}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">মোবাইল নম্বর</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="০১৭XXXXXXXX"
                    value={form.phone}
                    maxLength={14}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  {errors['phone'] && <p className="text-xs text-destructive">{errors['phone']}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">ডেলিভারি ঠিকানা</Label>
                  <Textarea
                    id="address"
                    rows={3}
                    value={form.address}
                    maxLength={300}
                    placeholder="বাসা, রোড, এলাকা, থানা, জেলা"
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                  {errors['address'] && (
                    <p className="text-xs text-destructive">{errors['address']}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">অতিরিক্ত নোট (ঐচ্ছিক)</Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    value={form.notes}
                    maxLength={500}
                    placeholder="গিফট র‍্যাপ, ডেলিভারির সময় বা অন্য কোনো নির্দেশনা…"
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={lines.length === 0}>
                  {lines.length === 0
                    ? "আগে পণ্য যোগ করুন"
                    : `অর্ডার কনফার্ম করুন · ${money(subtotal + shipping)}`}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-sm text-muted-foreground">
          <span>Healthio · Fuel Your Day, The Natural Way</span>
          <span>ফোন: ৭৮৭</span>
        </div>
      </footer>
    </div>
  );
}
