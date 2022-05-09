// sccript for logging in, will check if user account exists in database
// Code for account enumeration - make sure validation message is generic
// Link for ref: https://www.w3schools.com/js/tryit.asp?filename=tryjs_validation_js


function validateForm() {
    let x = document.forms["myForm"]["fname"].value;
    if (x == "") {
      alert("Name must be filled out");
      return false;
    }
  }

