import { RummageService } from './rummage';

async function main() {
  console.log('⚙️ Collecting Data...');
  const collector = new RummageService();
  await collector.generateRSS();
  console.log('✅ Data Collection Completed.');
}

main().catch((error: unknown) => {
  console.error('An error occurred:', error);
});
