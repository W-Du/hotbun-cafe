// const d1 = new Date('2023-04-01')
// const d2 = new Date('2023-04-02')
// const time = d2 - d1
// const day = time / (1000*60*60*24)
// console.log(day)


function numberOfDays(start, end) {
    //start and end are daystrings 'yyyy-mm-dd'
    const s = new Date(start)
    const e = new Date(end)
    return Math.ceil((e-s) / (1000*60*60*24)) + 1
}

//console.log(numberOfDays('2022-01-01', '2022-01-03'))


function getDaysArray(start, end) {
    for(var arr=[],dt=new Date(start); dt<=new Date(end); dt.setDate(dt.getDate()+1)){
        arr.push(new Date(dt).toISOString().split('T')[0]);
    }
    return arr;
};

const a = getDaysArray('2022-01-31', '2022-02-05')
a.forEach(b => {console.log(b)})
