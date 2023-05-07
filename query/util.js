
//global constants
const NUMBER_TABLES = 4
const NUMBER_HOTPOTS = 3
const TIME_MEAL = 1 // hours
const TIME_HOTPOT = 2.5 //hours
const OPENING_HOUR = 12 // open at noon
const LAST_RESERVE_HOUR = 20; // do not take reservations after 20:00

const DEFAULT_MAX = 15;


class Dict {
    constructor(max) {
        this.inventory = this.createInventory(OPENING_HOUR, LAST_RESERVE_HOUR, 0.5, max);
    }

    //to generate an inventory
    createInventory(start, end, step, max) {
        let inventory = {}
        for(let i = start; i <= end; i += step) {
            inventory[i] = max
        }
        return inventory
    }

    updateInventory(summary, type) {
        //type is a string, either 'table' or 'hotpot'
        if(type.toLowerCase() === 'table') {
            this.updateTable(summary)
        } else if (type.toLowerCase() === 'hotpot'){
            this.updateHotpot(summary)
        }
    }

    getFullHours() {
        const keys = Object.keys(this.inventory);
        let full = []
        keys.forEach(key => {
            if(this.inventory[key] <= 0){
                full.push(numberToTime(Number(key)))
            }
        })
        return full;
    }

    updateTable(summary) {
        //summary is an array of objects from query 
        //{time, order_type, number of reservations as 'count'}
        const timeBefore = 0.5;
        summary.forEach(reservation => {
            let timeNum = timeToNumber(reservation['time']);
            let duration = TIME_MEAL
            if(reservation['order_type'] == 'hotpot') {
                duration = TIME_HOTPOT
            }
            for (let i = timeNum - timeBefore; i <= timeNum + duration; i+= 0.5) {
                if(i > LAST_RESERVE_HOUR || i < OPENING_HOUR){
                    continue;
                }
                this.inventory[i] -= Number(reservation['count'])       
            }
        })
    }
    
    updateHotpot(summary) {
        const timeBefore = 2;
        summary.forEach(reservation => {
            let timeNum = timeToNumber(reservation['time']);
            let duration = TIME_HOTPOT
            if(reservation['order_type'] == 'hotpot') {
                for (let i = timeNum - timeBefore; i <= timeNum + duration; i+= 0.5) {
                    if(i > LAST_RESERVE_HOUR || i < OPENING_HOUR){
                        continue;
                    }
                    this.inventory[i] -= Number(reservation['count'])  
                }
            }
        })
    }

}

//helper functions
function timeToNumber(timeString) {
    const l = timeString.split(':')
    let h = Number(l[0])
    if (l.includes('30')) {
        h += 0.5
    }
    return h
}

function numberToTime(num) {
    const n = Number(num)
    if(Math.floor(n) == n) {
        return `${n}:00:00`
    } else {
        return `${Math.floor(n)}:30:00`
    }
}






module.exports = {
    NUMBER_TABLES,
    NUMBER_HOTPOTS,
    TIME_MEAL,
    TIME_HOTPOT,
    OPENING_HOUR,
    LAST_RESERVE_HOUR,
    DEFAULT_MAX,
    Dict
}

// //testing dict


// const summary = [
//     {"time":"15:30:00","order_type":"standard","count":"1"},
//     {"time":"16:00:00","order_type":"hotpot","count":"1"},
//     {"time":"16:30:00","order_type":"hotpot","count":"1"},
//     {"time":"17:00:00","order_type":"hotpot","count":"1"},
//     {"time":"18:30:00","order_type":"standard","count":"1"},
// ]

// const hotpots = new Dict(NUMBER_HOTPOTS);
// hotpots.updateInventory(summary, 'hotpot')
// console.log(hotpots.inventory);
// console.log(hotpots.getFullHours())

// const tables = new Dict(NUMBER_TABLES);
// tables.updateInventory(summary, 'table')
// console.log(tables.inventory);
// console.log(tables.getFullHours())



