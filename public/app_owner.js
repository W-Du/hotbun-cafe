const getAllButton = document.getElementById('getall');
const datePicker = document.getElementById('calendar');
const container = document.querySelector('#container');
const message = document.getElementById('message');
const dropdownTime = document.getElementById('dropdownTime');
const clearButton = document.getElementById('clear');
const resultTable = document.getElementById('result');

//helper functions
//remove data dated before today
function deletePastData() {
  $.ajax({
    url: '/owner/helper/expired',
    type: "DELETE",
    success: (response) => {
      message.textContent = 'Data of past days deleted'
    },
    error: (err) => {
      renderError(err)
    }
  })
}

function disablePastDates() {
  const today = new Date().toISOString().split('T')[0];
  datePicker.min = today;
}

//create delete button for each row
function createDeleteButton (row) {
  const deleteBtn = document.createElement('button')
  deleteBtn.innerText = "X"
  deleteBtn.setAttribute('class', 'deleteRow')
  deleteBtn.setAttribute('rowID', row.id)
  return deleteBtn;
}

//delete a reservation from database
function requestDeleteReservation (btn) {
  const id = btn.getAttribute('rowID')
  
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/owner/reservations/delete-row?id=' + id,
      type: 'DELETE',
      dataType: 'json',
      success: (response) => {
        resolve('delete sucess')
      },
      error: (err) => {
        reject(err)
      }
    })
  })
}

//clear table
function clearTable(table) {
  while(table.rows.length > 1){
    table.deleteRow(1);
  }
}

function createDeleteButton (row) {
  const deleteBtn = document.createElement('button')
  deleteBtn.innerText = "X"
  deleteBtn.setAttribute('class', 'deleteRow')
  deleteBtn.setAttribute('rowID', row.id)
  return deleteBtn;
}


//populate table
function populateTable(results) {
  const cellArray = ['id', 'date', 'time', 'num_ppl', 'order_type', 'name', 'email', 'message'];
  results.forEach(row => {
    const tableRow = document.createElement('tr')
    for(let i = 0; i < cellArray.length; i++){
      const td = document.createElement('td');
      //modify 'date'
      if(cellArray[i] === 'date'){
        td.textContent = row.date.split('T')[0]
      } else {
        td.textContent = row[cellArray[i]]
      }
      tableRow.appendChild(td);
    }
    tableRow.setAttribute('rowId', row.id)

    //delete button
    const b = createDeleteButton(row)
    b.addEventListener('click', (e) => {
      e.preventDefault();
      if(confirm(`Do you want to delete reservation on ${row.date}?`)){
        requestDeleteReservation(b)
        .then((response) => {
          tableRow.remove()
          message.innerHTML = 'reservation with id ' 
          + row.id + ' on ' + date + ' is deleted.'
        }).catch((e) => {
          console.log(e)
        })
      }
    })
    tableRow.appendChild(b)
    resultTable.appendChild(tableRow);
  })
}

//render result
const renderResults = (results, emptyMessage = '') => {
  container.innerHTML = ''
  message.innerHTML = ''
  resultTable.style.display = 'block';
  clearTable(resultTable);
  if (results.length > 0) {
    populateTable(results);
  } else {
    container.innerHTML = `<p> ${emptyMessage} </ps>`
  }
}


const renderError = err => {
  container.innerHTML = ''
  container.innerHTML = `<p>Your request returned an error from the server: </p>
  <p>Code: ${err.status}</p>
  <p>${err.statusText}</p>`;
}



// onload
$(document).ready(function() {
  disablePastDates();
  deletePastData();
  if(!datePicker.value){
    dropdownTime.disabled = true;
  }
  resultTable.style.display = 'none';
})


//get all
getAllButton.addEventListener('click', () => {
  // Fetch data from the back end API using the fetch() function
  fetch('/owner/reservations')
    .then(response => {
      return response.json()
    })
    .then(data => {
      renderResults(data, 'There is no reservation')
    })
    .catch(error => {
      container.innerHTML += error
    });
});

let resultByDate;
//get by date
datePicker.addEventListener('change', (evt) => {
  evt.preventDefault();
  const selectedDate = new Date(datePicker.value).toISOString().split('T')[0];
  //message.textContent = selectedDate
  
  $.ajax({
    url:`/owner/reservations/by?date=${selectedDate}`,
    type: 'GET',
    dataType: 'json',
    success: function(results) {
      renderResults(results, `No reservation on ${selectedDate}`)
      resultByDate = results
      dropdownTime.disabled = false;
    },
    error: function(err) {
      renderError(err)
    }
  })
});

clearButton.addEventListener('click', (e) => {
  datePicker.value = ''
  dropdownTime.disabled = true;
  container.innerHTML = '';
  clearTable(resultTable);
  resultTable.style.display = 'none';
});

dropdownTime.addEventListener('change',(e) => {
  e.preventDefault();
  let resultByTime = []
  if(!dropdownTime.value){
    resultByTime = resultByDate;
  }
  let time = Number(dropdownTime.value.split(':')[0]);
  message.textContent += time
  let timeUp = time + 2;
  
  resultByDate.forEach(res => {
    resTime = Number(res['time'].split(':')[0])
    if(resTime >= time && resTime < timeUp){
      resultByTime.push(res)
    }
  })
  if(resultByTime.length > 0){
    renderResults(resultByTime)
  } else {
    resultTable.style.display='none'
    container.innerHTML = 'No reservation made for these hours'
  }
});

