// scripts/check-deps.js
const fs = require('fs');
const path = require('path');

const PROJECTS = [
  '.', // root
  'frontend',
  'backend',
];

function loadPackageJson(dir) {
  const file = path.join(dir, 'package.json');
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function savePackageJson(dir, obj) {
  const file = path.join(dir, 'package.json');
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
}

function checkAndFixDeps(base, target, dir, section) {
  if (!target[section]) return;

  Object.entries(base[section] || {}).forEach(([dep, baseVersion]) => {
    const actual = target[section][dep];

    if (actual && actual !== baseVersion) {
      console.log(
        `${dir} has wrong version for ${dep}: ${actual} → ${baseVersion}`
      );
      target[section][dep] = baseVersion;
    }
  });
}

function main() {
  const base = loadPackageJson('.');

  PROJECTS.forEach((dir) => {
    const pkg = loadPackageJson(dir);

    ['dependencies', 'devDependencies', 'peerDependencies'].forEach((section) =>
      checkAndFixDeps(base, pkg, dir, section)
    );

    savePackageJson(dir, pkg);
  });

  console.log('Dependencies checked and normalized.');
}

main();
