const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//This function gets the right date ordinal depending on what number is returned
function nth(d) {
    if(d>3 && d<21) return 'th'; 
    switch (d % 10) {
          case 1:  return "st";
          case 2:  return "nd";
          case 3:  return "rd";
          default: return "th";
    }
} 

function compareDates(todaysDate, requestedDate) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const formattedDate = new Date(requestedDate);

    function dateDiffInDays(a,b) {
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      }

    if(formattedDate > todaysDate) {
        const days = dateDiffInDays(formattedDate, todaysDate);
        const newDate = addDays(todaysDate, days);

        //should either return days

        return newDate;
    } else {
        return false;
    }
}

function returnMode(array) {

    let count = {};

    array.forEach(function(element, index) {
        const niceName = String(element);

        if (count[niceName] == undefined) {
            count[niceName] = 1;
        } else if(count[niceName] != undefined) {
            count[niceName] += 1;
        } else {
            console.error(`There was a problem.`);
        }
    });

    let sortable = Object.keys(count).map(key => ({ key, value: count[key] }));

    sortable.sort(function(a,b){
        return b.value - a.value;
    });

return sortable[0].key
}