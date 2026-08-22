import { Router, type IRouter } from "express";
import { db, quotesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetQuotesQueryParams,
  GetQuotesResponse,
  CreateQuoteBody,
  CreateQuoteResponse,
  GetRandomQuoteQueryParams,
  GetRandomQuoteResponse,
  DeleteQuoteParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/quotes/random", async (req, res): Promise<void> => {
  const query = GetRandomQuoteQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const allQuotes = query.data.category
    ? await db.select().from(quotesTable).where(eq(quotesTable.category, query.data.category))
    : await db.select().from(quotesTable);

  if (allQuotes.length === 0) {
    // Fallback quote
    res.json(GetRandomQuoteResponse.parse({
      id: 0,
      text: "Become the woman younger you would never believe was real.",
      category: "CEO Energy",
      author: null,
    }));
    return;
  }

  const random = allQuotes[Math.floor(Math.random() * allQuotes.length)];
  res.json(GetRandomQuoteResponse.parse(random));
});

router.get("/quotes", async (req, res): Promise<void> => {
  const query = GetQuotesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const quotes = query.data.category
    ? await db.select().from(quotesTable).where(eq(quotesTable.category, query.data.category))
    : await db.select().from(quotesTable);

  res.json(GetQuotesResponse.parse(quotes));
});

router.post("/quotes", async (req, res): Promise<void> => {
  const parsed = CreateQuoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [quote] = await db.insert(quotesTable).values({
    text: parsed.data.text,
    category: parsed.data.category,
    author: parsed.data.author ?? null,
  }).returning();

  res.status(201).json(CreateQuoteResponse.parse(quote));
});

router.delete("/quotes/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteQuoteParams.safeParse({ id: Number(rawId) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(quotesTable).where(eq(quotesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
