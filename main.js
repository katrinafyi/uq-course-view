'use strict';

const db = firebase.firestore();
const auth = firebase.auth();

const coursesRef = db.collection('courses');
const cacheRef = db.collection('cache');

const state = {};

function makeEl(tag, text) {
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
}

function renderRow(course) {
  const row = document.createElement('tr');
  const q = x => row.querySelector(x);
  ['code', 'name', 'units'].forEach((x, i) => {
    row.appendChild(makeEl(i == 0 ? 'th' : 'td', course[x]));
  });
  row.appendChild(
    makeEl('td', (course.currentOfferings || []).map(x => x.name).join('; ')));
  return row;
}

function renderTable(courses) {
  const fragment = document.createDocumentFragment();
  courses.forEach(c => fragment.appendChild(renderRow(c)));
  document.getElementById('results').appendChild(fragment);
}

cacheRef.doc('courses').onSnapshot(doc => {
  const data = doc.data();
  const courses = JSON.parse(pako.inflate(data.data, {to: 'string'}));
  const codes = Object.keys(courses);
  console.log(`Loaded ${codes.length} courses, updated ${data.updated.toDate()}.`);

  state.courses = courses;
  state.codes = codes;

  renderTable(Object.values(courses));
});