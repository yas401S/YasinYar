const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = process.cwd();
const sandbox = {
  window: {},
  document: { readyState: 'loading', addEventListener() {} }
};
const files = [
  'curriculum-content.js',
  'grade1-world-study.js',
  'grade1-arts-pe.js',
  'grade1-farsi-expansion.js',
  'grade1-quran-expansion.js',
  'grade1-farsi-practice.js',
  'grade1-negarsh-expansion.js',
  'grade1-current-catalog.js',
  'grade2-current-catalog.js',
  'grade2-other-books.js',
  'grade3-current-catalog.js'
];
for (const file of files) {
  const full = path.join(root, 'app/src/main/assets', file);
  if (!fs.existsSync(full)) throw new Error('Missing curriculum asset: ' + file);
  vm.runInNewContext(fs.readFileSync(full, 'utf8'), sandbox, { timeout: 8000, filename: file });
}
const packs = sandbox.window.YASINYAR_CURRICULUM;
if (!packs || typeof packs !== 'object') throw new Error('YASINYAR_CURRICULUM is missing');
const catalog = sandbox.window.YASINYAR_GRADE1_CURRENT_CATALOG;
if (!catalog || catalog.year !== '۱۴۰۵–۱۴۰۶') throw new Error('Current grade 1 catalog metadata is missing');
const map = JSON.parse(fs.readFileSync(path.join(root, 'data/curriculum-map.json'), 'utf8'));
const grade1 = map.grades && map.grades.find(x => x.grade === 1);
if (!grade1 || !Array.isArray(grade1.books) || grade1.books.length !== 7) throw new Error('Grade 1 map must contain the seven current books');
if (map.curriculum_year !== '۱۴۰۵–۱۴۰۶') throw new Error('Curriculum year mismatch');
const errors = [];
let lessonCount = 0;
let exerciseCount = 0;
const expected = [
  ['فارسی', 40, 54],
  ['نگارش فارسی', 37, 37],
  ['ریاضی', 11, 11],
  ['جهان پیرامون', 18, 18],
  ['قرآن و هدیه‌های آسمان', 23, 23],
  ['هنر و خلاقیت', 17, 17],
  ['تربیت بدنی', 12, 12]
];
for (const [subject, officialCount, authoredCount] of expected) {
  const lessons = packs['1'] && packs['1'][subject];
  const current = Object.entries(lessons || {}).filter(([, lesson]) => lesson.catalogYear === '۱۴۰۵–۱۴۰۶');
  if (current.length !== authoredCount) errors.push(subject + ': expected ' + authoredCount + ' current lessons, found ' + current.length);
  const book = grade1.books.find(x => x.subject === subject);
  if (!book) errors.push(subject + ': missing book in curriculum map');
  else if (book.official_lesson_count !== officialCount) errors.push(subject + ': official lesson count mismatch');
  for (const [topic, lesson] of current) {
    lessonCount++;
    for (const key of ['title','goals','prerequisites','explanation','examples','mistakes','keyPoints','exercises','quiz','sourceNote']) {
      if (!(key in lesson)) errors.push(subject + '/' + topic + ': missing ' + key);
    }
    if (!Array.isArray(lesson.examples) || lesson.examples.length < 2) errors.push(subject + '/' + topic + ': needs 2 worked examples');
    if (!Array.isArray(lesson.exercises) || lesson.exercises.length < 5) errors.push(subject + '/' + topic + ': needs 5 exercises');
    if (!Array.isArray(lesson.quiz) || lesson.quiz.length < 2) errors.push(subject + '/' + topic + ': needs 2 quiz questions');
    const levels = new Set((lesson.exercises || []).map(ex => ex.level));
    for (const level of ['آسان','متوسط','چالشی']) if (!levels.has(level)) errors.push(subject + '/' + topic + ': missing ' + level + ' exercise');
    for (const ex of lesson.exercises || []) {
      exerciseCount++;
      for (const key of ['level','q','answer','explain']) if (!ex[key]) errors.push(subject + '/' + topic + ': exercise missing ' + key);
    }
    for (const ex of lesson.examples || []) for (const key of ['title','problem','steps','answer']) if (!ex[key]) errors.push(subject + '/' + topic + ': example missing ' + key);
  }
}
const index = fs.readFileSync(path.join(root, 'app/src/main/assets/index.html'), 'utf8');
if (!index.includes('<script src="grade1-current-catalog.js"></script>')) errors.push('Current catalog script is not loaded by the app');
if (!index.includes("1:['فارسی','نگارش فارسی','ریاضی','جهان پیرامون','قرآن و هدیه‌های آسمان','هنر و خلاقیت','تربیت بدنی']")) errors.push('Grade 1 subject selector does not match the current book set');
if (index.includes('<script src="grade1-math-expansion.js"></script>')) errors.push('Legacy 175-page math draft must not be loaded as the current book');
if (!index.includes('const curatedKeys=curatedPack?Object.keys(curatedPack):[];')) errors.push('Lesson selector does not read the curated curriculum pack');

const grade2Catalog = sandbox.window.YASINYAR_GRADE2_CURRENT_CATALOG;
if (!grade2Catalog || grade2Catalog.year !== '۱۴۰۵–۱۴۰۶') errors.push('Current grade 2 catalog metadata is missing');
const expectedGrade2 = [['ریاضی دوست‌داشتنی',13],['جهان پیرامون',18],['فارسی می‌نویسم',11],['من و دوستم خدا',10],['ریاضی',8],['علوم',14],['فارسی',17],['نگارش فارسی',17],['آموزش قرآن',14],['هدیه‌های آسمان',20]];
let grade2LessonCount = 0;
let grade2ExerciseCount = 0;
for (const [subject, count] of expectedGrade2) {
  const lessons = packs['2'] && packs['2'][subject];
  const entries = Object.entries(lessons || {});
  if (entries.length !== count) errors.push('Grade 2 ' + subject + ': expected ' + count + ' packs, found ' + entries.length);
  for (const [topic, lesson] of entries) {
    grade2LessonCount++;
    for (const key of ['title','goals','prerequisites','explanation','examples','mistakes','keyPoints','exercises','quiz','sourceNote']) {
      if (!(key in lesson)) errors.push('Grade 2 ' + subject + '/' + topic + ': missing ' + key);
    }
    if (!Array.isArray(lesson.examples) || lesson.examples.length < 2) errors.push('Grade 2 ' + subject + '/' + topic + ': needs 2 worked examples');
    if (!Array.isArray(lesson.exercises) || lesson.exercises.length < 5) errors.push('Grade 2 ' + subject + '/' + topic + ': needs 5 exercises');
    if (!Array.isArray(lesson.quiz) || lesson.quiz.length < 2) errors.push('Grade 2 ' + subject + '/' + topic + ': needs 2 quiz questions');
    for (const ex of lesson.exercises || []) {
      grade2ExerciseCount++;
      for (const key of ['level','q','answer','explain']) if (!ex[key]) errors.push('Grade 2 ' + subject + '/' + topic + ': exercise missing ' + key);
    }
    for (const ex of lesson.examples || []) for (const key of ['title','problem','steps','answer']) if (!ex[key]) errors.push('Grade 2 ' + subject + '/' + topic + ': example missing ' + key);
  }
}
if (!index.includes('<script src="grade2-current-catalog.js"></script>')) errors.push('Grade 2 math catalog script is not loaded');
if (!index.includes('<script src="grade2-other-books.js"></script>')) errors.push('Grade 2 other books script is not loaded');
if (!index.includes('<script src="grade2-official-books.js"></script>')) errors.push('Grade 2 official books script is not loaded');
if (!index.includes("2:['ریاضی','علوم','فارسی','نگارش فارسی','آموزش قرآن','هدیه‌های آسمان','ریاضی دوست‌داشتنی','جهان پیرامون','فارسی می‌نویسم','من و دوستم خدا']")) errors.push('Grade 2 subject selector does not match the ten-book set');


const grade3Catalog = sandbox.window.YASINYAR_GRADE3_CURRENT_CATALOG;
if (!grade3Catalog || grade3Catalog.year !== '۱۴۰۵–۱۴۰۶') errors.push('Current grade 3 catalog metadata is missing');
const expectedGrade3 = [['ریاضی',40],['علوم',14],['فارسی',17],['نگارش فارسی',17],['آموزش قرآن',3],['هدیه‌های آسمان',20],['مطالعات اجتماعی',23]];
let grade3LessonCount = 0;
let grade3ExerciseCount = 0;
for (const [subject, count] of expectedGrade3) {
  const entries = Object.entries((packs['3'] && packs['3'][subject]) || {});
  if (entries.length !== count) errors.push('Grade 3 ' + subject + ': expected ' + count + ' packs, found ' + entries.length);
  for (const [topic, lesson] of entries) {
    grade3LessonCount++;
    for (const key of ['title','goals','prerequisites','explanation','examples','mistakes','keyPoints','exercises','quiz','sourceNote']) if (!(key in lesson)) errors.push('Grade 3 ' + subject + '/' + topic + ': missing ' + key);
    if (!Array.isArray(lesson.examples) || lesson.examples.length < 2) errors.push('Grade 3 ' + subject + '/' + topic + ': needs 2 worked examples');
    if (!Array.isArray(lesson.exercises) || lesson.exercises.length < 5) errors.push('Grade 3 ' + subject + '/' + topic + ': needs 5 exercises');
    if (!Array.isArray(lesson.quiz) || lesson.quiz.length < 2) errors.push('Grade 3 ' + subject + '/' + topic + ': needs 2 quiz questions');
    for (const ex of lesson.exercises || []) { grade3ExerciseCount++; for (const key of ['level','q','answer','explain']) if (!ex[key]) errors.push('Grade 3 ' + subject + '/' + topic + ': exercise missing ' + key); }
    for (const ex of lesson.examples || []) for (const key of ['title','problem','steps','answer']) if (!ex[key]) errors.push('Grade 3 ' + subject + '/' + topic + ': example missing ' + key);
  }
}
if (!index.includes('<script src="grade3-current-catalog.js"></script>')) errors.push('Grade 3 curriculum script is not loaded');
if (!index.includes("3:['فارسی','نگارش فارسی','ریاضی','علوم','آموزش قرآن','هدیه‌های آسمان','مطالعات اجتماعی']")) errors.push('Grade 3 subject selector does not match the current book set');

const bookshelf = fs.readFileSync(path.join(root, 'app/src/main/assets/grade1-bookshelf.js'), 'utf8');
for (const id of ['read','write','math','world','quran','art','move']) if (!bookshelf.includes("id:'" + id + "'")) errors.push('Bookshelf missing current book: ' + id);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Grade 1 curriculum validation passed: 7 books, ' + lessonCount + ' current lesson packs, ' + exerciseCount + ' exercises; grade 2: ' + grade2LessonCount + ' lesson packs and ' + grade2ExerciseCount + ' exercises. Official PDF page-by-page answer verification remains explicitly pending.');
