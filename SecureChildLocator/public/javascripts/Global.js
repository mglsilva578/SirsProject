// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {


    // Username link click
  $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);
  // Add User button click
   $('#btnAddUser').on('click', addUser)
   // Delete User link click
   $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
    // Populate the user table on initial page load
    populateTable();

});

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/users/allUsers', function( data ) {

      // Stick our user data array into a userlist variable in the global object
    userListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data, function(){
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.username + '</a></td>';
            tableContent += '<td>' + this.password + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#userList table tbody').html(tableContent);
    });
};

// Show User Info
function showUserInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our User Object
    var thisUserObject = userListData[arrayPosition];

    //Populate Info Box
    $('#userInfoName').text(thisUserObject.password);
    $('#userInfoAge').text(thisUserObject.password);
    $('#userInfoGender').text(thisUserObject.password);
    $('#userInfoLocation').text(thisUserObject.password);

};


// Add User (BASTANTE MOFICIADA , PODE SER APROVEITADA CASO SE ADICIONE MAIS CAMPOS)
function addUser(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
  //  $('#addUser input').each(function(index, val) {
    //    if($(this).val() === '') { errorCount++; }
  //  });

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'password': $('#addUser fieldset input#inputUserPassword').val(),
        //    'fullname': $('#addUser fieldset input#inputUserFullname').val(),
        //    'age': $('#addUser fieldset input#inputUserAge').val(),
        //    'location': $('#addUser fieldset input#inputUserLocation').val(),
        //    'gender': $('#addUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/addUser',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
        //    if (response.msg === '') {

                // Clear the form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

          //  }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};

// Delete User
function deleteUser(event) {

    event.preventDefault();


        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/users/deleteUserTable/' + $(this).attr('rel')
        }).done(function( response ) {
            console.log(this);
            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('OK: ' + "User Delete");
            }

            // Update the table
            populateTable();

        });



};
