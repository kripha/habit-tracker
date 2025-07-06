let currDraggedObject = null
let count = 0;

// make habits into draggable objects
let habits = document.querySelectorAll(".habit");
habits.forEach((item, index) => {
    item.addEventListener("dragstart", (event) => {
        currDraggedObject = event.target.cloneNode(true); //clones deeply, including children
        /* NOTE: beware of cloning elements with IDs */
        console.log(currDraggedObject.innerHTML + " is being dragged");
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

        //added draggedObject to weekdayCol
        console.log("Dropped event happened");
        item.append(currDraggedObject);

        // update data in server
        let habitName = currDraggedObject.innerHTML;
        // let weekday = item.innerHTML; You need to get the weekday element inside item
        //let weekday = item.firstChild; firstChild returns the first comment, text, or element node
        let weekday = item.firstElementChild.textContent; //the first element of weekdayCol will always be the weekday
        $.ajax({
            type: "POST",
            url: "add-new-habit",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({"weekday": weekday, "habit_name": habitName})
        });
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
