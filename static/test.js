let currDraggedObject = null;
let count = 0;

// helper functions
function addNewHabit(weekdayCol) {
    let newHabitElement = currDraggedObject.cloneNode(true);

    // addEventListener because that isn't cloned
    newHabitElement.addEventListener("dragstart", (event) => {
        currDraggedObject = event.target;
    })

    weekdayCol.append(newHabitElement);

    let weekday = weekdayCol.firstElementChild.textContent;
    let habitName = newHabitElement.innerHTML;
    $.ajax({
        type: "POST",
        url: "add-new-habit",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({"weekday": weekday, "habit_name": habitName})
    });
}

function addUsedHabit(newWeekdayCol) {
    let habitName = currDraggedObject.innerHTML;
    let oldWeekdayCol = currDraggedObject.parentElement; //get the weekdayCol element
    let oldWeekday = oldWeekdayCol.firstElementChild.textContent; //the first element of weekdayCol is assumed to be weekday element
    let newWeekday = newWeekdayCol.firstElementChild.textContent;

    $.ajax({
        type: "POST",
        url: "add-used-habit",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({"habit_name": habitName, "old_weekday": oldWeekday, "new_weekday": newWeekday})
    })

    // move curr habit to new weekday
    newWeekdayCol.append(currDraggedObject);

}
// make habits into draggable objects
let habits = document.querySelectorAll(".habit");
habits.forEach((item, index) => {
    item.addEventListener("dragstart", (event) => {
        currDraggedObject = event.target; //clones deeply, including children
        /* NOTE: beware of cloning elements with IDs */
    })
})

// make each weekdayCol a drop zone
let weekdayCols = document.querySelectorAll(".weekdayCol");
weekdayCols.forEach((item) => {
    item.addEventListener("dragover", (event) => {
        event.preventDefault(); //by default, nothing happens on dragover event
    })
    item.addEventListener("drop", (event) => {
        event.preventDefault(); //by default, it'll try to open a link when dropped

        //if draggedObject is from the header, make a clone
        if (currDraggedObject.parentElement.id == "habitsContainer") {
            addNewHabit(item);
        } else {
            addUsedHabit(item);
        }
        console.log("A dropped event has occured")


        // update data in server
        // let weekday = item.innerHTML; You need to get the weekday element inside item
        //let weekday = item.firstChild; firstChild returns the first comment, text, or element node
        //the first element of weekdayCol will always be the weekday

    })
})


// const draggableObject = document.getElementById("container");
// draggableObject.addEventListener("dragstart", (event) => {
//     console.log(event);
//     currDraggedObject = event.target.cloneNode(true);
//     currDraggedObject.id = "container" + count;
//     count++;
//     /* keep track of what is being dragged so that if something is dropped in the dropBox
//     we know what was dropped. because it looks like the droppable object doesn't track what is 
//     dropped in it */
    
//     // console.log(currDraggedObject);
// });

// const dropBox = document.getElementById("containerB");
// dropBox.addEventListener("dragover", (event) => {
//     /* By default, when an element has something dragged over it, nothing happens.
//     by default, elements are un-droppable */
//     event.preventDefault(); //this makes the dropBox droppable
// })

// dropBox.addEventListener("drop", (event) => {
//     event.preventDefault(); // by default, it'll try to open a link when something is dropped
//     console.log(event);

//     event.dataTransfer.setData("droppedObjectName", currDraggedObject.innerHTML); // store the value of DraggedElement for future use

//     // make a copy of the currDraggedObject and add it to the dropBox
//     dropBox.append(currDraggedObject);

// })
