
// db.collection('courses').get().then(x => console.log(x.docs));

const COURSE_LIST_URL = 'https://my.uq.edu.au/programs-courses/search.html?keywords=course&searchType=all&archived=false';
const CORS_ANYWHERE = 'http://localhost:8080/';


window.authenticate = () => auth.currentUser || auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); 

function updateList() {
  fetch(
    CORS_ANYWHERE + COURSE_LIST_URL,
    {headers: {'X-Requested-With': 'XMLHttpRequest'}}
  ).then(x => x.text()).then(data => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const codes = Array.from(doc.querySelectorAll('.listing a.code')).map(x => x.textContent.trim());

    listRef.doc('codes').set({data: codes}).then(console.log);

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
  });
}

function updateDetails() {
  coursesRef.get().then(snapshot => {
    snapshot.forEach()
  })
}

// updateList();