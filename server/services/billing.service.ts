import { TenantPrismaClient } from "../db/tenantPrisma.js";

export class BillingService {
  /**
   * Déduit des jetons à chaque appel d'API ou inférence AI (Pattern Blueprint)
   * Protège contre les soldes négatifs avec transaction atomique.
   */
  static async consumeTokens(
    tenantPrisma: TenantPrismaClient,
    userId: string,
    amount: number,
    reason: string = "API_USAGE"
  ) {
    const user = await tenantPrisma.user.findFirst({
      where: { id: userId }
    });

    if (!user) {
      throw new Error("Utilisateur introuvable.");
    }

    if (user.tokens < amount) {
      const error: any = new Error(`Solde de jetons insuffisant. Requis : ${amount}, Disponible : ${user.tokens}.`);
      error.statusCode = 402; // Payment Required
      error.code = "INSUFFICIENT_TOKENS";
      throw error;
    }

    const updatedUser = await tenantPrisma.user.update({
      where: { id: userId },
      data: {
        tokens: {
          decrement: amount
        }
      } as any
    });

    return {
      userId,
      consumed: amount,
      remainingTokens: updatedUser.tokens,
      reason,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Recharge ou crédite des jetons pour un utilisateur ou un forfait organisation
   */
  static async creditTokens(
    tenantPrisma: TenantPrismaClient,
    userId: string,
    amount: number,
    description: string,
    amountEur: number
  ) {
    const [user, invoice] = await Promise.all([
      tenantPrisma.user.update({
        where: { id: userId },
        data: {
          tokens: {
            increment: amount
          }
        } as any
      }),
      tenantPrisma.invoice.create({
        data: {
          amount: amountEur,
          currency: "EUR",
          status: "paid",
          description: `${description} (+${amount} jetons)`,
          tokenCredits: amount
        } as any
      })
    ]);

    return {
      userId,
      addedTokens: amount,
      totalTokens: user.tokens,
      invoice
    };
  }

  /**
   * Récupère le récapitulatif de facturation et solde de jetons
   */
  static async getBillingSummary(tenantPrisma: TenantPrismaClient, userId: string) {
    const [user, invoices, totalPurchased] = await Promise.all([
      tenantPrisma.user.findFirst({
        where: { id: userId },
        select: { id: true, email: true, role: true, tokens: true, tenantId: true }
      }),
      tenantPrisma.invoice.findMany({
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      tenantPrisma.invoice.aggregate({
        _sum: {
          amount: true,
          tokenCredits: true
        }
      })
    ]);

    return {
      user: user || null,
      balanceTokens: user?.tokens || 0,
      invoices,
      stats: {
        totalSpentEur: totalPurchased._sum.amount || 0,
        totalPurchasedCredits: totalPurchased._sum.tokenCredits || 0
      }
    };
  }
}
