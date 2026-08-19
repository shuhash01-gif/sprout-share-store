export const FREE_SHIPPING = 1500;
export const DELIVERY_FEE = 70;

export const money = (amount: number) =>
  new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);

export const bn = (n: number) => new Intl.NumberFormat("bn-BD").format(n);

export const DELIVERY_TIME = "ঢাকায় ২৪ ঘণ্টা, ঢাকার বাইরে ২–৩ দিন";

export const shippingFor = (subtotal: number, count: number) =>
  count === 0 || subtotal >= FREE_SHIPPING ? 0 : DELIVERY_FEE;

export const stockLabel = (stock: number) => {
  if (stock <= 0) return "স্টক আউট";
  if (stock <= 5) return `মাত্র ${bn(stock)}টি বাকি`;
  return "স্টকে আছে";
};

export const bnDate = (iso: string) =>
  new Intl.DateTimeFormat("bn-BD", { dateStyle: "long" }).format(new Date(iso));

export const estimatedDelivery = (iso: string) => {
  const from = new Date(new Date(iso).getTime() + 24 * 3600 * 1000);
  const to = new Date(new Date(iso).getTime() + 3 * 24 * 3600 * 1000);
  const fmt = new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "long" });
  return `${fmt.format(from)} – ${fmt.format(to)}`;
};
