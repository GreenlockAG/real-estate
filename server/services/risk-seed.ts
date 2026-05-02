// WARNING: This seed endpoint should be protected with authentication in production
// For development/demo purposes only

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import {
  riskOrganizations,
  riskUsers,
  riskPortfolios,
  riskSleeves,
  riskLiquidityPositions,
  riskCashFlowProjections,
  riskGovernanceThresholds,
  riskParameterPacks,
  riskParameterItems,
  riskCorrelationMatrices,
  riskStressScenarios,
  riskSimulations,
  riskMaxDrawdownResults,
  riskLcrResults,
  riskCrisisPnlResults,
  riskEsResults,
  riskCsiResults,
  riskGovernanceReviews,
  riskAuditLogs,
  SLEEVE_TYPES
} from "@shared/schema";

export async function seedRiskData() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("🌱 Seeding Risk Module data...");

  // Idempotency check
  const existingOrgs = await db.select().from(riskOrganizations).limit(1);
  if (existingOrgs.length > 0) {
    console.log("⚠️  Risk data already seeded. Returning existing data...");
    const orgs = await db.select().from(riskOrganizations);
    const users = await db.select().from(riskUsers);
    const portfolios = await db.select().from(riskPortfolios);
    const packs = await db.select().from(riskParameterPacks);
    const simulations = await db.select().from(riskSimulations);
    
    return {
      organization: orgs[0],
      user: users[0],
      portfolio: portfolios[0],
      parameterPack: packs[0],
      simulation: simulations[0]
    };
  }

  // Transaction wrapper for atomicity
  return await db.transaction(async (tx) => {
    console.log("Starting transactional seed...");

    // 1. Create Aurora Family Office Organization
    const [org] = await tx.insert(riskOrganizations).values({
      name: "Aurora Family Office"
    }).returning();
    console.log("✓ Created organization:", org.name);

    // 2. Create Danil Knyazev (admin user)
    const [user] = await tx.insert(riskUsers).values({
      organizationId: org.id,
      email: "danil@aurorafo.com",
      name: "Danil Knyazev",
      role: "admin"
    }).returning();
    console.log("✓ Created user:", user.name);

    // 3. Create Core Governance Portfolio
    const [portfolio] = await tx.insert(riskPortfolios).values({
      organizationId: org.id,
      name: "Core Governance Portfolio",
      baseCurrency: "USD",
      aumMillions: "350",
      chfSpendingNote: "CHF spending 2M/year equivalent"
    }).returning();
    console.log("✓ Created portfolio:", portfolio.name);

    // 4. Create all 9 sleeves
    const sleeveWeights = {
      GROWTH: { target: "45.00", current: "45.00" },
      CREDIT: { target: "25.00", current: "25.00" },
      DURATION: { target: "0.00", current: "0.00" },
      TIPS: { target: "0.00", current: "0.00" },
      CTA: { target: "0.00", current: "0.00" },
      COMMODITIES: { target: "0.00", current: "0.00" },
      DIVERSIFIERS: { target: "15.00", current: "15.00" },
      REAL_ASSETS: { target: "0.00", current: "0.00" },
      LIQUIDITY: { target: "15.00", current: "15.00" }
    };

    for (const sleeveType of SLEEVE_TYPES) {
      await tx.insert(riskSleeves).values({
        portfolioId: portfolio.id,
        sleeveType,
        targetWeightPct: sleeveWeights[sleeveType].target,
        currentWeightPct: sleeveWeights[sleeveType].current,
        notes: ""
      });
    }
    console.log("✓ Created 9 sleeves");

    // 5. Create liquidity positions (for LCR numerator)
    await tx.insert(riskLiquidityPositions).values({
      portfolioId: portfolio.id,
      cashMillions: "5.00",
      tbillsMillions: "3.00",
      shortIgMillions: "3.00",
      creditLineMillions: "2.50"
    });
    console.log("✓ Created liquidity positions");

    // 6. Create cash flow projections (for LCR denominator)
    await tx.insert(riskCashFlowProjections).values({
      portfolioId: portfolio.id,
      capitalCallsMillions: "4.00",
      distributionsMillions: "2.00",
      operatingExpensesMillions: "0.30",
      expectedPeDistributionsMillions: "1.00"
    });
    console.log("✓ Created cash flow projections");

    // 7. Create governance thresholds
    await tx.insert(riskGovernanceThresholds).values({
      portfolioId: portfolio.id,
      maxDdPct: "20.00",
      lcrMin: "1.25",
      crisisPnlLimit2008: "-20.00",
      es97Target: "-18.00",
      csiWarningLevel: "-0.10",
      notes: "Conservative family office thresholds"
    });
    console.log("✓ Created governance thresholds");

    // 8. Create Parameter Pack v1
    const [pack] = await tx.insert(riskParameterPacks).values({
      portfolioId: portfolio.id,
      version: 1,
      label: "Base Case v1",
      createdBy: user.id
    }).returning();
    console.log("✓ Created parameter pack v1");

    // 9. Create parameter items (volatilities, returns, hedge effectiveness)
    const parameterData = {
      volatilities: {
        GROWTH: "18.00", CREDIT: "8.00", DURATION: "6.00", TIPS: "5.00",
        CTA: "12.00", COMMODITIES: "20.00", DIVERSIFIERS: "12.00",
        REAL_ASSETS: "15.00", LIQUIDITY: "2.00"
      },
      returns: {
        GROWTH: "6.00", CREDIT: "4.00", DURATION: "3.50", TIPS: "2.50",
        CTA: "4.00", COMMODITIES: "4.00", DIVERSIFIERS: "5.00",
        REAL_ASSETS: "6.00", LIQUIDITY: "1.00"
      },
      hedgeEffectiveness: {
        GROWTH: "0.60", DURATION: "0.80"
      }
    };

    for (const [sleeveType, value] of Object.entries(parameterData.volatilities)) {
      await tx.insert(riskParameterItems).values({
        packId: pack.id,
        sleeveType,
        itemKind: "VOL",
        value
      });
    }

    for (const [sleeveType, value] of Object.entries(parameterData.returns)) {
      await tx.insert(riskParameterItems).values({
        packId: pack.id,
        sleeveType,
        itemKind: "RETURN",
        value
      });
    }

    for (const [sleeveType, value] of Object.entries(parameterData.hedgeEffectiveness)) {
      await tx.insert(riskParameterItems).values({
        packId: pack.id,
        sleeveType,
        itemKind: "HEDGE_EFF",
        value
      });
    }
    console.log("✓ Created parameter items");

    // 10. Create correlation matrices (Normal regime)
    const normalMatrix = [
      [1.00, 0.65, -0.25, -0.20, -0.05, 0.35, -0.10, 0.30, 0.10],
      [0.65, 1.00, -0.15, -0.10, 0.05, 0.25, 0.00, 0.20, 0.15],
      [-0.25, -0.15, 1.00, 0.85, 0.10, -0.10, 0.05, -0.05, 0.20],
      [-0.20, -0.10, 0.85, 1.00, 0.05, -0.05, 0.10, 0.00, 0.15],
      [-0.05, 0.05, 0.10, 0.05, 1.00, 0.40, 0.50, 0.20, -0.05],
      [0.35, 0.25, -0.10, -0.05, 0.40, 1.00, 0.30, 0.60, 0.05],
      [-0.10, 0.00, 0.05, 0.10, 0.50, 0.30, 1.00, 0.25, 0.00],
      [0.30, 0.20, -0.05, 0.00, 0.20, 0.60, 0.25, 1.00, 0.10],
      [0.10, 0.15, 0.20, 0.15, -0.05, 0.05, 0.00, 0.10, 1.00]
    ];

    await tx.insert(riskCorrelationMatrices).values({
      packId: pack.id,
      regimeType: "NORMAL",
      labels: SLEEVE_TYPES as any,
      matrix: normalMatrix as any
    });

    // Stress regime matrix (2022-style: stocks + bonds both down)
    const stressMatrix = [
      [1.00, 0.70, 0.20, 0.15, -0.05, 0.40, 0.10, 0.35, 0.25],
      [0.70, 1.00, 0.30, 0.25, 0.05, 0.30, 0.15, 0.25, 0.30],
      [0.20, 0.30, 1.00, 0.90, 0.05, 0.10, 0.00, 0.15, 0.35],
      [0.15, 0.25, 0.90, 1.00, 0.00, 0.05, 0.05, 0.10, 0.30],
      [-0.05, 0.05, 0.05, 0.00, 1.00, 0.45, 0.55, 0.25, 0.00],
      [0.40, 0.30, 0.10, 0.05, 0.45, 1.00, 0.35, 0.65, 0.15],
      [0.10, 0.15, 0.00, 0.05, 0.55, 0.35, 1.00, 0.30, 0.05],
      [0.35, 0.25, 0.15, 0.10, 0.25, 0.65, 0.30, 1.00, 0.20],
      [0.25, 0.30, 0.35, 0.30, 0.00, 0.15, 0.05, 0.20, 1.00]
    ];

    await tx.insert(riskCorrelationMatrices).values({
      packId: pack.id,
      regimeType: "STRESS",
      labels: SLEEVE_TYPES as any,
      matrix: stressMatrix as any
    });
    console.log("✓ Created correlation matrices (normal + stress)");

    // 11. Create stress scenarios
    const scenarios = [
      {
        name: "2008 (Lehman)",
        category: "MACRO",
        horizonDays: 90,
        shocks: { GROWTH: -40, CREDIT: -15, DURATION: 20, TIPS: 0, CTA: 12, COMMODITIES: -35, DIVERSIFIERS: -10, REAL_ASSETS: -25, LIQUIDITY: 0 }
      },
      {
        name: "2020 (COVID)",
        category: "MACRO",
        horizonDays: 60,
        shocks: { GROWTH: -30, CREDIT: -12, DURATION: 10, TIPS: 2, CTA: 8, COMMODITIES: -20, DIVERSIFIERS: -8, REAL_ASSETS: -15, LIQUIDITY: 0 }
      },
      {
        name: "1970s (Stagflation)",
        category: "MACRO",
        horizonDays: 365,
        shocks: { GROWTH: -20, CREDIT: -10, DURATION: -15, TIPS: -5, CTA: 15, COMMODITIES: 200, DIVERSIFIERS: 5, REAL_ASSETS: -10, LIQUIDITY: -5 }
      },
      {
        name: "2022 (Rate Shock)",
        category: "RATE",
        horizonDays: 180,
        shocks: { GROWTH: -18, CREDIT: -8, DURATION: -17, TIPS: -5, CTA: 10, COMMODITIES: 15, DIVERSIFIERS: 0, REAL_ASSETS: -12, LIQUIDITY: 2 }
      },
      {
        name: "Flash Crash",
        category: "MACRO",
        horizonDays: 1,
        shocks: { GROWTH: -15, CREDIT: -5, DURATION: 5, TIPS: 2, CTA: 3, COMMODITIES: -10, DIVERSIFIERS: -3, REAL_ASSETS: 0, LIQUIDITY: 0 }
      }
    ];

    for (const scenario of scenarios) {
      await tx.insert(riskStressScenarios).values({
        packId: pack.id,
        name: scenario.name,
        category: scenario.category,
        horizonDays: scenario.horizonDays,
        shocks: scenario.shocks as any
      });
    }
    console.log("✓ Created 5 stress scenarios");

    // 12. Create simulation run
    const [simulation] = await tx.insert(riskSimulations).values({
      portfolioId: portfolio.id,
      packId: pack.id,
      engine: "MONTE_CARLO",
      seed: 42,
      paths: 10000,
      horizonDays: 252,
      inputsSnapshot: {
        portfolio: { name: portfolio.name, aumMillions: 350 },
        sleeves: sleeveWeights,
        parameterPack: { version: 1, label: "Base Case v1" }
      } as any,
      createdBy: user.id
    }).returning();
    console.log("✓ Created simulation run");

    // 13. Create Metric #1: Max Drawdown Result
    await tx.insert(riskMaxDrawdownResults).values({
      simulationId: simulation.id,
      maxDdPct: "-18.00",
      recoveryTimeDays: 120,
      scope: "PORTFOLIO",
      sleeveType: null
    });
    console.log("✓ Created Max DD result: -18% (recovery 120 days)");

    // 14. Create Metric #2: LCR Result
    await tx.insert(riskLcrResults).values({
      simulationId: simulation.id,
      numeratorMillions: "13.50",
      denominatorMillions: "5.30",
      ratio: "1.40"
    });
    console.log("✓ Created LCR result: 1.40x");

    // 15. Create Metric #3: Crisis P&L Results
    const crisisPnlData = [
      { scenario: "2008 (Lehman)", pnl: "-19.00" },
      { scenario: "2020 (COVID)", pnl: "-12.00" },
      { scenario: "1970s (Stagflation)", pnl: "-15.00" },
      { scenario: "2022 (Rate Shock)", pnl: "-10.00" },
      { scenario: "Flash Crash", pnl: "-8.00" }
    ];

    for (const { scenario, pnl } of crisisPnlData) {
      await tx.insert(riskCrisisPnlResults).values({
        simulationId: simulation.id,
        scenarioName: scenario,
        pnlPct: pnl,
        scope: "PORTFOLIO",
        sleeveType: null
      });
    }
    console.log("✓ Created Crisis P&L results (5 scenarios)");

    // 16. Create Metric #4: Expected Shortfall Result
    await tx.insert(riskEsResults).values({
      simulationId: simulation.id,
      es95Pct: "-13.00",
      es97Pct: "-17.00",
      tailRatio: "1.31"
    });
    console.log("✓ Created ES result: ES95=-13%, ES97.5=-17%");

    // 17. Create Metric #5: CSI Result
    await tx.insert(riskCsiResults).values({
      simulationId: simulation.id,
      correlationValue: "-0.2800",
      regimeFlag: "NORMAL"
    });
    console.log("✓ Created CSI result: -0.28 (NORMAL)");

    // 18. Create Governance Review (compliant)
    await tx.insert(riskGovernanceReviews).values({
      portfolioId: portfolio.id,
      simulationId: simulation.id,
      compliant: "true",
      breaches: [] as any,
      recommendations: [
        "Portfolio within all risk limits",
        "Monitor liquidity buffer - currently healthy at 1.4x",
        "Growth sleeve concentration acceptable at 45%"
      ] as any
    });
    console.log("✓ Created governance review (compliant)");

    // 19. Create Audit Logs
    await tx.insert(riskAuditLogs).values([
      {
        organizationId: org.id,
        userId: user.id,
        entity: "PORTFOLIO",
        entityId: portfolio.id,
        action: "CREATE",
        before: null,
        after: { name: portfolio.name, aumMillions: 350 } as any
      },
      {
        organizationId: org.id,
        userId: user.id,
        entity: "PARAMETER_PACK",
        entityId: pack.id,
        action: "CREATE",
        before: null,
        after: { version: 1, label: "Base Case v1" } as any
      },
      {
        organizationId: org.id,
        userId: user.id,
        entity: "SIMULATION",
        entityId: simulation.id,
        action: "CREATE",
        before: null,
        after: { engine: "MONTE_CARLO", paths: 10000 } as any
      }
    ]);
    console.log("✓ Created audit log entries");

    console.log("\n✅ Risk Module seed data complete! (Transactional)");
    console.log(`   Organization: ${org.name}`);
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Portfolio: ${portfolio.name} ($${portfolio.aumMillions}M AUM)`);
    console.log(`   Simulation: ${simulation.id}`);
    console.log(`   5 Metrics: MAX_DD=-18%, LCR=1.40x, Crisis P&L (5 scenarios), ES97.5=-17%, CSI=-0.28`);

    return {
      organization: org,
      user,
      portfolio,
      parameterPack: pack,
      simulation
    };
  });
}
