-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'BEU_DELIVERY';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amountPaid" DECIMAL(10,2);
