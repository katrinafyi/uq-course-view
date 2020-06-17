'use strict';

const db = firebase.firestore();
const auth = firebase.auth();

const coursesRef = db.collection('courses');
const listRef = db.collection('lists');