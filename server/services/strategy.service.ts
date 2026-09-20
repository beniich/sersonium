import { rawPrisma as prisma } from "../db/prisma.js";

export class StrategyService {
  async getObjectiveProgress(objectiveId: string) {
    const kpis = await prisma.kpi.findMany({ where: { objectiveId } });
    if (kpis.length === 0) return 0;
    
    const totalProgress = kpis.reduce((acc, kpi) => {
      // Avoid division by zero
      if (kpi.targetValue === 0) return acc;
      const progress = (kpi.currentValue / kpi.targetValue) * 100;
      return acc + progress;
    }, 0);
    
    return totalProgress / kpis.length;
  }

  async syncAutomatedKpis(tenantId: string) {
    const automatedKpis = await prisma.kpi.findMany({
      where: { tenantId, source: 'AUTOMATED' }
    });

    let syncCount = 0;
    for (const kpi of automatedKpis) {
      let newValue = kpi.currentValue;

      // In a real implementation, we would call other services here:
      // if (kpi.sourceKey === 'cafm.pue_average') {
      //   newValue = await infrastructureService.calculateAveragePUE(tenantId);
      // }
      // For now, simulate a slight fluctuation in real data
      if (kpi.sourceKey === 'cafm.pue_average') {
        newValue = 1.1 + Math.random() * 0.1;
      } else if (kpi.sourceKey === 'traffic.bandwidth_usage') {
        newValue = 1000 + Math.random() * 500;
      } else {
        // Just fluctuate slightly for demonstration
        newValue += (Math.random() - 0.5) * (kpi.targetValue * 0.05);
      }

      // Ensure value makes sense (no negative metrics generally)
      newValue = Math.max(0, newValue);

      await prisma.kpi.update({
        where: { id: kpi.id },
        data: { currentValue: newValue }
      });

      await prisma.kpiHistory.create({
        data: { kpiId: kpi.id, value: newValue }
      });
      syncCount++;
    }
    return syncCount;
  }
}

export const strategyService = new StrategyService();
