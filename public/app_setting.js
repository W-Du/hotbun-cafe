const getDatePicker = document.getElementById('getCalendar');
const startDatePicker = document.getElementById('startday');
const endDatePicker = document.getElementById('endday');
const container = document.getElementById('container');
const message = document.getElementById('message');
const oneDayCheckbox = document.getElementById('add-one');
const ButtonPost = document.getElementById('post');
const ButtonDelete = document.getElementById('delete');


function disablePastDates() {
    const today = new Date().toISOString().split('T')[0];
    getDatePicker.min = today;
    startDatePicker.min = today;
    endDatePicker.min = today;

}

function renderResults(result) {
    container.innerHTML = '' 
    if (Object.keys(result).includes('message')) {
        container.textContent = result['message'];
    } else {
        container.textContent += 'max reservation = ' + result['max_reservations']
    }
}

function renderError(error) {
    confirmContainer.innerHTML = '';
    confirmContainer.textContent += error.statusText;
    confirmContainer.textContent += '<br><p>There is an error, pls try again</p>'
}

function daysInBetween(start, end) {
    //start and end are daystrings 'yyyy-mm-dd'
    const s = new Date(start)
    const e = new Date(end)
    return Math.ceil((e-s) / (1000*60*60*24)) + 1
}


function getDaysArray(start, end) {
    for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt).toISOString().split('T')[0]);
    }
    return arr;
};

function restart(){
    endDatePicker.disabled = true;
}


// //get row.count()
// function checkDbRange(start, end) {
//     const daysArr = getDaysArray(start, end);
//     const startDay = new Date(start).toISOString().split('T')[0]
//     const endDay = new Date(end).toISOString().split('T')[0]
//     // let formData = {
//     //     startDay: new Date(start).toISOString().split('T')[0], 
//     //     endDay: new Date(end).toISOString().split('T')[0]
//     // }

//     return new Promise(function(resolve, reject) {
//         $.ajax({
//             type: 'GET',
//             url: `/available/range?start=${startDay}&end=${endDay}`,
//             dataType: 'json',
//             success: (response) => {
//                 let result = {
//                     'existing': [],
//                     'non_existing': []
//                 }
//                 response.forEach(r => result.existing.push(r.split('T')[0]))
//                 daysArr.forEach(day => {
//                     if(!result.existing.includes(day)) {
//                         result.non_existing.push(day)
//                     }
//                 })
//                 message.textContent += result.non_existing
//                 resolve(result)
//             },
//             error: (err) => {
//                 reject(err)
//             }
//         })   
//     })
// }



$(document).ready(function() {
    disablePastDates();
    restart();
})


getDatePicker.addEventListener('change', (e) => {
    e.preventDefault();
    restart();
    message.innerHTML = getDatePicker.value;
    const daySelected = new Date(getDatePicker.value).toISOString().split('T')[0]

    try{
        $.ajax({
            type: 'GET',
            url: '/available/by?date=' + daySelected,
            success: (response) => {
                renderResults(response)
            },
            error: (err) => {
                renderError(err)
            }
        })
    } catch (e) {
        message.textContent += e
    }
})

startDatePicker.addEventListener('change', (e) => {
    e.preventDefault();
    const start = startDatePicker.value;
    // POST or PUT
    if(oneDayCheckbox.checked === false) {
        endDatePicker.disabled = false;
        endDatePicker.value = '';
        endDatePicker.min = start;
    }
})

ButtonPost.addEventListener('click', (e) => {
    e.preventDefault();
    const start = startDatePicker.value;
    const max_res = document.querySelector('input[name=max_reserv]').value;
    let formData;
    if(oneDayCheckbox.checked === false) {
        const end = endDatePicker.value;
        const days = getDaysArray(start,end)
        formData = {
            max_reservations: max_res,
            date: JSON.stringify(days)
        }
    } else {
        formData = {
            max_reservations: max_res,
            date: JSON.stringify([start])
        }
    }

    $.ajax({
        type: 'POST',
        url:'/available/update',
        data: formData,
        dataType: 'json',
        success: (response) => {
            container.textContent = 'new availibility added'
        },
        error: (err) => {
            renderError(err)
        }
    })
    
})

ButtonDelete.addEventListener('click', (e) => {
    e.preventDefault();
    const start = startDatePicker.value;
    if(oneDayCheckbox.checked === false) {
        end = endDatePicker.value;
        $.ajax({
            url: `available/delete-range?start=${start}&end=${end}`,
            type: 'DELETE',
            success: (response) => {
                container.textContent = `data between ${start} and ${end} is deleted`
            },
            error: (err) => {
                renderError(err)
            }
        })
    } else {
        $.ajax({
            url: `available/delete-day?day=${start}`,
            type: 'DELETE',
            success: (response) => {
                container.textContent = `data for ${start} is deleted`
            },
            error: (err) => {
                renderError(err)
            }
        })
    }
})

oneDayCheckbox.addEventListener('change', () => {
    if(oneDayCheckbox.checked === true){
        endDatePicker.value = ''
        endDatePicker.disabled = true;
    } else {
        endDatePicker.disabled = false;
    }
})