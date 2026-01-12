import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const stockId = searchParams.get("id") || "2330";
  const start = searchParams.get("start") || "2024-01-01";
  const end = searchParams.get("end") || "2024-01-31";

  const url =
    "https://api.finmindtrade.com/api/v4/data?" +
    new URLSearchParams({
      dataset: "TaiwanStockPrice",
      data_id: stockId,
      start_date: start,
      end_date: end,
      token: process.env.FINMIND_TOKEN!,
    });

  const res = await fetch(url, {
    next: { revalidate: 60 }, // ISR 快取
  });

  const data = await res.json();
  return NextResponse.json(data);
}
