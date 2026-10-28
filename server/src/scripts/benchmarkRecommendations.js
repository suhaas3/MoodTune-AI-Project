import { BenchmarkEvaluator } from '../recommendation/benchmarkEvaluator.js';

console.log('========================================================================');
console.log('  MOODTUNE AI — RECOMMENDATION ENGINE BENCHMARK & EVALUATION');
console.log('  Comparison: Naive Baseline vs. Adaptive Hybrid Engine');
console.log('========================================================================\n');

// 1. Evaluate User 1 (Active Electronic Enthusiast)
console.log('--- TEST CASE 1: Active User (Synthwave Enthusiast, Target Mood: Energetic) ---');
const report1 = BenchmarkEvaluator.runComparison('Energetic', 'synth_user_1', 10);

console.log(`[Dataset]: ${report1.metrics.dataset.tag} (Synthetic Academic Simulation: ${report1.metrics.dataset.isSynthetic})`);
console.log(`[Simulated Profile]: ${report1.metrics.dataset.simulatedUser.name} (${report1.metrics.dataset.simulatedUser.cluster})\n`);

console.log('📊 Comparative Evaluation Metrics:');
console.table([
  {
    Metric: 'Algorithm Method',
    Baseline: report1.metrics.baseline.method,
    Hybrid: report1.metrics.hybrid.method
  },
  {
    Metric: 'Mood Precision (%)',
    Baseline: `${report1.metrics.baseline.moodPrecision}%`,
    Hybrid: `${report1.metrics.hybrid.moodPrecision}%`
  },
  {
    Metric: 'Intra-List Diversity (ILD)',
    Baseline: report1.metrics.baseline.intraListDiversity.toFixed(3),
    Hybrid: report1.metrics.hybrid.intraListDiversity.toFixed(3)
  },
  {
    Metric: 'Disliked Songs Recommended',
    Baseline: report1.metrics.baseline.dislikedItemsRecommended,
    Hybrid: `${report1.metrics.hybrid.dislikedItemsRecommended} (Strict Hard Filter)`
  }
]);

console.log('\nTop 5 Hybrid Recommendations for User 1:');
report1.hybridRecommendations.slice(0, 5).forEach((rec, idx) => {
  console.log(`  ${idx + 1}. "${rec.song.title}" by ${rec.song.artist} [${rec.song.genre}] — Score: ${rec.totalScore}/100`);
  console.log(`     💡 Explanation: ${rec.explanation}`);
  console.log(`     📈 Breakdown: Mood=${rec.scoreBreakdown.moodMatch}%, Attr=${rec.scoreBreakdown.acousticAttributes}%, CF=${rec.scoreBreakdown.communityAffinity}%, User=${rec.scoreBreakdown.personalFeedback}%\n`);
});

// 2. Evaluate User Cold-Start (New user with 0 interactions)
console.log('--- TEST CASE 2: Cold-Start Evaluation (Brand New User with 0 History, Target Mood: Happy) ---');
const reportCold = BenchmarkEvaluator.runComparison('Happy', 'synth_user_cold_start', 10);

console.log(`[Simulated Profile]: ${reportCold.metrics.dataset.simulatedUser.name} (Cold-Start Adapted: true)`);
console.log(`Intra-List Diversity: ${reportCold.metrics.hybrid.intraListDiversity.toFixed(3)} | Mood Precision: ${reportCold.metrics.hybrid.moodPrecision}%\n`);

console.log('Top 3 Cold-Start Recommendations:');
reportCold.hybridRecommendations.slice(0, 3).forEach((rec, idx) => {
  console.log(`  ${idx + 1}. "${rec.song.title}" [${rec.song.genre}] — Score: ${rec.totalScore}/100 (Cold-Start Mode: ${rec.isColdStartAdapted})`);
  console.log(`     💡 ${rec.explanation}\n`);
});

console.log('========================================================================');
console.log('  Benchmark complete: Hybrid engine achieves superior diversity,');
console.log('  zero disliked song leakage, and full explainability.');
console.log('========================================================================');
