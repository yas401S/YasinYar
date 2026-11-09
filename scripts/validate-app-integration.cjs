const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const assets = path.join(root, 'app/src/main/assets');
const html = fs.readFileSync(path.join(assets, 'index.html'), 'utf8');
const errors = [];

for (const match of html.matchAll(/<script src="([^"]+)"/g)) {
  const src = match[1];
  if (/^https?:\/\//i.test(src)) continue;
  if (!fs.existsSync(path.join(assets, src))) errors.push('Missing local script asset: ' + src);
}

const inlineHandlers = [...html.matchAll(/\bonclick\s*=\s*["']([^"']+)["']/g)].map(x => x[1]);
const declared = new Set([
  ...[...html.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(x => x[1]),
  ...[...html.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/g)].map(x => x[1])
]);
for (const handler of inlineHandlers) {
  for (const match of handler.matchAll(/(?:^|[;{}]\s*)([A-Za-z_$][\w$]*)\s*\(/g)) {
    if (!declared.has(match[1]) && !['if','for','while','switch'].includes(match[1])) {
      errors.push('Inline button handler has no declared function: ' + match[1]);
    }
  }
}

for (const id of [
  'gradeSelect','subjectSelect','questionImageCamera','questionImageGallery',
  'questionPreview','ocrButton','solveImageButton','ocrStatus','photoAnswer',
  'aiGrade','aiSubject','aiSolveButton','aiStatus','aiAnswer',
  'lessonTopicSelect','lessonExplainButton','lessonAiStatus','lessonAiAnswer'
]) {
  if (!html.includes('id="' + id + '"')) errors.push('Missing required UI element: #' + id);
}
for (const fn of [
  'initGrades','updateSubjects','loadLesson','explainLessonWithAI',
  'solveWithAI','solvePhotoQuestion','solveImageDirect','imageToDataUrls',
  'rectifyYasinDocument','receiveCameraPhoto','receiveCameraPhotoError'
]) {
  if (!new RegExp('\\bfunction\\s+' + fn + '\\s*\\(').test(html)) errors.push('Missing required app function: ' + fn);
}
for (let grade = 1; grade <= 9; grade++) {
  if (!html.includes(grade + ':[')) errors.push('Missing subject configuration for grade ' + grade);
  if (!html.includes('<option value="' + grade + '"')) errors.push('Missing AI grade option ' + grade);
}
if (!html.includes("fetch(YASINYAR_AI_WORKER+'/solve'")) errors.push('Image solve endpoint is not wired');
if (!html.includes("fetch(YASINYAR_AI_WORKER+'/lesson'")) errors.push('Lesson generation endpoint is not wired');
if (!html.includes('grade4-current-catalog.js')) errors.push('Grade 4 catalog is not loaded');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('App integration validation passed: ' + inlineHandlers.length + ' inline click handlers, local assets, camera/AI UI wiring, and grade selectors 1–9.');
