//DOM
const confirmContainer = document.getElementById('confirmation');
const datePicker = document.getElementById('date');
const reserveForm = document.querySelector('#new-order')
const debugContainer = document.getElementById('debug')
const timeSelect = document.getElementById('time')
const timeOptions = timeSelect.getElementsByTagName('option')
const mealOptHotpot = document.getElementById('order_hotpot');



//VARIABLES
let disabledDates = []

// Function to disable all past dates before today
function disablePastDates() {
  const today = new Date().toISOString().split('T')[0];
  datePicker.min = today;
}

//helper functions
function renderError(error) {
  confirmContainer.innerHTML = '';
  confirmContainer.textContent += error.statusText;
  confirmContainer.textContent += '<br><p>There is an error, pls try again</p>'
}

//populate time drop down list
function populateTime() {
  for (let i = 12; i <= 20; i += 0.5){
    const option = document.createElement('option');
    if(Math.floor(i) === i){
      option.value = `${i}:00:00`
      option.text = `${i}.00 PM`
    } else {
      option.value = `${Math.floor(i)}:30:00`
      option.text = `${Math.floor(i)}.30 PM`
    }
    timeSelect.appendChild(option)
  }
}

//remove data dated before today
function deletePastData() {
  $.ajax({
    url: '/helper/expired',
    type: "DELETE",
    success: (response) => {
      confirmContainer.textContent = 'Data of past days deleted'
    },
    error: (err) => {
      renderError(err)
    }
  })
}

//disable fully booked days
function disableFullyBooked() {
  $.ajax({
    url: '/helper/fully-booked',
    type: 'GET',
    success: function(fullyBookedDates) {
      fullyBookedDates.forEach((date) => {
        const dateStr = date.split('T')[0]
        disabledDates.push(dateStr);
        
      });
      // const t = typeof(disabledDates)
      // confirmContainer.textContent += t
      // confirmContainer.textContent += disabledDates
    },
    error: function(error) {
      console.log(error)
    }
  });
}



//when document is ready
$(document).ready(function() {

  disablePastDates();
  populateTime();
  //deletePastData();
  disableFullyBooked();
})



//event listeners
datePicker.addEventListener('change', (e) => {
  e.preventDefault();
  mealOptHotpot.disabled = false;
  let date = new Date(datePicker.value).toISOString().split('T')[0];
  let fullHoursPot = [];
  if(disabledDates.includes(date)){
    datePicker.value = '';
    alert('fully booked')
  }

  try{
    $.ajax({
      type:'GET',
      url: '/helper/by?date=' + date,
      success: (fullHours) => {
        const fullHoursTable = fullHours.fullHoursTable;
        //pass pot hours array
        fullHoursPot = fullHours.fullHoursPot;
        //debugContainer.textContent += fullHoursPot;
        //disable options when tables are full
        for(let i = 0; i < timeOptions.length; i++){
          if(fullHoursTable.includes(timeOptions[i].value)){
            debugContainer.textContent += timeOptions[i].value
            timeOptions[i].disabled = true;
          }
        }
      },
      error: (error) => {
        renderError(error)
      }
    })
  } catch (e){
    debugContainer.innerHTML = e
  }

  //when time is selected, disable mealoptions when hotpots are full
  timeSelect.addEventListener('change', (e) => {
    mealOptHotpot.disabled = false;
    const curOption = timeSelect.value;
    //debugContainer.textContent += fullHoursPot.includes(curOption);
    if(fullHoursPot.includes(curOption)){
      mealOptHotpot.disabled = true;
    }
  })
})


reserveForm.addEventListener('submit', (e) => {
  confirmContainer.textContent += e;
  confirmContainer.textContent += ' 1  '
  e.preventDefault(); 
   
  // Get the form data
  try{
    let formData = {
      date: document.querySelector('input[name=date]').value,
      time: document.querySelector('select[name=time]').value,
      num_ppl: document.querySelector('input[name=num_of_ppl]').value,
      name: document.querySelector('input[name=name]').value,
      email: document.querySelector('input[name=email]').value,
      order_type: document.querySelector('select[name=order_type]').value,
      message: document.querySelector('textarea[name=message]').value,
    };

    //send data to server-side
    $.ajax({
      type: 'POST',
      url: '/reservations/new',
      data: formData,
      dataType: 'json',
      success: (response) => {
          confirmContainer.innerHTML = `
          <h4>We received your reservation!</h4>
          <p> We expect you on ${response['date']} at ${response['time']} </p>`
      },
      error: (error) => {
        renderError(error)
      }
    });
  } catch(e){
    confirmContainer.textContent += e
  } finally {
    datePicker.value = ''
    timeSelect.value = 'none'
  }
});






