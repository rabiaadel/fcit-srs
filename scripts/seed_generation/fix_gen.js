const fs = require('fs');
let f = fs.readFileSync('scratch/gen_students_seed.js', 'utf8');
f = f.replace(/\\\$/g, '$').replace(/\\\`/g, '\`');
fs.writeFileSync('scratch/gen_students_seed.js', f);
console.log('Fixed');
