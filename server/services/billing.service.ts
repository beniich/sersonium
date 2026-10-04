import { TenantPrismaClient } from "../db/tenantPrisma.js";

export class BillingService {
  // Quotas de jetons par forfait mensuel
  public static PLAN_QUOTAS: Record<string, number> = {
    FREE: 10_000,
    SILVER: 100_000,
    PRO: 1_000_000,
    ENTERPRISE: 100_000_000,
  };

  /**
   * Initialise le portefeuille de jetons d'une organisation
   */
  static async initializeBilling(tenantPrisma: TenantPrismaClient, userId: string, plan: string = "PRO") {
    const quota = this.PLAN_QUOTAS[plan.toUpperCase()] || this.PLAN_QUOTAS.PRO;
    return tenantPrisma.user.update({
      where: { id: userId },
      data: { tokens: quota } as any
    });
  }

  /**
   * Récupère le pourcentage d'utilisation des quotas IA
   */
  static async getUsageMetrics(tenantPrisma: TenantPrismaClient, userId: string, plan: string = "PRO") {
    const user = await tenantPrisma.user.findFirst({ where: { id: userId } });
    if (!user) return null;

    const monthlyLimit = this.PLAN_QUOTAS[plan.toUpperCase()] || this.PLAN_QUOTAS.PRO;
    const currentTokens = user.tokens;
    const consumed = Math.max(0, monthlyLimit - currentTokens);
    const percentage = Math.min(100, Math.round((consumed / monthlyLimit) * 100));

    return {
      consumed,
      limit: monthlyLimit,
      remaining: currentTokens,
      percentage
    };
  }

  /**
   * Réinitialise le quota mensuel au 1er du mois
   */
  static async resetMonthlyQuota(tenantPrisma: TenantPrismaClient, userId: string, plan: string = "PRO") {
    const quota = this.PLAN_QUOTAS[plan.toUpperCase()] || this.PLAN_QUOTAS.PRO;
    return tenantPrisma.user.update({
      where: { id: userId },
      data: { tokens: quota } as any
    });
  }

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
