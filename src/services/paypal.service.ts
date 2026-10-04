import axios from "axios";

const API_BASE_URL = typeof window !== "undefined" && window.location.origin.includes("localhost")
  ? `${window.location.origin}/api/v1`
  : "/api/v1";

export interface InitSubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  orderId?: string;
  approvalUrl?: string;
  data?: any;
}

export class PayPalService {
  /**
   * Lance le processus d'abonnement récurrent (Vault & Subscription Model)
   * @param planId L'identifiant de plan PayPal (ex: P-PRO-MONTHLY ou forfait)
   * @param cycle Périodicité ("monthly" | "yearly")
   */
  async createSubscription(planId: string = "P-PRO-MONTHLY", cycle: "monthly" | "yearly" = "monthly"): Promise<InitSubscriptionResponse> {
    try {
      const tenantId = (typeof localStorage !== "undefined" && localStorage.getItem("tenantId")) || "tenant_enterprise_lacaza";
      
      const response = await axios.post(`${API_BASE_URL}/payments/paypal/create-order`, {
        planId,
        cycle,
        tenantId,
      });

      return response.data;
    } catch (error) {
      console.error("[PayPal Frontend Service] Init Subscription Error:", error);
      throw error;
    }
  }

  /**
   * Confirmation côté client après approbation de l'utilisateur sur PayPal
   */
  async confirmSubscription(subscriptionIdOrOrderId: string): Promise<any> {
    const tenantId = (typeof localStorage !== "undefined" && localStorage.getItem("tenantId")) || "tenant_enterprise_lacaza";
    
    const response = await axios.post(`${API_BASE_URL}/payments/paypal/capture-order`, {
      orderId: subscriptionIdOrOrderId,
      subscriptionId: subscriptionIdOrOrderId,
      tenantId,
    });
    return response.data;
  }
}

export const paypalService = new PayPalService();
