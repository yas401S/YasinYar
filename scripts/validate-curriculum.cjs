const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'app/src/main/assets/curriculum-content.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox, { timeout: 3000 });
const packs = sandbox.window.YASINYAR_CURRICULUM;
if (!packs || typeof packs !== 'object') throw new Error('YASINYAR_CURRICULUM is missing');
const map = JSON.parse(fs.readFileSync(path.join(root, 'data/curriculum-map.json'), 'utf8'));
if (!Array.isArray(map.grades) || map.grades.length !== 9) throw new Error('Curriculum map must include grades 1–9');
const errors = []; let lessonCount = 0; let exerciseCount = 0;
for (let grade = 1; grade <= 9; grade++) {
  const entry = map.grades.find(x => x.grade === grade);
  if (!entry || !Array.isArray(entry.books) || !Array.isArray(entry.authored_packages)) errors.push('Grade ' + grade + ': invalid map entry');
  const subjects = packs[String(grade)] || {};
  for (const [subject, topics] of Object.entries(subjects)) for (const [topic, lesson] of Object.entries(topics || {})) {
    lessonCount++;
    for (const key of ['title','goals','prerequisites','explanation','examples','mistakes','keyPoints','exercises']) if (!(key in lesson)) errors.push(grade+'/'+subject+'/'+topic+': missing '+key);
    if (!Array.isArray(lesson.examples) || lesson.examples.length < 1) errors.push(grade+'/'+topic+': needs a worked example');
    if (!Array.isArray(lesson.exercises) || lesson.exercises.length < 5) errors.push(grade+'/'+topic+': needs at least 5 exercises');
    const levels = new Set((lesson.exercises || []).map(ex => ex.level));
    for (const level of ['آسان','متوسط','چالشی']) if (!levels.has(level)) errors.push(grade+'/'+topic+': missing '+level+' exercise');
    for (const ex of lesson.exercises || []) { exerciseCount++; for (const key of ['level','q','answer','explain']) if (!ex[key]) errors.push(grade+'/'+topic+': exercise missing '+key); }
    for (const ex of lesson.examples || []) for (const key of ['title','problem','steps','answer']) if (!ex[key]) errors.push(grade+'/'+topic+': example missing '+key);
  }
}
if (errors.length) { console.error(errors.join('\\n')); process.exit(1); }
console.log('Curriculum validation passed: 9 grades, ' + lessonCount + ' authored lessons, ' + exerciseCount + ' exercises. Official book/chapter coverage remains separate and is not inferred.');
