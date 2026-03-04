const { exec } = require('child_process');

// Script to run Prettier and ESLint on the src directory
console.log('Running Prettier...');
exec('npx prettier --write src/**/*.js', (err, stdout, stderr) => {
  if (err) {
    console.error(`Prettier error: ${stderr}`);
    process.exit(1);
  }
  console.log(stdout);

  console.log('Running ESLint fix...');
  exec('npx eslint --fix src/**/*.js', (err2, stdout2, stderr2) => {
    if (err2) {
      console.error(`ESLint error: ${stderr2}`);
      process.exit(1);
    }
    console.log(stdout2);
    console.log('Code formatting and linting completed successfully!');
  });
});