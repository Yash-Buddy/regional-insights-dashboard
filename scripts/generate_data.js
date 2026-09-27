import { faker } from '@faker-js/faker';
import fs from 'fs';

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming"
];

const INDUSTRIES = ["Tech", "Healthcare", "Manufacturing", "Retail", "Agriculture", "Finance"];
const EDUCATION_LEVELS = ["High School", "Bachelor's", "Graduate"];
const EMPLOYMENT_STATUS = ["Employed", "Unemployed", "Underemployed"];
const INCOME_BRACKETS = ["<$40k", "$40k-$80k", "$80k-$120k", "$120k+"];

const regions = STATES.map(state => {
  const medianIncome = faker.number.int({ min: 35000, max: 95000 });
  const educationPct = faker.number.int({ min: 20, max: 65 });
  const employmentRate = faker.number.float({ min: 0.85, max: 0.98, precision: 0.001 });
  const population = faker.number.int({ min: 500000, max: 20000000 });

  const industryMix = {};
  let remaining = 100;
  INDUSTRIES.forEach((ind, i) => {
    const isLast = i === INDUSTRIES.length - 1;
    const val = isLast ? remaining : faker.number.int({ min: 5, max: Math.max(5, remaining - 5 * (INDUSTRIES.length - i - 1)) });
    industryMix[ind] = val;
    remaining -= val;
  });

  return {
    state,
    medianIncome,
    educationPct,
    employmentRate: +employmentRate.toFixed(3),
    population,
    industryMix
  };
});

const flows = [];
for (let i = 0; i < 300; i++) {
  flows.push({
    education: faker.helpers.arrayElement(EDUCATION_LEVELS),
    employment: faker.helpers.arrayElement(EMPLOYMENT_STATUS),
    income: faker.helpers.arrayElement(INCOME_BRACKETS),
    count: faker.number.int({ min: 1, max: 50 })
  });
}

const points = [];
for (let i = 0; i < 2000; i++) {
  points.push({
    lat: faker.number.float({ min: 25, max: 49, precision: 0.0001 }),
    lng: faker.number.float({ min: -124, max: -67, precision: 0.0001 }),
    value: faker.number.int({ min: 1, max: 100 })
  });
}

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/regions.json', JSON.stringify(regions, null, 2));
fs.writeFileSync('src/data/flows.json', JSON.stringify(flows, null, 2));
fs.writeFileSync('src/data/points.json', JSON.stringify(points, null, 2));

console.log(`Generated: ${regions.length} regions, ${flows.length} flows, ${points.length} points`);
