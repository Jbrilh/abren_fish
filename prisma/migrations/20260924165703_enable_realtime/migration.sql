-- Enable Supabase Realtime broadcasts for order-related tables so the
-- kitchen display can subscribe to live changes without polling.
-- Idempotent and shadow-database-safe: Supabase provisions
-- `supabase_realtime` on real projects, but Prisma's shadow DB (used to
-- validate migrations) is a plain Postgres instance without it.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'Order'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Order";
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'OrderItem'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "OrderItem";
  END IF;
END $$;
