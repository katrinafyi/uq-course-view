/**
 * @typedef {import("./types").Offering} Offering
 * @typedef {import("./types").CourseDetails} Course
 */

// const COURSE_LIST_URL = 'https://my.uq.edu.au/programs-courses/search.html?keywords=course&searchType=all&archived=false';
const COURSE_LIST_URL = 'http://localhost:5500/ugpg.html';
const COURSE_PAGE_URL = 'https://my.uq.edu.au/programs-courses/course.html?course_code=';
const CORS_ANYWHERE = 'http://localhost:8080/';

window.authenticate = (force) => (!force && auth.currentUser) || auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); 

function fetchHTML(url, cors=true) {
  return fetch((cors ? CORS_ANYWHERE : '') + url)
  .then(x => x.text())
  .then(x => {
    return new DOMParser().parseFromString(x, 'text/html');
  });
}

/** @returns {Promise<Course>} */
function updateList() {
  return fetchHTML(COURSE_LIST_URL).then(doc => {
    const courseData = Object.fromEntries(Array.from(doc.querySelectorAll('.listing a.code'))
    .map(x => {
      const code = x.textContent.trim();
      const d = {code, name: x.nextElementSibling.textContent.trim(), currentOfferings: []};
      d.level = doc.getElementById(`course-${code}-level`)?.textContent?.trim();
      d.units = doc.getElementById(`course-${code}-units`)?.textContent?.trim();
      return [code, d];
    }));

    const offerLinks = doc.querySelectorAll('a[href^="/programs-courses/course.html?course_code="]');
    offerLinks.forEach(a => {
      if (!a.href.includes('&offer=')) return;
      const [course, offerCode] = a.href.split('course_code=')[1].split('&offer=');
      courseData[course].currentOfferings.push({
        code: offerCode,
        name: a.textContent.trim(),
        location: a.parentElement.nextElementSibling.textContent.trim(),
        mode: a.parentElement.nextElementSibling.nextElementSibling.textContent.trim(),
      });
    });

    window.da = courseData;
    const s = pako.deflate(JSON.stringify(courseData), {to: 'string'});

    cacheRef.doc('list').set({deflate: s}).then(console.log);

    // let batch = null;
    // for (let i = 0; i < codes.length; i++) {
    //   if (batch == null) {
    //     batch = db.batch();
    //   }

    //   batch.set(coursesRef.doc(codes[i]), {}, {merge: true});

    //   if (i % 499 == 0) {
    //     batch.commit();
    //     batch = null;
    //   }
    // }
    // batch?.commit();
    return courseData;
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
}

/** @returns {Offering[]} */
function parseOfferings(table, archived) {
  const rows = table?.querySelectorAll('tbody tr');
  if (!rows) return [];
  return Array.from(rows).map(tr => {
    const [name, loc, mode, prof] = tr.querySelectorAll('td');
    const profLink = prof.querySelector('a');
    const [code, year] = name.querySelector('a').href.split('offer=')[1].split('&year=');
    return {
      code: code,
      year: year ?? name.textContent.split(', ')[1].trim(),
      archived: archived,
      name: name.textContent.trim(),
      location: loc.textContent.trim(),
      mode: mode.textContent.trim(),
      profile: profLink ? profLink.href : null,
    };
  })
}

/** @returns {Promise<Course>} */
function updateOne(code) {
  const basics = ['level', 'faculty', 'school', 'units', 'duration', 'contact',
   'incompatible', 'prerequisite', 'assessment-methods', 'coordinator', 'studyabroad'];

  return fetchHTML(COURSE_PAGE_URL + code)
  .then(doc => {
    const get = x => doc.getElementById('course-' + x);

    const d = {};
    d.code = code;
    d.name = get('title').textContent.trim().replace(` (${code})`, '');
    basics.forEach(x => {
      d[x] = get(x)?.textContent?.trim();
    });

    if (!d.studyabroad) {
      d.studyabroad = get('studyabroard')?.textContent?.trim();
    }

    d.description = get('summary').textContent.trim();
    d.offerings = [
      ...parseOfferings(get('current-offerings'), false),
      ...parseOfferings(get('archived-offerings'), true)];

    d.updated = new Date();

    console.log(d);
    return d;
  });
}

/** @returns {Promise<Course[]>} */
async function updateDetails(codes) {
  const result = [];
  for (const c of codes) {
    result.push(await updateOne(c));
    await sleep(5000);
  }
  return result;
}

updateList()
.then(x => shuffleArray(Object.keys(x)))
.then(courses => updateDetails(courses));