//create variable to hold db connection
let db;

//estzablish connection to indexedDb and set it to version 1
const request = indexedDB.open('budget_tracker', 1);

//will run if db version changes
request.onupgradeneeded = function (event) {
    //store locally scoped connection to db
    const db = event.target.result;
    db.createObjectStore('new_transaction', {autoIncrement: true });
};

//when successful
request.onsuccess = function(event) {
    //update global variable
    db = event.target.result;

    //check if app is online
    if (navigator.onLine) {
        uploadtransaction();
    }
};

//when failed
request.onerror = function(event) {
    //log err to console
    console.log(event.target.errorCode);
};

//will run if a transaction is submitted w no internet connection
function saveRecord(record) {
    //starts new transaction with ['db_name'] and 'readwrite' permissions
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    //access object store for new transaction
    const transactionObjectStore = transaction.objectStore('new_transaction');

    //add record to your store with add method
    transactionObjectStore.add(record);
}

function uploadtransaction() {
    //open transaction
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    //access object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    //set store records to variable
    const getAll = transactionObjectStore.getAll();

    //runs when .getAll is successful
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
          fetch('/api/transactions', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
              // open one more transaction
              const transaction = db.transaction(['new_transaction'], 'readwrite');
              // access the new_transaction object store
              const transactionObjectStore = transaction.objectStore('new_transaction');
              // clear all items in your store
              transactionObjectStore.clear();
    
              alert('All saved transaction has been submitted!');
            })
            .catch(err => {
              console.log(err);
            });
        }
    }    
};

//listen for online connections
window.addEventListener('online', uploadtransaction);