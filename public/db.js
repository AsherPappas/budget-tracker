//mongodb+srv://asher:<password>@cluster0.tasqq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
//Replace <password> with the password for the asher user. Replace myFirstDatabase with the name of the database that connections will use by default. 
//Ensure any option params are URL encoded.
//const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://asher:<password>@cluster0.tasqq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
let db
const request = indexedDB.open('transaction', 1)

request.onupgradeneeded = ({ target }) => {
  db = target.result
  db.createObjectStore('pending', { autoIncrement: true })
}

request.onsuccess = ({ target }) => {
  db = target.result

  if (navigator.onLine) {
    checkDatabase()
  }
}

request.onerror = event => {
  console.log(event.target.errorCode)
}

const saveRecord = record => {
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')
  store.add(record)
}

const checkDatabase = () => {
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')
  const getAll = store.getAll()

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      axios.post('/api/transaction/bulk', getAll.result)
        .then(() => {
          const transaction = db.transaction(['pending'], 'readwrite')
          const store = transaction.objectStore('pending')
          store.clear()
        })
    }
  }
}

window.addEventListener('online', checkDatabase)