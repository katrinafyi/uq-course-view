'use strict';

const db = firebase.firestore();
const auth = firebase.auth();

const coursesRef = db.collection('courses');
const cacheRef = db.collection('cache');