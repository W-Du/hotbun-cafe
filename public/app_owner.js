const getAllButton = document.getElementById('getall');
const datePicker = document.getElementById('calendar');
const container = document.querySelector('#container');
const message = document.getElementById('message');
const dropdownTime = document.getElementById('dropdownTime');
const clearButton = document.getElementById('clear');

//helper functions

//delete a row
function requestDeleteRow (btn) {
  const id = btn.getAttribute('rowID')
  
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/reservations/delete-row?id=' + id,
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

function createDeleteButton (row) {
  const deleteBtn = document.createElement('button')
  deleteBtn.innerText = "X"
  deleteBtn.setAttribute('class', 'deleteRow')
  deleteBtn.setAttribute('rowID', row.id)
  return deleteBtn;
}


const renderResults = (results, emptyMessage = '') => {
  container.innerHTML = ''
  if (results.length > 0) {
    results.forEach(row => {
      const l = document.createElement('div')
      l.textContent = `date: ${row['date']} at ${row['time']}
      number of people: ${row['num_ppl']}.
      type: ${row['order_type']}`
      const b = createDeleteButton(row)
      b.addEventListener('click', (e) => {
        e.preventDefault();
        //message.textContent += 'X clicked '
        if(confirm(`Do you want to delete reservation on ${row.date}?`)){
          requestDeleteRow(b)
          .then((response) => {
            l.remove()
            message.innerHTML = ''
            message.innerHTML = 'reservation with id ' 
            + row.id + ' on ' + row.date + ' is deleted.'
          }).catch((e) => {
            console.log(e)
          })
        }
      })
      l.appendChild(b)
      container.appendChild(l)
    })
  } else {
    container.innerHTML = `<p> ${emptyMessage} </p>`
  }
}

const renderError = err => {
  container.innerHTML = ''
  container.innerHTML = `<p>Your request returned an error from the server: </p>
  <p>Code: ${err.status}</p>
  <p>${err.statusText}</p>`;
}

function disablePastDates() {
  const today = new Date().toISOString().split('T')[0];
  datePicker.min = today;
}


// onload
$(document).ready(function() {
  disablePastDates();

  //deletePastResvervations();
  if(!datePicker.value){
    dropdownTime.disabled = true;
  }
})


//get all
getAllButton.addEventListener('click', () => {
  // Fetch data from the back end API using the fetch() function
  fetch('/reservations')
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
    url:`/reservations/by?date=${selectedDate}`,
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
})

clearButton.addEventListener('click', (e) => {
  datePicker.value = ''
  dropdownTime.disabled = true;
  container.innerHTML = '';
})

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
    container.innerHTML = 'No reservation made for these hours'
  }
})


