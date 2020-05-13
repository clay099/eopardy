// categories is an array which stores the categories id
let categories = [];
// coded num_categories & Num_questions_per_cat to allow for easier future function
let NUM_CATEGORIES = 6;
let NUM_QUESTIONS_PER_CAT = 5;

//  shuffle the provided array for use in get Category ids
function shuffle(arr) {
    // sort function to start at a random number
    arr.sort(() => Math.random() - 0.5);
}

async function getCategoryIds() {
    // get a list of 100 categories in one array with 100 objects
    const response = await axios.get("http://jservice.io//api/categories", {
        params: { count: 100 },
    });

    let newArray = [];
    let cat = response.data;

    // for each category returned place the id into the new array (we don't care about the other data)
    cat.forEach((returnedCategories) => {
        id = returnedCategories.id;
        newArray.push(id);
    });

    // shuffle array ids
    shuffle(newArray);
    // remove all array elements/ids after the 6th(or updated Num_categories)
    newArray.splice(NUM_CATEGORIES);
    // make the value of the categories variable the newArry we just created
    categories = newArray;
    return newArray;
}

// Return object with data about a category:
async function getCategory(catId) {
    // returns an object based on a passsed in category id. object includes title, id and questions/ answers
    let response = await axios.get(`http://jservice.io//api/category?id=${catId}`);
    let newObj = response.data;
    // return for later use
    return newObj;
}

// Fill the HTML table#jeopardy with the categories & cells for questions.
async function fillTable(categoryID, catObj) {
    // run categoryID function to fillout the categories variable, waits for code to execute before proceeding
    await categoryID();

    // select head
    let $head = $("thead");
    // create a row element
    let $hrow = $("<tr></tr>");
    // add row element to head
    $head.append($hrow);

    // loop over the returned category ids (created with the CategoryID function) and add title to head row
    for (let category of categories) {
        // runs the CatObj funciton with the category id passed through
        let returnedCategory = await catObj(category);
        let $newTd = $(`<td>${returnedCategory.title}</td>`);
        $head.children().append($newTd);
    }

    // select table body
    let $body = $("tbody");
    // loop over the number of questions for each category variable
    for (i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
        // every loop create a new row
        let $trow = $(`<tr></tr>`);
        $body.append($trow);
        // loop over each
        for (let x = 0; x < NUM_CATEGORIES; x++) {
            // runs the CatObj funciton with the category id passed through
            let returnedCategory = await catObj(categories[x]);

            // create new td with an class to allow for easey tracking
            let $td = $(`<td class="${returnedCategory.id}">?</td>`);
            // add data question to td for later logic
            $td.attr("data-question", `${returnedCategory.clues[i].question}`);
            // add data answer to td for later logic
            $td.attr("data-answer", `${returnedCategory.clues[i].answer}`);

            // append the td to the last row created
            $("tbody:last-child").append($td);
        }
    }
    $("#jeopardy").removeClass("hidden");
}

// /** Handle clicking on a clue: show the question or answer.
function handleClick(evt) {
    // check if the td clicked has a class which includse question (does not by default)
    if (!evt.target.classList.contains("question")) {
        // if quetsion is not a class, add it as a class
        evt.target.classList.add("question");
        // update the InnerHTML for the question data earlier stored
        evt.target.innerHTML = `${evt.target.dataset.question}`;
        // check if the td clicked has a class which includse answer (does not by default)
    } else if (!evt.target.classList.contains("answer")) {
        // if answer is not a class, add it as a class
        evt.target.classList.add("answer");
        // update the InnerHTML for the answer data earlier stored
        evt.target.innerHTML = `<td>${evt.target.dataset.answer}</td>`;
    }
}

/** On click of restart button, restart game. */
$("#restart").on("click", async function setupAndStart(evt) {
    // empty thead
    $("thead").empty();
    // empty tbody
    $("tbody").empty();
    $("#jeopardy").addClass("hidden");
    // starts the function to fill in the tables, provides category ids and category contents functions
    await fillTable(getCategoryIds, getCategory);
});

/** On page load, setup and start & add event handler for clicking clues */

$(document).ready(() => {
    // on page load create the table
    fillTable(getCategoryIds, getCategory);
    // create the click listener
    $("tbody").on("click", "td", handleClick);
});
