import type { Order, OrderPayment, PaymentMethod } from "@/types";

export const paymentLabel: Record<PaymentMethod, string> = {
  cash: "Tunai",
  debit: "Kartu Debit",
  credit: "Kartu Kredit",
  card: "E-Wallet",
  qris: "QRIS",
  transfer: "Transfer Bank",
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] =
  (Object.keys(paymentLabel) as PaymentMethod[]).map((value) => ({
    value,
    label: paymentLabel[value],
  }));

/** Baris pembayaran di kasir, sebelum transaksi disimpan. */
export interface PaymentDraft {
  id: string;
  method: PaymentMethod;
  amount: number;
  cashReceived: number;
}

export interface PaymentSummary {
  totalDue: number;
  totalPaid: number;
  remaining: number;
  changeAmount: number;
  isPaid: boolean;
  isOverpaid: boolean;
  invalidMessage: string | null;
  /** Pesan saat jumlah pembayaran melewati tagihan. */
  overpayMessage: string | null;
  statusLabel: "Lunas" | "Belum Lunas";
  canCheckout: boolean;
  resolved: OrderPayment[];
  paymentMethod: PaymentMethod;
  /** Total uang tunai yang diterima, untuk field lama `cashReceived`. */
  cashReceived?: number;
}

const OVERPAY_MESSAGE = "Total pembayaran melebihi total tagihan.";
const AMOUNT_MESSAGE = "Nominal harus lebih besar dari 0";

function roundRp(value: number): number {
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.round(value);
}

function isPositiveAmount(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Menilai satu atau banyak pembayaran terhadap total tagihan.
 *
 * Satu metode non-tunai dengan nominal 0 dianggap lunas sebesar tagihan
 * (perilaku kasir sebelumnya, tanpa input nominal).
 * Satu metode tunai memakai uang diterima: kelebihan adalah kembalian,
 * bukan pembayaran yang melebihi tagihan.
 * Dua metode atau lebih memakai nominal tiap baris. Jumlahnya harus tepat.
 */
export function summarizePayments(
  drafts: PaymentDraft[],
  totalDue: number
): PaymentSummary {
  const due = Number.isFinite(totalDue) ? Math.max(0, roundRp(totalDue)) : 0;
  const first = drafts[0];
  const paymentMethod: PaymentMethod = first?.method ?? "cash";

  const empty: PaymentSummary = {
    totalDue: due,
    totalPaid: 0,
    remaining: due,
    changeAmount: 0,
    isPaid: false,
    isOverpaid: false,
    invalidMessage: drafts.length === 0 ? "Metode pembayaran wajib dipilih" : null,
    overpayMessage: null,
    statusLabel: "Belum Lunas",
    canCheckout: false,
    resolved: [],
    paymentMethod,
  };

  if (!first) return empty;

  if (drafts.length === 1 && first.method === "cash") {
    return summarizeSingleCash(first, due);
  }

  if (drafts.length === 1) {
    return summarizeSingleOther(first, due);
  }

  return summarizeSplit(drafts, due);
}

function summarizeSingleCash(line: PaymentDraft, due: number): PaymentSummary {
  const tendered = roundRp(line.cashReceived);
  if (!Number.isFinite(tendered) || tendered < 0) {
    return blocked(line.method, due, AMOUNT_MESSAGE);
  }

  const paidTowardBill = Math.min(tendered, due);
  const remaining = Math.max(0, due - tendered);
  const changeAmount = Math.max(0, tendered - due);
  const isPaid = tendered >= due;

  return {
    totalDue: due,
    totalPaid: isPaid ? due : tendered,
    remaining,
    changeAmount,
    isPaid,
    isOverpaid: false,
    invalidMessage: null,
    overpayMessage: null,
    statusLabel: isPaid ? "Lunas" : "Belum Lunas",
    canCheckout: isPaid,
    resolved: isPaid
      ? [{ method: "cash", amount: paidTowardBill, cashReceived: tendered }]
      : [],
    paymentMethod: "cash",
    cashReceived: tendered,
  };
}

function summarizeSingleOther(line: PaymentDraft, due: number): PaymentSummary {
  const amount = roundRp(line.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    return blocked(line.method, due, AMOUNT_MESSAGE);
  }

  // Nominal 0 = bayar penuh, sama seperti kasir sebelum split payment.
  const applied = amount === 0 ? due : amount;
  if (applied > due) {
    return {
      ...blocked(line.method, due, null),
      totalPaid: applied,
      remaining: 0,
      isOverpaid: true,
      overpayMessage: OVERPAY_MESSAGE,
      resolved: [],
    };
  }

  const remaining = due - applied;
  const isPaid = remaining === 0;
  return {
    totalDue: due,
    totalPaid: applied,
    remaining,
    changeAmount: 0,
    isPaid,
    isOverpaid: false,
    invalidMessage: null,
    overpayMessage: null,
    statusLabel: isPaid ? "Lunas" : "Belum Lunas",
    canCheckout: isPaid,
    resolved: isPaid ? [{ method: line.method, amount: applied }] : [],
    paymentMethod: line.method,
  };
}

function summarizeSplit(drafts: PaymentDraft[], due: number): PaymentSummary {
  const paymentMethod = drafts[0]?.method ?? "cash";
  let invalidMessage: string | null = null;
  let changeAmount = 0;
  let totalPaid = 0;
  const resolved: OrderPayment[] = [];

  for (const line of drafts) {
    const amount = roundRp(line.amount);
    if (!isPositiveAmount(amount)) {
      invalidMessage = AMOUNT_MESSAGE;
      continue;
    }

    if (line.method === "cash") {
      const tenderedRaw = roundRp(line.cashReceived);
      const tendered = !Number.isFinite(tenderedRaw) || tenderedRaw === 0 ? amount : tenderedRaw;
      if (!Number.isFinite(tendered) || tendered < amount) {
        invalidMessage = "Uang diterima kurang dari jumlah pembayaran tunai";
        continue;
      }
      changeAmount += tendered - amount;
      resolved.push({ method: "cash", amount, cashReceived: tendered });
    } else {
      resolved.push({ method: line.method, amount });
    }

    totalPaid += amount;
  }

  if (invalidMessage) {
    return {
      ...blocked(paymentMethod, due, invalidMessage),
      totalPaid,
      changeAmount,
    };
  }

  if (totalPaid > due) {
    return {
      totalDue: due,
      totalPaid,
      remaining: 0,
      changeAmount,
      isPaid: false,
      isOverpaid: true,
      invalidMessage: null,
      overpayMessage: OVERPAY_MESSAGE,
      statusLabel: "Belum Lunas",
      canCheckout: false,
      resolved: [],
      paymentMethod,
    };
  }

  const remaining = due - totalPaid;
  const isPaid = remaining === 0;
  const cashReceived = resolved
    .filter((line) => line.method === "cash")
    .reduce((sum, line) => sum + (line.cashReceived ?? line.amount), 0);

  return {
    totalDue: due,
    totalPaid,
    remaining,
    changeAmount,
    isPaid,
    isOverpaid: false,
    invalidMessage: null,
    overpayMessage: null,
    statusLabel: isPaid ? "Lunas" : "Belum Lunas",
    canCheckout: isPaid,
    resolved: isPaid ? resolved : [],
    paymentMethod,
    cashReceived: cashReceived > 0 ? cashReceived : undefined,
  };
}

function blocked(
  paymentMethod: PaymentMethod,
  due: number,
  invalidMessage: string | null
): PaymentSummary {
  return {
    totalDue: due,
    totalPaid: 0,
    remaining: due,
    changeAmount: 0,
    isPaid: false,
    isOverpaid: false,
    invalidMessage,
    overpayMessage: null,
    statusLabel: "Belum Lunas",
    canCheckout: false,
    resolved: [],
    paymentMethod,
  };
}

export function getOrderPayments(order: Pick<Order, "payments" | "paymentMethod" | "total" | "cashReceived">): OrderPayment[] {
  if (order.payments && order.payments.length > 0) return order.payments;
  if (order.paymentMethod === "cash") {
    return [
      {
        method: "cash",
        amount: order.total,
        cashReceived: order.cashReceived,
      },
    ];
  }
  return [{ method: order.paymentMethod, amount: order.total }];
}

/** Label ringkas untuk tabel, mis. "Tunai + Kartu Debit". */
export function formatOrderPaymentLabel(
  order: Pick<Order, "payments" | "paymentMethod" | "total" | "cashReceived">
): string {
  const labels: string[] = [];
  for (const line of getOrderPayments(order)) {
    const label = paymentLabel[line.method] ?? line.method;
    if (!labels.includes(label)) labels.push(label);
  }
  return labels.join(" + ");
}

export function createPaymentDraft(
  id: string,
  method: PaymentMethod = "cash"
): PaymentDraft {
  return { id, method, amount: 0, cashReceived: 0 };
}
