import Dexie from 'dexie';

// Membuat instance database
export const db = new Dexie('kasirAppDatabase');

// Mendefinisikan struktur (schema) database
db.version(1).stores({
  // 'products' adalah nama tabel (object store)
  // '++id' berarti id akan menjadi primary key yang auto-increment
  // 'name' adalah properti lain yang ingin kita index untuk pencarian cepat
  products: '++id, name', 
});