let currDraggedObject = null;
let count = 0;

let timerId = null; // track of single clicks and double clicks
let clicked = false; // track if habit was just clicked
let dropped = false; // track if a dropped event happened
let maxHabitWidth = 0; // track widest habit in columns

/* helper functions */
function addNewHabit(habitCol) {
    let newHabitElement = currDraggedObject.cloneNode(true);

    // add eventlisteners
    newHabitElement.addEventListener("mousedown", (event) => {
        generalMouseDown(event, mouseMove, mouseUp);
    });

    newHabitElement.addEventListener("click", () => {
        console.log("clickonHabit");
        console.log(dropped + " is the status of dropped after clickOnHabit");
        if (dropped == false) {
            clicked = true;
        } else {
            /* now that you've used dropped to detect a dropped a event
            reset the tracking variable */
            dropped = false;
        }
    });
    // addEventListener for double tap to delete
    newHabitElement.addEventListener("dblclick", (event) => {
        console.log("a double click happened");
        // let weekday = habitCol.parentElement.firstElementChild.textContent;
        let weekday = habitCol.id.replace("HabitCol", "");

        // delete habit from server data
        $.ajax({
            type: "POST",
            url: "delete-habit-from-weekday",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({"habit_name": event.target.textContent, "weekday": weekday})
        })

        newHabitElement.remove();
    })
    newHabitElement.addEventListener("contextmenu", () => {
        console.log("contextmenu event happened");
        clicked = true;
    });

    // change height and width accordingly
    // newHabitElement.style.height = "10%";
    // make width 60% of wednesday col (the widest col)
    
    // style
    newHabitElement.style.position = "static";
    newHabitElement.style.width = "100%"; //NOTE: should we worry about overflow? habit width gets big when moved
    newHabitElement.style.margin = "3px 0px";

    habitCol.append(newHabitElement);

    let weekday = habitCol.id.replace("HabitCol", "");
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
    let oldWeekday = oldHabitCol.id.replace("HabitCol", ""); //the first element of habitCol is assumed to be weekday element
    let newWeekday = newHabitCol.id.replace("HabitCol", "");

    $.ajax({
        type: "POST",
        url: "add-used-habit",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({"habit_name": habitName, "old_weekday": oldWeekday, "new_weekday": newWeekday})
    })
    // currDraggedObject.style.height = "10%";
    // currDraggedObject.style.width = "70%";
    // move curr habit to new weekday
    currDraggedObject.style.width = "100%"; // reset width after drop
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
    let deleteButton = document.getElementById("deleteHabit");
    let modalBox = document.getElementById("modalBox");
    let currHabitName = document.getElementById("currHabitName");

    document.getElementById("missingColor").style.color = "antiquewhite";
    document.getElementById("missingName").style.color = "antiquewhite";
    document.getElementById("habitNameInput").value = "";
    document.getElementById("habitColorInput").value = "";
    // document.getElementById("habitName").innerHTML = 'habit name';
    // document.getElementById("habitColor").innerHTML = 'habit color';

    submitButton.innerHTML = "SUBMIT";
    submitButton.onclick = () => submitNewHabit(modalBox);

    // remove the delete button if delete button is present
    if (deleteButton != null) {
        deleteButton.parentElement.removeChild(deleteButton);
    }

    // remove currHabit title
    if (currHabitName != null) {
        currHabitName.parentElement.removeChild(currHabitName);
    }

    // remove modalOverlay
    document.getElementById("modalOverlay").style.display = "none";
}

function addNewHabitOption(name, color) {
    console.log("I am in addNewHabitOption");
    let habitsContainer = document.getElementById("habitsContainer");
    let newHabitElement = document.createElement("div");
    newHabitElement.classList.add("habit");
    newHabitElement.classList.add(name);
    newHabitElement.draggable = "true";
    newHabitElement.innerHTML = name;
    newHabitElement.style.backgroundColor = "#" + color;
    newHabitElement.style.minWidth = "160px";

    addHabitOptionEvents(newHabitElement);
    habitsContainer.appendChild(newHabitElement);
    console.log(newHabitElement.getBoundingClientRect().width + " is the width of " + name);
    // <div class="habit" draggable="true">grocery</div>
}

function checkInputFields(newHabitColor, newHabitName, modalBoxMode = "add") {
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
        // check if habit already exists if we are trying to add a new habit
        if (modalBoxMode == "add") {
            let habitExists = document.querySelector("." + newHabitName.value);

            if (habitExists != null) {
                document.getElementById("missingName").style.color = "red";
                document.getElementById("missingName").innerHTML = "Habit already exists";
                newHabitName.focus();
                valid = false;
            } else {
                document.getElementById("missingName").style.color = "antiquewhite";
            }
        }
        
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
    let validInputs = checkInputFields(newHabitColor, newHabitName, "edit");

    // if everything is good to go, update habit option
    if (validInputs == true) {
        let oldHabitName = habitElement.textContent;
        let allHabitElements = document.querySelectorAll( "[class=" + "'habit " + oldHabitName.replace(" ", "-") + "']"); //'[class="${7*7}"]'
        console.log("[class=" + "'" + oldHabitName.replace(" ", "-") + "']");
        // console.log(allHabitElements + " is allhabitselements");
        allHabitElements.forEach((item) => {
            console.log(item.textContent + " is the text content");
            item.classList.remove(oldHabitName.replace(" ", "-"));
            item.classList.add(newHabitName.value.replace(" ", "-"));
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

function deleteHabitOption(habitTarget, modalBox) {
    let habitName = habitTarget.innerHTML;

    // delete from cols and habitsContainer
    let allHabitElements = document.querySelectorAll("." + habitName);
    allHabitElements.forEach((item) => {
        item.parentElement.removeChild(item);
    })
    
    // delete from server data
    $.ajax({
        type: "POST",
        url: "delete-habit-option",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({"habit_name": habitName})
    })

    modalBox.style.display = "none";
    resetModalBox();
    
}

function rgbToHex(rgb) {
    let hexcolorString = "";
    rgb.forEach((item) => {
        let hex = parseInt(item).toString(16);
        // console.log(hex + " after string16");
        if (hex.length == 1) {
            hex = "0" + hex;
        }
        hexcolorString += hex;
    })
    // console.log(hexcolorString + " hexcolorString");
    return hexcolorString;
}
function openEditBox(modalBox, submitHabit, habitTarget, habitName, habitColor) {
    modalBox.style.display = "flex";
    document.getElementById("modalOverlay").style.display = "flex";
    // replace submit button with save button
    submitHabit.innerHTML = "SAVE";
    submitHabit.onclick = () => saveChanges(habitTarget, modalBox);

    // add deleteButton
    let modalContent = document.getElementById("modalContent");
    let deleteButton = document.createElement("button");
    deleteButton.id = "deleteHabit";
    deleteButton.innerHTML = "DELETE";
    deleteButton.onclick = () => deleteHabitOption(habitTarget, modalBox);
    modalContent.appendChild(deleteButton);

    // add currHabit name to top
    // let currHabitName = document.createElement("p");
    // currHabitName.id = "currHabitName";
    // currHabitName.innerHTML = habitTarget.innerHTML.toUpperCase();
    // document.getElementById("closeContainer").appendChild(currHabitName);

    // parse habitColor string "rgb(r, g, b)"
    habitColor = habitColor.replace("rgb(", "").replace(")", "");
    // console.log(habitColor + " after replace");
    habitColor = habitColor.split(", ");

    let hexcolor = rgbToHex(habitColor);
    // console.log(hexcolor);

    // pre-fill input fields
    let habitNameInput = document.getElementById("habitNameInput");
    let habitColorInput = document.getElementById("habitColorInput");
    // console.log(habitColorInput.value);
    // console.log(habitNameInput.value);
    habitNameInput.value = habitName;
    habitColorInput.value = hexcolor;

}

function dropHabit(targetMidpoint) {
    console.log("I am in calcHabitColBounds.")
    let bounds = {};
    let boundTop = 0;
    let boundBottom = 0;
    let columns = document.querySelectorAll(".habitCol");
    columns.forEach((item) => {
        let weekday = item.parentElement.firstElementChild.textContent;
        let coords = item.getBoundingClientRect();
        bounds[weekday] = [coords.left, coords.right];
        boundBottom = coords.bottom;
        boundTop = coords.top;
    })
    let targetX = targetMidpoint[0];
    let targetY = targetMidpoint[1];
    for (key of Object.keys(bounds)) {
        
        // check if target is within horizontal bounds
        if (bounds[key][0] < targetX && targetX <= bounds[key][1]) {
            // vertical bounds
            if (boundBottom >= targetY && targetY >= boundTop) {
                console.log(key + " is the column i got dropped in.");
                // do drop event
                // item is the habitCol we want to drop it in
                let habitCol = document.getElementById(key.toLowerCase() + "HabitCol")
                if (currDraggedObject.parentElement.id == "habitsContainer") {
                    console.log("I am going to add new habit.");
                    addNewHabit(habitCol);
                } else {
                    console.log('I am going to add old habit.')
                    addUsedHabit(habitCol);
                }
                console.log("A dropped event has occurred");
                // dropped = true;
                break;

            } else {
                currDraggedObject.style.width = "";
                currDraggedObject.style.height = "";
                // console.log("not in vertical bounds. targetY: " + targetY + "and Xbounds [" + boundTop + ", " + boundTop + "]");
            }
        } else {
            currDraggedObject.style.width = "";
            currDraggedObject.style.height = "";
            // console.log("not in horizontal bounds. targetX: " + targetX + "and Xbounds [" +bounds[key][0] + ", " +  bounds[key][1] + "]");
        }
    }
}
function mouseMove(e) {

    console.log("mouseMove");
    // center element around cursor
    // currDraggedObject.style.margin = "0"; I removed margin from style
    currDraggedObject.style.left = (e.clientX - currDraggedObject.offsetWidth/2) + "px";
    currDraggedObject.style.top = (e.clientY - currDraggedObject.offsetHeight/2) + "px";
}
function mouseUp(e) {
    console.log("mouseup");
    /* handle drop event */
    // reset currDraggedObject
    currDraggedObject.style.cursor = "grab";
    currDraggedObject.style.position = "static";

    // add habit to habitCol if within bounds
    dropHabit([e.clientX, e.clientY]);

    dropped = true;

    // currDraggedObject = null;
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
    // console.log("drop = false");
    // dropped = false;
}

function doDragAndDrop(event) {
    console.log("I am doing drag and drop");
    // record what is currently being dragged
    currDraggedObject = event.target;

    // update cursor style
    event.target.style.cursor = "grabbing";

    // center element around cursor
    // currDraggedObject.style.margin = "0"; i removed margin from .habit style
    currDraggedObject.style.left = (event.clientX - currDraggedObject.offsetWidth/2) + "px";
    currDraggedObject.style.top = (event.clientY - currDraggedObject.offsetHeight/2) + "px";

    // keep width the same
    let {width} = currDraggedObject.getBoundingClientRect();
    currDraggedObject.style.width = width + "px";

    currDraggedObject.style.position = "fixed";
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
    // event.target.addEventListener("mousemove", mouseMove);
    // event.target.addEventListener("mouseup", mouseUp);
}

function generalMouseDown(event, mouseMove, mouseUp) {
    event.preventDefault(); // prevent text selection
    console.log(clicked + " is status of clicked");
    console.log("mouse down happened");
    clearTimeout(timerId);
    // if single click, commence drag and drop
    // console.log(event);
    if (event.detail == 1) {
        // console.log("single click");
        timerId = setTimeout(() => {
            console.log(clicked + " is status of clicked");
            console.log(dropped + " is status of dropped");
            if (clicked == true) {
                console.log("dont drag this element");
                clicked = false; // reset
            } else {
                console.log("drag this element");
                doDragAndDrop(event);
            }
            // reset event tracker variables

            // console.log(clicked + " is status of clicked");
        }, 150); // TODO: there is a slight lag. Will the user notice?
    } else if (event.detail == 2) {
        // if double click, commence delete/edit
        console.log("double click");
    }

    // console.log(event["detail"]);


}

function addHabitOptionEvents(habitOption) {

    /* a click event happens when user lightly taps OR a dropped event has occurred */
    habitOption.addEventListener("click", () => {
        console.log("clickonHabit");
        console.log(dropped + " is the status of dropped after clickOnHabit");
        if (dropped == false) {
            clicked = true;
        } else {
            /* now that you've used dropped to detect a dropped a event
            reset the tracking variable */
            dropped = false;
        }
    });
    habitOption.addEventListener("mousedown", (event) => {
        generalMouseDown(event, mouseMove, mouseUp);
    });

    // show a modalBox in edit mode when a habit option is double clicked
    habitOption.addEventListener("dblclick", (event) => {
        let modalBox = document.getElementById("modalBox");
        let submitHabit = document.getElementById("submitHabit");
        let habitTarget = event.target;
        console.log(habitOption.style.backgroundColor.replace("rgb(", "").replace(")", "").split(", ") + " is color");
        
        openEditBox(modalBox, submitHabit, habitTarget, habitOption.textContent, habitOption.style.backgroundColor);
    });
    /* in case user right clicks on habit */
    habitOption.addEventListener("contextmenu", () => {
        console.log("contextmenu event happened");
        clicked = true;
    });
}

/* initialize habit events */
let habits = document.querySelectorAll(".habit");
habits.forEach((item) => addHabitOptionEvents(item));

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
    document.getElementById("modalOverlay").style.display = "flex";
}
let closeButton = document.getElementById("closeButton");
closeButton.onclick = (event) => {
    modalBox.style.display = "none";
    resetModalBox();
}

/* add new habit option when submit button is clicked */
let submitHabit = document.getElementById("submitHabit");
submitHabit.onclick = (event) => submitNewHabit(modalBox);


/* toggle between currGoal and inputGoal on click/enter */
let inputGoal = document.getElementById("inputGoal");
let currGoalElement = document.createElement("p");
currGoalElement.id = "currGoal";

inputGoal.addEventListener("keypress", event => {
    if (event.key == "Enter") {
        if (inputGoal.value.length != 0) {
            inputGoal.remove()

            // replace input tag with currGoal tag
            currGoalElement.textContent = inputGoal.value;
            currGoalElement.addEventListener("click", (event) => {

                // replace currGoal tag with input tag
                event.target.remove();
                document.getElementById("goalContainer").append(inputGoal);
                inputGoal.focus();
            });

            document.getElementById("goalContainer").append(currGoalElement);
        } else {
            inputGoal.blur();
        }
    }
});


// add delete button

    // item.addEventListener("dragover", (event) => {
    //     event.preventDefault(); //by default, nothing happens on dragover event
    //     // currDraggedObject.style.cursor = "grabbing";
    //     // event.dataTransfer.dropEffect = "move";
    // })
    // item.addEventListener("drop", (event) => {
    //     event.preventDefault(); //by default, it'll try to open a link when dropped

    //     //if draggedObject is from the header, make a clone
    //     if (currDraggedObject.parentElement.id == "habitsContainer") {
    //         addNewHabit(item);
    //     } else {
    //         addUsedHabit(item);
    //     }
    //     console.log("A dropped event has occurred")

    // })