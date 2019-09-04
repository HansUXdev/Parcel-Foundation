import $ from 'jquery';
window.$ = $;

// if true console commands will print out
let debugTodo = true;

$(document).ready(function() {
  // Getting a reference to the input field where user adds a new todo
  var $newItemInput = $("input.new-item");
  // Our new todos will go inside the todoContainer
  var $todoContainer = $(".todo-container");

  // Adding event listeners for deleting, editing, and adding todos
  $(document).on("click", "button.delete", deleteTodo);
  $(document).on("click", "button.complete", toggleComplete);
  $(document).on("click", ".todo-item", editTodo);
  $(document).on("keyup", ".todo-item", finishEdit);
  $(document).on("blur", ".todo-item", cancelEdit);

  // when the submit button inside form#todo-form is clicked
  $(document).on("submit", "#todo-form", insertTodo);

  // Our initial todos array
  var todos = [];

  // Getting todos from database when page loads
  getTodos();


  /* Foundation Component
    <li>
      <input id="item6" type="checkbox"></input>
      <label for="item6"></label>Item 6
      </li>
  */

  // This function constructs a todo-item row
  function createNewRow(todo) {
    var $newInputRow = $(
      [
        `<li class='list-group-item todo-item'>`,
        `<label class='complete' for="item${todo.id}"></label>`,
        // Where the text will go
        `<span>`,
        `${todo.text}`,
        `</span>`,

        `<input type='text' id="item${todo.id}" class='edit' style='display: none;'>`,
        `<button class='delete btn btn-default'>x</button>`,
        // `<button class='complete btn btn-default'>✓</button>`,
        // Screen reader friendly
          // `<button class="button delete" type="button">
          //   <span class="show-for-sr">Close</span>
          //   <span aria-hidden="true">
          //   <i class="fi-x"></i></span>
          //   </button>`,
        `</li>`
      ].join("")
    );

    $newInputRow.find("button.delete").data("id", todo.id);
    $newInputRow.find("input.edit").css("display", "none");
    $newInputRow.data("todo", todo);
    if (todo.complete) {
      $newInputRow.find("span").css("text-decoration", "line-through");
    }
    return $newInputRow;
    console.log("added new item to the list");
  }

  // This function resets the todos displayed with new todos from the database
  function initializeRows() {
    $todoContainer.empty();
    var rowsToAdd = [];
    for (var i = 0; i < todos.length; i++) {
      rowsToAdd.push(createNewRow(todos[i]));
    }
    $todoContainer.prepend(rowsToAdd);
  }

  // This function grabs todos from the database and updates the view
  function getTodos() {
    $.get("/api/todos", function(data) {
      todos = data;
      initializeRows();
    });
  }

  // This function deletes a todo when the user clicks the delete button
  function deleteTodo(event) {
    event.stopPropagation();
    var id = $(this).data("id");
    $.ajax({
      method: "DELETE",
      url: "/api/todos/" + id
    }).done(getTodos);
  }

  // This function handles showing the input box for a user to edit a todo
  function editTodo() {
    var currentTodo = $(this).data("todo");
    $(this).children().hide();
    $(this).children("input.edit").val(currentTodo.text);
    $(this).children("input.edit").show();
    $(this).children("input.edit").focus();
  }

  // Toggles complete status
  function toggleComplete(event) {
    event.stopPropagation();
    var todo = $(this).parent().data("todo");
    todo.complete = !todo.complete;
    updateTodo(todo);
  }

  // This function starts updating a todo in the database if a user hits the "Enter Key"
  // While in edit mode
  function finishEdit() {
    var updatedTodo = $(this).data("todo");
    if (event.keyCode === 13) {
      updatedTodo.text = $(this).children("input").val().trim();
      $(this).blur();
      updateTodo(updatedTodo);
    }
  }

  // This function updates a todo in our database
  function updateTodo(todo) {
    $.ajax({
      method: "PUT",
      url: "/api/todos",
      data: todo
    }).done(getTodos);
  }

  // This function is called whenever a todo item is in edit mode and loses focus
  // This cancels any edits being made
  function cancelEdit() {
    var currentTodo = $(this).data("todo");
    if (currentTodo) {
      $(this).children().hide();
      $(this).children("input.edit").val(currentTodo.text);
      $(this).children("span").show();
      $(this).children("button").show();
    }
  }

  // This function inserts a new todo into our database and then updates the view
  function insertTodo(event) {
    event.preventDefault();
    var todo = {
      text: $newItemInput.val().trim(),
      complete: false
    };

    $.post("/api/todos", todo, getTodos);
    $newItemInput.val("");
  }
});
