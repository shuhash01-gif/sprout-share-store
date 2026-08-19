import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Leaf, Minus, Plus, ShoppingBasket, Trash2, Truck, ShieldCheck, Sprout } from "lucide-react";
import { z } from "zod";

import heroSeeds from "@/assets/hero-seeds.jpg";
import { ProductCard } from "@/components/product-card";
import { categories, products, type Category } from "@/data/products";
import { useCart } from "@/lib/cart";
import { bn, DELIVERY_TIME, FREE_SHIPPING, money } from "@/lib/shop";
import { ORDER_KEY, type PlacedOrder } from "./order.success";
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

const orderId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `HLT-${out}`;
};

function Storefront() {
  const navigate = useNavigate();
  const { lines, count, subtotal, shipping, total, add, setQty, clear } = useCart();
  const [filter, setFilter] = useState<Category | "সব">("সব");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visible = useMemo(
    () =>
      products
        .filter((p) => (filter === "সব" ? true : p.category === filter))
        .filter((p) => (inStockOnly ? p.stock > 0 : true)),
    [filter, inStockOnly],
  );

  const remainingForFree = Math.max(0, FREE_SHIPPING - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING) * 100));

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = orderSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }

    const overStock = lines.find((l) => l.qty > l.product.stock || l.product.stock <= 0);
    if (overStock) {
      setErrors({
        stock: `${overStock.product.name} — স্টকে আছে ${bn(overStock.product.stock)}টি। পরিমাণ ঠিক করে আবার চেষ্টা করুন।`,
      });
      return;
    }

    const order: PlacedOrder = {
      id: orderId(),
      createdAt: new Date().toISOString(),
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
      items: lines.map((l) => ({
        name: l.product.name,
        qty: l.qty,
        price: l.product.price,
        weight: l.product.weight,
      })),
      subtotal,
      shipping,
      total,
    };

    try {
      sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {
      /* ignore */
    }

    setErrors({});
    clear();
    setForm({ name: "", phone: "", address: "", notes: "" });
    setCartOpen(false);
    navigate({ to: "/order/success" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="bg-primary text-primary-foreground">
          <p className="mx-auto max-w-6xl px-6 py-2 text-center text-xs sm:text-sm">
            {money(FREE_SHIPPING)} টাকার বেশি অর্ডারে ফ্রি ডেলিভারি · {DELIVERY_TIME} · ক্যাশ অন
            ডেলিভারি
          </p>
        </div>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="#top" className="flex items-center gap-2">
            <Leaf className="size-5 text-primary" aria-hidden="true" />
            <span className="font-display text-lg font-semibold tracking-tight">HEALTHIO</span>
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

              <div className="border-b border-border px-4 pb-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {remainingForFree === 0
                    ? "দুর্দান্ত! আপনার ডেলিভারি একদম ফ্রি।"
                    : `আর ${money(remainingForFree)} টাকার পণ্য যোগ করলে ডেলিভারি ফ্রি।`}
                </p>
              </div>

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
                              disabled={qty >= product.stock}
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
                          {qty >= product.stock && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              স্টকে আছে {bn(product.stock)}টি
                            </p>
                          )}
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
                    <dd>{money(total)}</dd>
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
              ফাইবার, প্রোটিন ও ওমেগা-৩ এ ভরপুর ৮টি প্রিমিয়াম আইটেম। স্মুদি, দই বা সালাদের সাথে
              মিশিয়ে খেতে পারেন প্রতিদিন — Healthio, Fuel Your Day The Natural Way।
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
              {
                icon: Sprout,
                title: "১০০% খাঁটি ও ফ্রেশ",
                text: "কোনো ভেজাল বা প্রিজারভেটিভ নেই",
              },
              { icon: Truck, title: `${money(FREE_SHIPPING)}+ অর্ডারে ফ্রি ডেলিভারি`, text: DELIVERY_TIME },
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
              <button
                type="button"
                onClick={() => setInStockOnly((v) => !v)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  inStockOnly
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                শুধু স্টকে আছে
              </button>
            </div>
          </div>

          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        </section>

        <section id="order" className="scroll-mt-20 border-t border-border bg-secondary/40">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="label-caps text-muted-foreground">অর্ডার করুন</p>
              <h2 className="mt-2 text-3xl md:text-4xl">ঠিকানাটা জানিয়ে দিন</h2>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                অর্ডার পাওয়ার পর আমরা ফোনে কনফার্ম করে পণ্য প্যাক করি। {money(FREE_SHIPPING)} টাকার
                বেশি অর্ডারে সারা দেশে ডেলিভারি একদম ফ্রি। ডেলিভারি সময়: {DELIVERY_TIME}।
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
                    <li className="flex justify-between text-muted-foreground">
                      <span>ডেলিভারি চার্জ</span>
                      <span>{shipping === 0 ? "ফ্রি" : money(shipping)}</span>
                    </li>
                    <Separator className="my-2" />
                    <li className="flex justify-between font-semibold">
                      <span>সর্বমোট</span>
                      <span>{money(total)}</span>
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
                {errors['stock'] && (
                  <p className="text-xs text-destructive">{errors['stock']}</p>
                )}
                <Button type="submit" size="lg" className="w-full" disabled={lines.length === 0}>
                  {lines.length === 0 ? "আগে পণ্য যোগ করুন" : `অর্ডার কনফার্ম করুন · ${money(total)}`}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  পেমেন্ট ক্যাশ অন ডেলিভারিতে · আনুমানিক ডেলিভারি {DELIVERY_TIME}
                </p>
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
