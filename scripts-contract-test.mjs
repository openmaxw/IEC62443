import assert from 'node:assert/strict';
import { normalizeIntegratorPlan } from './src/domain/schema/integratorPlan.js';
import { normalizeSelectionResults } from './src/domain/schema/selectionResults.js';
import { normalizeOwnerAssessment } from './src/domain/schema/ownerAssessment.js';
import { getDashboardViewModel } from './src/domain/viewModels/dashboardVendorViewModels.js';
import { getSelectionViewModel, getReportCenterViewModel } from './src/domain/viewModels/selectionReportViewModels.js';
import { getOwnerResultViewModel, getIntegratorResultViewModel } from './src/domain/viewModels/resultViewModels.js';

function testNormalizeOwnerAssessment() {
  const result = normalizeOwnerAssessment({ criticalAssets: undefined, keySystems: 123 });
  assert.deepEqual(result.criticalAssets, []);
  assert.equal(result.keySystems, '');
  assert.equal(result.externalConnections, '');
}

function testNormalizeIntegratorPlan() {
  const result = normalizeIntegratorPlan({ targetSL: 2 });
  assert.equal(result.targetSL, 2);
  assert.deepEqual(result.zones, []);
  assert.deepEqual(result.assets, []);
  assert.deepEqual(result.communicationFlows, []);
  assert.deepEqual(result.capabilityRequirements, []);
  assert.ok(result.designBasisSummary);
}

function testNormalizeSelectionResults() {
  const result = normalizeSelectionResults({});
  assert.deepEqual(result.results, []);
  assert.deepEqual(result.summary, {
    native: 0,
    configured: 0,
    external: 0,
    compensating: 0,
    missing: 0,
    overallScore: 0
  });
}

function testDashboardViewModelSubstepsFallback() {
  const viewModel = getDashboardViewModel({
    projectMeta: {},
    assessment: null,
    riskProfile: null,
    plan: null,
    capabilities: [],
    matchResults: null,
    progress: {
      completed: 0,
      total: 6,
      stageStatus: { owner: false, integrator: false, vendor: false, selection: false },
      substeps: {
        owner: { completed: 0, total: 5 },
        integrator: { completed: 0, total: 5 },
        vendor: { completed: 0, total: 5 },
        selection: { completed: 0, total: 5 }
      }
    },
    missingInputs: [],
    nextAction: null
  });

  viewModel.cards.forEach((card) => {
    assert.ok(Array.isArray(card.substeps.items));
  });
}

function testOwnerResultViewModelFallback() {
  const viewModel = getOwnerResultViewModel({ projectMeta: {}, assessment: null, riskProfile: null });
  assert.equal(viewModel.hasAssessment, false);
  assert.deepEqual(viewModel.ownerRequirements, []);
  assert.deepEqual(viewModel.acceptanceFocus, []);
  assert.deepEqual(viewModel.criticalAssets, []);
}

function testIntegratorResultViewModelFallback() {
  const viewModel = getIntegratorResultViewModel({ projectMeta: {}, assessment: null, plan: null });
  assert.equal(viewModel.hasPlan, false);
  assert.equal(viewModel.summary.zoneCount, 0);
  assert.deepEqual(viewModel.assets, []);
  assert.deepEqual(viewModel.communicationFlows, []);
  assert.deepEqual(viewModel.capabilityRequirements, []);
}

function testSelectionViewModelFallback() {
  const viewModel = getSelectionViewModel({
    projectMeta: {},
    plan: { capabilityRequirements: [] },
    capabilities: [],
    gapClosureItems: null,
    matchResults: null
  });
  assert.deepEqual(viewModel.selection.rows, []);
  assert.deepEqual(viewModel.gapItems, []);
  assert.equal(viewModel.closedCount, 0);
}

function testReportCenterViewModelFallback() {
  const viewModel = getReportCenterViewModel({
    projectMeta: {},
    riskProfile: null,
    plan: null,
    capabilities: [],
    matchResults: null,
    gapClosureItems: null
  });
  assert.ok(Array.isArray(viewModel.items));
  assert.deepEqual(viewModel.gapRows, []);
  assert.deepEqual(viewModel.gapClosureItems, []);
  assert.equal(viewModel.highRiskCount, 0);
}

function run() {
  testNormalizeOwnerAssessment();
  testNormalizeIntegratorPlan();
  testNormalizeSelectionResults();
  testDashboardViewModelSubstepsFallback();
  testOwnerResultViewModelFallback();
  testIntegratorResultViewModelFallback();
  testSelectionViewModelFallback();
  testReportCenterViewModelFallback();
  console.log('contract tests passed');
}

run();
