let currDraggedObject = null;
let count = 0;

/* helper functions */
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

function validHexColor(hexcolor) {
    // is it 6 characters?
    if (hexcolor.length != 6) {
        return false;
    }
    // is each character 0-9 or A-F?
    for( let i = 0; i < hexcolor.length; i++) {
        let char = hexcolor[i];
        if ("0123456789ABCDEFabcdef".includes(char) == false) {
            return false;
        }
    }
    return true;
}

function resetAddHabitBox() {
    document.getElementById("missingColor").style.color = "antiquewhite";
    document.getElementById("missingName").style.color = "antiquewhite";
    document.getElementById("habitNameInput").value = "";
    document.getElementById("habitColorInput").value = "";
}


function addNewHabitOption(name, color) {
    let habitsContainer = document.getElementById("habitsContainer");
    let newHabitElement = document.createElement("div");
    newHabitElement.classList.add("habit");
    newHabitElement.draggable = "true";
    newHabitElement.innerHTML = name;
    newHabitElement.style.backgroundColor = "#" + color;

    newHabitElement.addEventListener("dragstart", (event) => {
        currDraggedObject = event.target;
    })
    habitsContainer.appendChild(newHabitElement);
    // <div class="habit" draggable="true">grocery</div>

}

/* track which habit is being dragged */
let habits = document.querySelectorAll(".habit");
habits.forEach((item, index) => {
    item.addEventListener("dragstart", (event) => {
        currDraggedObject = event.target;
    })
})


/* make each habit col a droppable zone */
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
        console.log("A dropped event has occurred")



    })
})

/* remove right border (except Saturday) to avoid excess bordering */
let weekdayCols = document.querySelectorAll(".weekdayCol");
weekdayCols.forEach((item, index) => {
    if (index != weekdayCols.length - 1) {
        item.style.borderRight = "0";
    }

})

/* show and close addHabitBox */
let addHabitBox = document.getElementById("addHabitBox");
let addIcon = document.getElementById("addIcon");
addIcon.onclick = (event) => {
    addHabitBox.style.display = "flex";
    document.getElementById("habitNameInput").focus();
}
let closeButton = document.getElementById("closeButton");
closeButton.onclick = (event) => {
    addHabitBox.style.display = "none";
    resetAddHabitBox();
}

/* add new habit option when submit button is clicked */
let submitHabit = document.getElementById("submitHabit");
submitHabit.onclick = (event) => {
    let newHabitName = document.getElementById("habitNameInput");
    let newHabitColor = document.getElementById("habitColorInput");
    let validInputs = true;
    
    // check input fields
    if (newHabitColor.value.length == 0) {
        document.getElementById("missingColor").style.color = "red";
        document.getElementById("missingColor").innerHTML = "Missing habit color";
        newHabitColor.focus();
        validInputs = false;
    } else {
        // check if hex color is valid
        if (validHexColor(newHabitColor.value) == false) {
            document.getElementById("missingColor").style.color = "red";
            document.getElementById("missingColor").innerHTML = "Invalid hex color";
            validInputs = false;
            newHabitColor.focus();
        } else {
            document.getElementById("missingColor").style.color = "antiquewhite";
        }
    }
    if (newHabitName.value.length == 0) {
        document.getElementById("missingName").style.color = "red";
        newHabitName.focus();
        validInputs = false;
    } else {
        document.getElementById("missingName").style.color = "antiquewhite";
    }
    
    // if everything is good to go, add new habit
    if (validInputs == true) {
        addHabitBox.style.display = "none";
        console.log(newHabitName.value.length + " should be the value/name?");
        addNewHabitOption(newHabitName.value, newHabitColor.value);
        resetAddHabitBox();
    }
}


