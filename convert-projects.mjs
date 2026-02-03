import fs from 'fs';

// Read the current projects.js from src
const projectsJsContent = fs.readFileSync('src/data/projects.js', 'utf-8');

// Extract SITE object
const siteMatch = projectsJsContent.match(/export const SITE = \{[\s\S]*?\n\};/);
const sitePart = siteMatch[0].replace('export const SITE = ', '').replace(/;$/, '');

// Extract PROJECTS array
const projectsMatch = projectsJsContent.match(/export const PROJECTS = \[[\s\S]*?\n\];/);
const projectsPart = projectsMatch[0].replace('export const PROJECTS = ', '').replace(/;$/, '');

// Create proper JSON by wrapping in a way that JavaScript can evaluate
const jsonContent = `{"SITE": ${sitePart}, "PROJECTS": ${projectsPart}}`;

// Write to public/data/projects.json
fs.writeFileSync('public/data/projects.json', jsonContent);

console.log('✓ Created public/data/projects.json');
