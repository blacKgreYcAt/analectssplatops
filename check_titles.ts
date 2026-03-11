
import { lessons, zhuyinDict } from './src/data/lessons';

const allChars = new Set();
lessons.forEach(l => {
  l.book.split('').forEach(c => allChars.add(c));
  l.title.split('').forEach(c => allChars.add(c));
  l.originalText.split('').forEach(c => allChars.add(c));
  l.storyTitle.split('').forEach(c => allChars.add(c));
});

const missing = [];
allChars.forEach(c => {
  if (!zhuyinDict[c] && !/[\w\s\-]/.test(c)) {
    missing.push(c);
  }
});

console.log('Missing characters count:', missing.length);
console.log('Missing characters:', missing.join(', '));
