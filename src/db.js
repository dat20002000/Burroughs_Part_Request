// db.js
import Dexie from 'dexie';

export const db = new Dexie('myDatabase');

// db.delete().then(()=>db.open())

db.version(1).stores({
  part: '++id', // Primary key and indexed props
});

db.version(2).stores({
  partRequest: '++id', // Primary key and indexed props
  part: '++id, tranid', // Primary key and indexed props
});

db.version(3).stores({
  partRequest: '++id', // Primary key and indexed props
  part: '++id, tranid, item', // Primary key and indexed props
});

db.version(4).stores({
  partRequest: '++id', // Primary key and indexed props
  part: '++, tranid, item', // Primary key and indexed props
});

db.version(5).stores({
  partRequest: '++id', // Primary key and indexed props
  part: '++, tranid, item, [tranid+item]', // Primary key and indexed props
  notes: '++', // Primary key and indexed props
});