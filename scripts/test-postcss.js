const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const fs = require('fs');

async function test() {
  const css = fs.readFileSync('src/app/globals.css', 'utf8');
  try {
    const result = await postcss([tailwind()]).process(css, {
      from: 'src/app/globals.css',
      to: 'dist/output.css',
    });
    console.log('PostCSS success! Output length:', result.css.length);
    console.log('Includes .flex:', result.css.includes('flex'));
    console.log('Sample output:');
    console.log(result.css.slice(result.css.length - 1000));
  } catch (e) {
    console.error('PostCSS error:', e);
  }
}

test();
