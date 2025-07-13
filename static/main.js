let currDraggedObject = null;
let count = 0;

// helper functions
function addNewHabit(habitCol) {
    let newHabitElement = currDraggedObject.cloneNode(true);

    // addEventListener because that isn't cloned
    newHabitElement.addEventListener("dragstart", (event) => {
        currDraggedObject = event.target;
    })

    // addEventListen for double tap to delete
    newHabitElement.addEventListener("dblclick", (event) => {
        console.log("Double click!");
        newHabitElement.remove();
    })

    // change height and width accordingly
    newHabitElement.style.height = "10%";
    newHabitElement.style.width = "70%";

    habitCol.append(newHabitElement);

    let weekday = habitCol.firstElementChild.textContent;
    let habitName = newHabitElement.innerHTML;
    $.ajax({
        type: "POST",
        url: "add-new-habit",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({"weekday": weekday, "habit_name": habitName})
    });
}

function addUsedHabit(newHabitCol) {
    let habitName = currDraggedObject.innerHTML;
    let oldHabitCol = currDraggedObject.parentElement; //get the habitCol element
    let oldWeekday = oldHabitCol.parentElement.firstElementChild.textContent; //the first element of habitCol is assumed to be weekday element
    let newWeekday = newHabitCol.parentElement.firstElementChild.textContent;

    $.ajax({
        type: "POST",
        url: "add-used-habit",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({"habit_name": habitName, "old_weekday": oldWeekday, "new_weekday": newWeekday})
    })

    // move curr habit to new weekday
    newHabitCol.append(currDraggedObject);

}
// make habits into draggable objects
let habits = document.querySelectorAll(".habit");
habits.forEach((item, index) => {
    item.addEventListener("dragstart", (event) => {
        currDraggedObject = event.target; //clones deeply, including children
        /* NOTE: beware of cloning elements with IDs */
    })
})


// make each habitCol a drop zone
let habitCols = document.querySelectorAll(".habitCol");
habitCols.forEach((item) => {
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



    })
})

// remove right border (except Saturday) to avoid excess bordering
weekdayCols = document.querySelectorAll(".weekdayCol")
weekdayCols.forEach((item, index) => {
    if (index != weekdayCols.length - 1) {
        item.style.borderRight = "0";
    }

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
