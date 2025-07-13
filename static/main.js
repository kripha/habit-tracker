let currDraggedObject = null;
let count = 0;

/* helper functions */
function addNewHabit(habitCol) {
    let newHabitElement = currDraggedObject.cloneNode(true);

    // addEventListener because that isn't cloned
    newHabitElement.addEventListener("dragstart", (event) => {
        currDraggedObject = event.target;
    })

    // addEventListener for double tap to delete
    newHabitElement.addEventListener("dblclick", (event) => {
        
        let weekday = habitCol.parentElement.firstElementChild.innerHTML;

        // delete habit from server data
        $.ajax({
            type: "POST",
            url: "delete-habit-from-weekday",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({"habit_name": event.target.innerHTML, "weekday": weekday})
        })

        newHabitElement.remove();
    })

    // change height and width accordingly
    newHabitElement.style.height = "10%";
    newHabitElement.style.width = "70%";

    habitCol.append(newHabitElement);

    let weekday = habitCol.parentElement.firstElementChild.textContent;
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

function resetModalBox() {
    let submitButton = document.getElementById("submitHabit");
    let modalBox = document.getElementById("modalBox");

    document.getElementById("missingColor").style.color = "antiquewhite";
    document.getElementById("missingName").style.color = "antiquewhite";
    document.getElementById("habitNameInput").value = "";
    document.getElementById("habitColorInput").value = "";
    submitButton.innerHTML = "SUBMIT";
    submitButton.onclick = () => submitNewHabit(modalBox);
}

function addNewHabitOption(name, color) {
    let habitsContainer = document.getElementById("habitsContainer");
    let newHabitElement = document.createElement("div");
    newHabitElement.classList.add("habit");
    newHabitElement.classList.add(name);
    newHabitElement.draggable = "true";
    newHabitElement.innerHTML = name;
    newHabitElement.style.backgroundColor = "#" + color;

    addHabitOptionEvents(newHabitElement);
    habitsContainer.appendChild(newHabitElement);
    // <div class="habit" draggable="true">grocery</div>
}

function checkInputFields(newHabitColor, newHabitName) {
    let valid = true;
    if (newHabitColor.value.length == 0) {
        document.getElementById("missingColor").style.color = "red";
        document.getElementById("missingColor").innerHTML = "Missing habit color";
        newHabitColor.focus();
        valid = false;
    } else {
        // check if hex color is valid
        if (validHexColor(newHabitColor.value) == false) {
            document.getElementById("missingColor").style.color = "red";
            document.getElementById("missingColor").innerHTML = "Invalid hex color";
            valid = false;
            newHabitColor.focus();
        } else {
            document.getElementById("missingColor").style.color = "antiquewhite";
        }
    }
    if (newHabitName.value.length == 0) {
        document.getElementById("missingName").style.color = "red";
        newHabitName.focus();
        valid = false;
    } else {
        document.getElementById("missingName").style.color = "antiquewhite";
    }
    return valid;
}

function submitNewHabit(modalBox) {
    let newHabitName = document.getElementById("habitNameInput");
    let newHabitColor = document.getElementById("habitColorInput");
    
    // check input fields
    let validInputs = checkInputFields(newHabitColor, newHabitName);
    
    // if everything is good to go, add new habit
    if (validInputs == true) {
        modalBox.style.display = "none";
        addNewHabitOption(newHabitName.value, newHabitColor.value);
        resetModalBox();
    }
}

function saveChanges(habitElement, modalBox) {
    let newHabitName = document.getElementById("habitNameInput");
    let newHabitColor = document.getElementById("habitColorInput");
    
    // check input fields
    let validInputs = checkInputFields(newHabitColor, newHabitName);

    // if everything is good to go, update habit option
    if (validInputs == true) {
        let oldHabitName = habitElement.innerHTML;
        let allHabitElements = document.querySelectorAll("." + oldHabitName);

        allHabitElements.forEach((item) => {
            item.classList.remove(oldHabitName);
            item.classList.add(newHabitName.value);
            item.style.backgroundColor = "#" + newHabitColor.value;
            item.innerHTML = newHabitName.value;
        })

        // update server data
        $.ajax({
            type: "POST",
            url: "update-habit-name",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({"new_habit_name": newHabitName.value, "old_habit_name": oldHabitName})
        });

        resetModalBox();
        modalBox.style.display = "none";
    }
}

function openEditBox(modalBox, submitHabit, habitTarget) {
    modalBox.style.display = "flex";

    // replace submit button with save button
    // submitHabit.id = "saveChange";
    submitHabit.innerHTML = "SAVE";
    submitHabit.onclick = () => saveChanges(habitTarget, modalBox);
}

function addHabitOptionEvents(habitOption) {
    habitOption.addEventListener("dragstart", (event) => {
        currDraggedObject = event.target;
    })

    // show a modalBox in edit mode when a habit option is double clicked
    habitOption.addEventListener("dblclick", (event) => {
        let modalBox = document.getElementById("modalBox");
        let submitHabit = document.getElementById("submitHabit");
        let habitTarget = event.target;
        openEditBox(modalBox, submitHabit, habitTarget);
    })
}

/* initialize habit events */
let habits = document.querySelectorAll(".habit");
habits.forEach((item) => addHabitOptionEvents(item));

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

/* show and close modalBox */
let modalBox = document.getElementById("modalBox");
let addIcon = document.getElementById("addIcon");
addIcon.onclick = (event) => {
    modalBox.style.display = "flex";
    document.getElementById("habitNameInput").focus();
}
let closeButton = document.getElementById("closeButton");
closeButton.onclick = (event) => {
    modalBox.style.display = "none";
    resetModalBox();
}

/* add new habit option when submit button is clicked */
let submitHabit = document.getElementById("submitHabit");
submitHabit.onclick = () => submitNewHabit(modalBox);


/* show a modalBox in edit mode when a habit option is double clicked */



// add delete button