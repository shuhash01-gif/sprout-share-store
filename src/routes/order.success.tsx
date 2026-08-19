import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Printer, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { bn, bnDate, DELIVERY_TIME, estimatedDelivery, money } from "@/lib/shop";

export const ORDER_KEY = "healthio-last-order";

export type PlacedOrder = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  items: { name: string; qty: number; price: number; weight: string }[];
  subtotal: number;
  shipping: number;
  total: number;
};

export const Route = createFileRoute("/order/success")({
  head: () => ({
    meta: [
      { title: "অর্ডার কনফার্ম হয়েছে — Healthio" },
      {
        name: "description",
        content: "আপনার Healthio অর্ডারের সম্পূর্ণ সারাংশ ও আনুমানিক ডেলিভারি সময়।",
      },
      { property: "og:title", content: "অর্ডার কনফার্ম হয়েছে — Healthio" },
      {
        property: "og:description",
        content: "ক্যাশ অন ডেলিভারিতে অর্ডার সম্পন্ন। সারাংশ ও ডেলিভারি সময় দেখুন।",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccess,
});

function summaryText(order: PlacedOrder) {
  const lines = order.items.map(
    (i) => `- ${i.name} (${i.weight}) × ${bn(i.qty)} = ${money(i.price * i.qty)}`,
  );
  return [
    `Healthio অর্ডার সারাংশ`,
    `অর্ডার নম্বর: ${order.id}`,
    `তারিখ: ${bnDate(order.createdAt)}`,
    ``,
    `নাম: ${order.name}`,
    `ফোন: ${order.phone}`,
    `ঠিকানা: ${order.address}`,
    order.notes ? `নোট: ${order.notes}` : ``,
    ``,
    ...lines,
    ``,
    `সাবটোটাল: ${money(order.subtotal)}`,
    `ডেলিভারি চার্জ: ${order.shipping === 0 ? "ফ্রি" : money(order.shipping)}`,
    `সর্বমোট (ক্যাশ অন ডেলিভারি): ${money(order.total)}`,
    `আনুমানিক ডেলিভারি: ${estimatedDelivery(order.createdAt)}`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

function OrderSuccess() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ORDER_KEY);
      if (raw) setOrder(JSON.parse(raw) as PlacedOrder);
    } catch {
      /* ignore */
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (checked && !order) navigate({ to: "/" });
  }, [checked, order, navigate]);

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-sm text-muted-foreground">
        অর্ডারের তথ্য খুঁজছি…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-14">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-sm border border-border bg-card p-7 shadow-soft">
          <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-3xl">অর্ডার কনফার্ম হয়েছে</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ধন্যবাদ {order.name}! আমরা শীঘ্রই {order.phone} নম্বরে ফোন করে অর্ডারটি নিশ্চিত করব।
            পেমেন্ট হবে ক্যাশ অন ডেলিভারিতে।
          </p>

          <dl className="mt-6 grid gap-3 rounded-sm bg-secondary/50 p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">অর্ডার নম্বর</dt>
              <dd className="font-semibold">{order.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">অর্ডারের তারিখ</dt>
              <dd className="font-semibold">{bnDate(order.createdAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">ডেলিভারি ঠিকানা</dt>
              <dd>{order.address}</dd>
            </div>
            {order.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">নোট</dt>
                <dd>{order.notes}</dd>
              </div>
            ) : null}
          </dl>

          <h2 className="mt-8 text-lg">অর্ডার সারাংশ</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {order.items.map((i) => (
              <li key={i.name} className="flex justify-between gap-3 py-3">
                <span className="text-muted-foreground">
                  {bn(i.qty)} × {i.name}{" "}
                  <span className="text-xs">({i.weight})</span>
                </span>
                <span>{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">সাবটোটাল</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ডেলিভারি চার্জ</dt>
              <dd>{order.shipping === 0 ? "ফ্রি" : money(order.shipping)}</dd>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-semibold">
              <dt>সর্বমোট (ক্যাশ অন ডেলিভারি)</dt>
              <dd>{money(order.total)}</dd>
            </div>
          </dl>

          <p className="mt-6 flex items-start gap-2 rounded-sm border border-border p-4 text-sm">
            <Truck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              আনুমানিক ডেলিভারি: <strong>{estimatedDelivery(order.createdAt)}</strong> ·{" "}
              {DELIVERY_TIME}
            </span>
          </p>

          <div className="mt-6 flex flex-wrap gap-2 print:hidden">
            <Button
              variant="outline"
              className="gap-2"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(summaryText(order));
                  toast.success("সারাংশ কপি হয়েছে");
                } catch {
                  toast.error("কপি করা যায়নি");
                }
              }}
            >
              <Copy className="size-4" aria-hidden="true" />
              সারাংশ কপি করুন
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden="true" />
              প্রিন্ট / PDF
            </Button>
            <Button asChild>
              <Link to="/">আরও কিনুন</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
