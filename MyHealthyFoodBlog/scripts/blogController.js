const kinveyAppID = 'kid_r1HcX9rq';
const kinveyAppSecret = '6fa181b79182441eafaaaa4c8745cca0';
const kinveyBaseUrl = 'https://baas.kinvey.com/';

$(function() {
    showView("Home");
	showSlides();
    showHideNavigationLinks();
    $("#linkHome").click(function() {showView("Home")});
    $("#linkLogin").click(function() {showView("Login")});
    $("#linkRegister").click(function () {showView("Register")});
    $("#linkRecipes").click(function () {drawRecipes()});
    $("#linkNewRecipe").click(function() {showView("NewRecipe");});
    $("#linkMyRecipes").click(function() {drawRecipes(sessionStorage.uid); showView("MyRecipes")});
    $("#linkProfile").click(function() {profileLoadInformation(); showView("Profile")});
    $("#registerUser").click(function () {$(".UsernameError").slideUp(300)});
    $("#infoBox").click(function () {$("#infoBox").slideUp(300)});
    $("#formLogin").submit(function (f) {f.preventDefault(); login()});
    $("#formRegister").submit(function (f) {f.preventDefault(); register()});
    $("#formCreateRecipe").submit(function (f) {f.preventDefault(); createRecipe();});
    $("#formEditRecipe").submit(function (f) {f.preventDefault(); editRecipe($("#viewEditRecipe").attr("data-post-id"))});
    $(document)
        .on("click", ".recipeBox", function () {showRecipe($(this).attr("data-recipe-id"))})
        .on("click", "#buttonEditRecipe", function () {
            showEditRecipeView($("#viewShowRecipe")
                .attr("data-post-id"))
        })
        .on("click", "#buttonDeleteRecipe", function () {
            showDeleteRecipeConfirmation();
        })
        .on("click", "#confirmRecipeDelete", function () {
            deleteRecipe($('#viewShowRecipe').attr("data-post-id"));
        });
    $("#backButton").click(function () {showPreviousView()});
});

/*$("#buttonRegister").click(/!*function () {

    console.log($( "#errorBox" ).show())
    if($( "#errorBox" ).show()){
        $("#errorBox").css("display", "none")
    }
}*!/
console.log(1));*/

// slideShow start http://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_slideshow
let slideIndex = 0;
showSlides();
function showSlides() {

    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    for (i = 0; i < slides.length; i++) {
       slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex> slides.length) {slideIndex = 1}
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
    setTimeout(showSlides, 2000); // Change image every 2 seconds
}
// slideShow end


function showView(viewId) {
    let sections = $("main > section");
    let buttons = $(".navbar-link");
    let view = $("#view" + viewId);
    let button = $("#link" + viewId);
    if (!sections.is(':animated')) {
        $.when(sections.slideUp(300)).done(function() {view.slideDown(300)});
        buttons.removeClass("selected");
        button.addClass("selected");
        let currentSelection = $(".current-selection");
        $(".previous-selection").removeClass("previous-selection");
        currentSelection.addClass("previous-selection");
        currentSelection.removeClass("current-selection");
        view.addClass("current-selection");
    }
}

function showPreviousView() {
    if ($(".previous-selection").attr("id") == "viewMyRecipes") {
        showView("MyRecipes");
    } else {
        showView("Recipes");
    }
}

function showHideNavigationLinks() {
    let loggedIn = (sessionStorage.authToken != null);
    if (loggedIn) {
        $("#linkLogin").hide();
        $("#linkRegister").hide();
        $("#linkRecipes").show();
        $("#linkNewRecipe").show();
        $("#linkMyRecipes").show();
        $("#linkProfile").show();
        $("#linkLogout").show();
        $("#userGreeting").append("Здравей, " + sessionStorage.username + "!");
    } else {
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkRecipes").show();
        $("#linkNewRecipe").hide();
        $("#linkMyRecipes").hide();
        $("#linkProfile").hide();
        $("#linkLogout").hide();
        $("#userGreeting").empty();
    }
}

function login() {
    let authBase64 = btoa(kinveyAppID + ":" + kinveyAppSecret);
    let loginUrl = kinveyBaseUrl + "user/" + kinveyAppID + "/login";
    let loginData = ({
        username: $("#loginUser").val(),
        password: $("#loginPassword").val()
    });
    $.ajax({
        method: "POST",
        url: loginUrl,
        data: loginData,
        headers: {"Authorization" : "Basic " + authBase64},
        success: loginSuccess,
        error: showAjaxError
    });
    function loginSuccess(data, status) {
        sessionStorage.authToken = data._kmd.authtoken;
        sessionStorage.username = data.username;
        sessionStorage.fullname = data.fullname;
        sessionStorage.uid = data._id;
        sessionStorage.email = data.email;
        showView("Home");
        showInfo("Login Successful!");
        showHideNavigationLinks();
    }
}

function register()  {
    let regex = /^[a-zA-Z]+$/;
    if(($('#registerUser').val().length >= 5) &&($('#registerUser').val().length <= 20) && (regex.test($('#registerUser').val()))){
        var usernameReg = $('#registerUser').val();
    }else{
        showError("Потребителското име трябва да е межву 5 и 20 символа");
        $( "#errorBox" ).addClass( "UsernameError" );
        return;
    }
    if(($('#registerFullName').val().length >= 5) &&($('#registerFullName').val().length <= 30) && (regex.test($('#registerFullName').val()))){
        var fullnameReg = $('#registerFullName').val();
    }else{
        showError("Името и фалимията трябва да са между е межву 5 и 30 символа");
        return;
    }
    if ($('#registerPassword').val() === $('#registerPasswordConfirm').val()) {
        let authBase64 = btoa(kinveyAppID + ":" + kinveyAppSecret);
        let registerUrl = kinveyBaseUrl + "user/" + kinveyAppID + "/";
        let registerData = ({
            username: usernameReg,
            password: $('#registerPassword').val(),
            fullname: fullnameReg,
            email: $('#registerEmail').val()
        });
        $.ajax({
            method: "POST",
            url: registerUrl,
            data: registerData,
            headers: {"Authorization": "Basic " + authBase64},
            success: registerSuccess,
            error: showAjaxError
        });
        function registerSuccess(data, status) {
            sessionStorage.authToken = data._kmd.authtoken;
            sessionStorage.username = data.username;
            sessionStorage.fullname = data.fullname;
            sessionStorage.uid = data._id;
            sessionStorage.email = data.email;
            showView("Home");
            showHideNavigationLinks();
            showInfo("Успешна регистрация!")
        }
    } else {
        showError("Паролите не съвпадат, моля опитайте отново!");
        $('#registerPassword').val("");
        $('#registerPasswordConfirm').val("");
    }
}

function profileLoadInformation() {
    let email = $("#profileEmail").empty();
    let fullname = $("#profileFullName").empty();
    let username =  $("#profileUsername").empty();
    email.text(sessionStorage.email);
    fullname.text(sessionStorage.fullname);
    username.text(sessionStorage.username);
}

function createRecipe() {
    let recipesUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/recipes";
    let authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    let newRecipeData = {
        title: $("#recipeTitle").val(),
        category: $("#recipeCategory").val(),
        servings: $("#recipeServings").val(),
        preparationTime: $("#recipePreparationTime").val(),
        makingTime: $("#recipeMakingTime").val(),
        price: $("#recipePrice").val(),
        products: $("#tinymce").val(),
        description: $("#recipeDescription").val(),
        image: $("#recipeImageUrl").val(),
        authorId: sessionStorage.uid,
        authorUsername: sessionStorage.username,
        authorFullName: sessionStorage.fullname
    };
    console.log($("#tinymce").val());
    console.log($("#recipeProducts").val());
    $.ajax({
        method: "POST",
        url: recipesUrl,
        data: newRecipeData,
        headers: authHeaders,
        success: recipeCreated,
        error: showAjaxError
    });
    function recipeCreated(data) {
        let recipeInputFields = $("#viewNewRecipe").find("input");
        recipeInputFields.val("");
        $("#recipeDescription").val("");
        showView("Recipes");
        showInfo("Успешно публикувахте рецепта!")
    }
}

function drawRecipes(userID) {
    let getForUser = (userID != null);
    let loggedIn = (sessionStorage.authToken != null);
    let authBase64 = btoa("test:test");
    let recipesGetUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/recipes";
    let authHeaders;
    if (loggedIn){
        authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    } else {
        authHeaders = {"Authorization": "Basic " + authBase64}
    }
    $.ajax({
        method: "GET",
        url: recipesGetUrl,
        headers: authHeaders,
        success: recipesLoaded,
        error: showAjaxError
    });
    function recipesLoaded (recipes, status) {
        $("#recipes").empty();
        $("#myRecipes").empty();
        if (getForUser) {
            for (let recipe of recipes) {
                if (recipe.authorId == userID) {
                    let totalTime = parseInt(recipe.preparationTime) + parseInt(recipe.makingTime);
                    let recipeDiv = $("<div>", {"class": "recipeBox", "data-recipe-id" : recipe._id});
                    recipeDiv.append($("<div>").append($('<img>', {src: recipe.image, height: 230})));
                    recipeDiv.append($("<div class='recipeTitle'>").append(recipe.title));
                    recipeDiv.append($("<div class='recipeCategory'>").append("Категория: " + recipe.category));
                    recipeDiv.append($("<div class='recipeTotalPreparationTime'>").append("общо време за приготвяне: " + totalTime + " минути"));
                    $("#myRecipes").append(recipeDiv);
                }
            }
        } else {
            for (let recipe of recipes) {
                let totalTime = parseInt(recipe.preparationTime) + parseInt(recipe.makingTime);
                let recipeDiv = $("<div>", {class: "recipeBox", "data-recipe-id" : recipe._id});
                recipeDiv.append($("<div>").append($('<img>', {src: recipe.image, height: 230})));
                recipeDiv.append($("<div class='recipeTitle'>").append(recipe.title));
                recipeDiv.append($("<div class='recipeCategory'>").append("Категория: " + recipe.category));
                recipeDiv.append($("<div class='recipeTotalPreparationTime'>").append("общо време за приготвяне: " + totalTime + " минути"));
                $("#recipes").append(recipeDiv);
            }
            showView("Recipes");
        }
    }
}

function showRecipe(recipeId) {
    let loggedIn = (sessionStorage.authToken != null);
    let authBase64 = btoa("test:test");
    let recipeGetUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/recipes/" + recipeId;
    let authHeaders;
    if (loggedIn){
        authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    } else {
        authHeaders = {"Authorization": "Basic " + authBase64}
    }
    $.ajax({
        method: "GET",
        url: recipeGetUrl,
        headers: authHeaders,
        success: recipeLoaded,
        error: showAjaxError
    });
    function recipeLoaded(recipe) {
        $(".func").remove();
        $('#showRecipeTitle').text(recipe.title);
        $('#showRecipeCategory').text(recipe.category);
        $('#showRecipeServings').text(recipe.servings);
        $('#showRecipePreparationTime').text(recipe.preparationTime);
        $('#showRecipeMakingTime').text(recipe.makingTime);
        $('#showRecipePrice').text(recipe.price);
        $('#showRecipeProducts').text(recipe.products);
        $('#showRecipeDescription').text(recipe.description);
        $('#showRecipeImage').prop("src", recipe.image);
        $('#showRecipeUser').text(recipe.authorUsername);
        let sel = $('#viewShowRecipe');
        sel.attr("data-post-id", recipeId);
        sel.attr("data-post-category", recipe.category);
        if (recipe.authorId == sessionStorage.uid) {
            sel.append($("<div>").append($("<button class='func button' id='buttonEditRecipe'>Редактирай рецепта</button>")));
            sel.append($("<div>").append($("<button class='func button' id='buttonDeleteRecipe'>Изтрий рецепта" +
                "</button>")));
        }
        showView("ShowRecipe");
    }
}

function showEditRecipeView(recipeId) {
    $("#viewEditRecipe").attr("data-post-id", recipeId);
    let postTitle = $('#showRecipeTitle').text();
    let postCategory = $('#showRecipeCategory').attr("data-post-category");
    let postServings = $('#showRecipeServings').text();
    let postPreparationTime = $('#showRecipePreparationTime').text();
    let postRecipeMakingTime = $('#showRecipeMakingTime').text();
    let postPrice = $('#showRecipePrice').text();
    let postProducts = $('#showRecipeProducts').text();
    let postDescription = $('#showRecipeDescription').text();
    let postImage= $('#showRecipeImage').attr("src");
    $('#recipeTitleEdit').val(postTitle);
    $('#recipeCategoryEdit').val(postCategory);
    $('#showRecipeServingsEdit').val(postServings);
    $('#showRecipePreparationTimeEdit').val(postPreparationTime);
    $('#showRecipeMakingTimeEdit').val(postRecipeMakingTime);
    $('#showRecipePriceEdit').val(postPrice);
    $('#showRecipeProductsEdit').val(postProducts);
    $('#recipeDescriptionEdit').val(postDescription);
    $('#showRecipeImageEdit').val(postImage);
    showView("EditRecipe");
}

function editRecipe(recipeId) {
    let recipeEditUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/recipes/" + recipeId;
    let authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    let putData = {
        title: $("#recipeTitleEdit").val(),
        category: $("#recipeCategoryEdit").val(),
        servings: $("#recipeServingsEdit").val(),
        preparationTime: $("#recipePreparationTimeEdit").val(),
        makingTime: $("#recipeMakingTimeEdit").val(),
        price: $("#recipePriceEdit").val(),
        products: $("#recipeProductsEdit").val(),
        description: $("#recipeDescriptionEdit").val(),
        image: $("#recipeImageUrlEdit").val(),
        authorId: sessionStorage.uid,
        authorUsername: sessionStorage.username,
        authorFullName: sessionStorage.fullname
    };
    $.ajax({
        method: "PUT",
        url: recipeEditUrl,
        data: putData,
        headers: authHeaders,
        success: recipeEdited,
        error: showAjaxError
    });
    function recipeEdited(data) {
        showInfo("Успешно редактирахте рецепта!");
        showView("MyRecipes");
    }
}

function showDeleteRecipeConfirmation() {
    $("#buttonDeleteRecipe").after($("<div style='display: none;'>Изтрива цялата рецепта! <br/> Click the button to confirm and delete the recipe: <div><button class='func button' id='confirmRecipeDelete'>Confirm</button></div>").fadeIn(300)).hide();
}

function deleteRecipe(recipeId) {
    let recipeDeleteUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/recipes/" + recipeId;
    let authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    $.ajax({
        method: "DELETE",
        url: recipeDeleteUrl,
        headers: authHeaders,
        success: recipeDeleted,
        error: showAjaxError
    });
    function recipeDeleted(data) {
        showInfo("Успешно изтрихте рецепта!");
        drawRecipes(sessionStorage.uid);
        showView("MyRecipes");
    }
}

function showAjaxError(data, status) {
    let errorMsg = '';
    if (typeof(data.readyState) != "undefined" && data.readyState == 0) {
        errorMsg = "Проблем с установяването на връзка със сайта. Моля свържете се с интернет доставчика си!"
    }
    else if (data.responseJSON && data.responseJSON.description) {
        errorMsg = data.responseJSON.description;
    } else {
        errorMsg = "Error: " + JSON.stringify(data)
    }
    $('#errorBox').text(errorMsg).slideDown(100);
}

function showInfo(messageText) {
    $('#infoBox').text(messageText).slideDown(100).delay(1000).slideUp(100);
}

function showError(messageText) {
    $('#errorBox').text(messageText).slideDown(100);
}

$(document).ajaxStart(function(){
    $("#loadingBox").slideDown(100);
})
    .ajaxStop(function() {
        $("#loadingBox").slideToggle(100);
    });

function logout() {
    sessionStorage.clear();
    showView("Home");
    showHideNavigationLinks();
    showInfo("Успешно напуснахте профила си.");
}
