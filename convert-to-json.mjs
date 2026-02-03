import fs from 'fs';
import { SITE, PROJECTS } from './src/data/projects.js';

const data = { SITE, PROJECTS };
fs.writeFileSync('public/data/projects.json', JSON.stringify(data, null, 2));
console.log('✓ Created public/data/projects.json');
