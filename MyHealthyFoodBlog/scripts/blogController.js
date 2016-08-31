const kinveyAppID = 'kid_r1HcX9rq';
const kinveyAppSecret = '6fa181b79182441eafaaaa4c8745cca0';
const kinveyBaseUrl = 'https://baas.kinvey.com/';

$(function() {
    showView("Home");
    drawLastThreeRecipes();
    carousel();
    showHideNavigationLinks();
    $("#linkHome").click(function() {showView("Home")});
    $("#linkLogin").click(function() {showView("Login")});
    $("#linkRegister").click(function () {showView("Register")});
    $("#linkRecipes").click(function () {drawRecipes()});
    $("#linkNewRecipe").click(function() {showView("NewRecipe");});
    $("#linkMyRecipes").click(function() {drawRecipes(sessionStorage.uid); showView("MyRecipes")});
    $("#linkProfile").click(function() {profileLoadInformation(); showView("Profile")});
    //Admin view only
    $("#linkUsers").click(function() {drawUsers(); showView("Users")});
    //Admin view only
    $("#linkBloggerInformation").click(function() {bloggerInformation(); showView("#")});
    $("body").click(function () {$("#errorBox").slideUp(300)});
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
        });
    $("#backButton").click(function () {showPreviousView()});
    $(window).on("scroll", function () {
        var scroll = $(window).scrollTop();
        if(scroll > 200){
            $(".backToTopContainer").fadeIn(500);
        }else{
            $(".backToTopContainer").fadeOut(500);
        }
    });
});

// slideShow start
var myIndex = 0;
$(document).ready(function(){
    carousel()
});

function carousel() {
    var i;
    var x = document.getElementsByClassName("mySlides");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    myIndex++;
    if (myIndex > x.length) {myIndex = 1}
    x[myIndex-1].style.display = "block";
    setTimeout(carousel, 2000); // Change image every 2 seconds
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
// Filter recipes start
function selectFilter(filterId) {
    let sections = $("main > section");
    let buttons = $(".recipeCategoriesFilter-filter");
    let button = $("#link" + filterId);
    if (!sections.is(':animated')) {

        buttons.removeClass("selected");
        button.addClass("selected");
        let currentSelection = $(".current-selection");
        $(".previous-selection").removeClass("previous-selection");
        currentSelection.addClass("previous-selection");
        currentSelection.removeClass("current-selection");

    }
}
// Filter recipes end

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
        //Admin view only
        if (sessionStorage.username == 'admin') {
            $("#linkUsers").show();
        }
        //Admin view only
    } else {
        $("#linkLogin").show();
        $("#linkRegister").show();
        $("#linkRecipes").show();
        $("#linkNewRecipe").hide();
        $("#linkMyRecipes").hide();
        $("#linkProfile").hide();
        //Admin view only
        $("#linkUsers").hide();
        //Admin view only
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
        showInfo("Успешно влязохте в профила си!");
        showHideNavigationLinks();
    }
}

function register()  {
    let regexUsermane = /^[a-zA-Z0-9]+$/;
    let regexPassword = /^[a-zA-Z0-9]+$/;
    let regexFullname = /^[a-zA-Z ]+$/;
    let regexEmail = /^[a-zA-Z]+[+a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

    if(($('#registerUser').val().length >= 5) &&($('#registerUser').val().length <= 20) && (regexUsermane.test($('#registerUser').val()))){
        var usernameReg = $('#registerUser').val();
    }else{
        showError("Потребителското име трябва да е между 5 и 20 символа букви и/или цифри");

        return;
    }

    if(($('#registerPassword').val().length >= 5) &&($('#registerPassword').val().length <= 30) && (regexPassword.test($('#registerPassword').val()))){
        var passwordReg = $('#registerPassword').val();
    }else{
        showError("Паролата трябва да са между е между 5 и 30 символа букви и/или цифри");

        $('#registerPassword').val("");
        return;
    }

    if(($('#registerPasswordConfirm').val().length >= 5) &&($('#registerPasswordConfirm').val().length <= 30) && (regexPassword.test($('#registerPasswordConfirm').val()))){
        var passwordReg = $('#registerPasswordConfirm').val();
    }else{
        showError("Паролата трябва да са между е между 5 и 30 символа букви и/или цифри");

        $('#registerPasswordConfirm').val("");
        return;
    }

    if ($('#registerPassword').val() !== $('#registerPasswordConfirm').val()) {
        showError("Паролите не съвпадат, моля опитайте отново!");
        $('#registerPassword').val("");
        $('#registerPasswordConfirm').val("");
        return;
    }

    if(($('#registerFullName').val().length >= 5) &&($('#registerFullName').val().length <= 30) && (regexFullname.test($('#registerFullName').val()))){
        var fullnameReg = $('#registerFullName').val();
    }else{
        showError("Името и фалимията трябва да са между 5 и 30 символа съставено единствено от букви");

        return;
    }

    if(($('#registerEmail').val().length >= 5) &&($('#registerEmail').val().length <= 30) && (regexEmail.test($('#registerEmail').val()))){
        var emailReg = $('#registerEmail').val();
    }else{
        showError("Невалиден имейл адрес. Моля опитайте отново!");

        return;
    }

    let authBase64 = btoa(kinveyAppID + ":" + kinveyAppSecret);
    let registerUrl = kinveyBaseUrl + "user/" + kinveyAppID + "/";
    let registerData = ({
        username: usernameReg,
        password: passwordReg,
        fullname: fullnameReg,
        email: emailReg,
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
        showInfo("Успешна регистрация!");
    }

}
// TODO: users should be able to change their emails
function profileLoadInformation() {
    let email = $("#profileEmail").empty();
    let fullname = $("#profileFullName").empty();
    let username =  $("#profileUsername").empty();
    email.text(sessionStorage.email);
    fullname.text(sessionStorage.fullname);
    username.text(sessionStorage.username);
}

function bloggerInformation() { // TODO: Information about the blogger, Admin should be able to edit it
    alert("Предстой да бъде разработено!");
}

function createRecipe() {  // pravi buton submit, trqbav da napisnesh publikuvai dva pati za da sazdade recepta
    let ospry = new Ospry('pk-prod-dl2v8imnl11h4iauctvxg9k0');
    let uploadURL;
    let fileName = $('#fileName').val;
    //console.log(fileName);
    let onUpload = function(err, metadata) {
        ospry.get({
            url: metadata.url,
            maxHeight: 400
        });
        uploadURL = metadata.url;
        console.log(uploadURL);

        let recipesUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/recipes";

        let uploadData = {
            title: $("#recipeTitle").val(),
            category: $("#recipeCategory").val(),
            servings: $("#recipeServings").val(),
            preparationTime: $("#recipePreparationTime").val(),
            makingTime: $("#recipeMakingTime").val(),
            price: $("#recipePrice").val(),
            products: $("#recipeProducts").val(),
            description: $("#recipeDescription").val(),
            image: $("#recipeImageUrl").val(),
            file: uploadURL, // patq za upload
            date: moment().locale("bg").format('llll'),
            authorId: sessionStorage.uid,
            authorUsername: sessionStorage.username,
            authorFullName: sessionStorage.fullname,
            authorAuthToken: sessionStorage.authToken
        };

        let authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
            $.ajax({
                method: "POST",
                url: recipesUrl,
                data: uploadData,
                headers: authHeaders,
                success: recipeCreated,
                error: showAjaxError
        });
    };

    function recipeCreated(data) {
        let recipeInputFields = $("#viewNewRecipe").find("input");
        let recipeTextAreaFields = $("#viewNewRecipe").find("textarea");
        recipeInputFields.val("");
        recipeTextAreaFields.val("");
        // tinyMCE.activeEditor.setContent(''); // Text Editor
        showView("Recipes");
        showInfo("Успешно публикувахте рецепта!")
    }

    $('#formCreateRecipe').submit(function(e) {
        //console.log(e)
        e.preventDefault();
        ospry.up({
            form: this,
            imageReady: onUpload
        });
    });
}

// Admin functionality start
function drawUsers(userID) {
    let recipesGetUrl = kinveyBaseUrl + "user/" + kinveyAppID + "/";
    let authHeaders = {"Authorization": "Kinvey " + sessionStorage.authToken};
    $.ajax({
        method: "GET",
        url: recipesGetUrl,
        headers: authHeaders,
        success: usersLoaded,
        error: showAjaxError
    });

    function usersLoaded(users, status) {
        showInfo("Таблицата със всички потребители е успешно заредена");
        let usersTable = $("<table>")
            .append($("<tr>")
                .append($('<th>Потребителско име:</th>'))
                .append($('<th>Име и фамилия</th>'))
                .append($('<th>Имейл адрес</th>'))
                .append($('<th>Parola</th>'))
            );
        for (let user of users) {
            usersTable.append(($("<tr>"))
                .append($('<td></td>').text(user.username))
                .append($('<td></td>').text(user.fullname))
                .append($('<td></td>').text(user.email))
                .append($('<td></td>').text(user._id))
                .append($('<button class="editUserProfile" type="button" onclick="editUserProfile()" >Детайли</button>'))
            );
        }
        $("#users").append(usersTable);
    }
}

function editUserProfile() { // TODO: Admin should be able to Edit and Delete users' data
    alert("Предстой да бъде разработено!");
}
// Admin functionality end

//Show last 3 recipes on Home page start
function drawLastThreeRecipes() {
    let authBase64 = btoa("guest:guest");
    let recipesGetUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/recipes";
    let authHeaders = {"Authorization": "Basic " + authBase64};

    $.ajax({
        method: "GET",
        url: recipesGetUrl,
        headers: authHeaders,
        success: lastThreeRecipesLoaded,
        error: showAjaxError
    });

    function lastThreeRecipesLoaded(recipes) { // TODO; check if there are 3 recipes
        for(let i = 0; i < 3; i++) {
            let recipeDiv = $("<div>", {class: "recipeBox", "data-recipe-id" : recipes[i]._id});
            recipeDiv.append($("<div class='recipeTitle'>").append(recipes[i].title));
            recipeDiv.append($("<div class='recipeCategory'>").append("Категория: " + recipes[i].category));
            recipeDiv.append($("<div class='recipeAuthor'>").append("Пулбикувана от " + recipes[i].authorFullName));
            recipeDiv.append($("<div class='recipeDate'>").append("на " + recipes[i].date));
            $("#lastThreeRecipes").append(recipeDiv);
        }
    }
}
//Show last 3 recipes on Home page end

function drawRecipes(userID) {
    let getForUser = (userID != null);
    let loggedIn = (sessionStorage.authToken != null);
    let authBase64 = btoa("guest:guest");
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

// Filter recipes start // TODO: filter by category
    $("#linkFilterCategoryAll").click(function() {selectFilter("FilterCategoryAll")});
    $("#linkFilterCategorySalads").click(function() {selectFilter("FilterCategorySalads")});
    $("#linkFilterCategoryBreads").click(function() {selectFilter("FilterCategoryBreads")});
    $("#linkFilterCategoryBreakfast").click(function() {selectFilter("FilterCategoryBreakfast")});
    $("#linkFilterCategoryMainDishes").click(function() {selectFilter("FilterCategoryMainDishes")});
    $("#linkFilterCategoryDeserts").click(function() {selectFilter("FilterCategoryDeserts")});
    $("#linkFilterCategoryVegetarian").click(function() {selectFilter("FilterCategoryVegetarian")});
    $("#linkFilterCategoryGlutenFree").click(function() {selectFilter("FilterCategoryGlutenFree")});
    $("#linkFilterCategoryVegan").click(function() {selectFilter("FilterCategoryVegan")});
    $("#linkFilterCategoryForDiabetics").click(function() {selectFilter("FilterCategoryForDiabetics")});
    $("#linkFilterCategoryOther").click(function() {selectFilter("FilterCategoryOther")});
// Filter recipes end


    function recipesLoaded ( recipes, status) {
        $("#recipes").empty();
        $("#myRecipes").empty();
        if (getForUser) {
            for (let recipe of recipes) {
                if (recipe.authorId == userID) {
                    let totalTime = parseInt(recipe.preparationTime) + parseInt(recipe.makingTime);
                    if(totalTime >= 60) {
                        var hours = Math.trunc(totalTime / 60) + " часа и ";
                        var minutes = totalTime % 60 + " минути";
                    } else if (totalTime < 60){
                        hours = '';
                        minutes = totalTime + " минути"
                    }
                    let recipeDiv = $("<div>", {"class": "recipeBox", "data-recipe-id" : recipe._id});
                    // recipeDiv.append($("<div>").append($('<img>', {src: recipe.image, height: 230})));
                    recipeDiv.append($("<div class='recipeTitle'>").append(recipe.title));
                    recipeDiv.append($("<div class='recipeImageUpload'>").html($('<a href='+ recipe.file +' target="_blank"><img src=' + recipe.file + '></a>')));
                    recipeDiv.append($("<div class='recipeCategory'>").append("Категория: " + recipe.category));
                    recipeDiv.append($("<div class='recipeProducts'>").append("Необходими продукти: " + recipe.products));
                    recipeDiv.append($("<div class='recipeTotalPreparationTime'>").append("общо време за приготвяне: " + hours + minutes));
                    $("#myRecipes").append(recipeDiv);
                }
            }
        } else {
            for (let recipe of recipes) {
                /*if(recipe.category !== "Основни"){ // TODO: filter by category code
                    continue;
                }*/
                let totalTime = parseInt(recipe.preparationTime) + parseInt(recipe.makingTime);
                if(totalTime >= 60) {
                    var hours = Math.trunc(totalTime / 60) + " часа и ";
                    var minutes = totalTime % 60 + " минути";
                }else if (totalTime < 60){
                    hours = '';
                    minutes = totalTime + " минути"
                }
                let recipeDiv = $("<div>", {class: "recipeBox", "data-recipe-id" : recipe._id});
                // recipeDiv.append($("<div>").append($('<img>', {src: recipe.image})));
                recipeDiv.append($("<div class='recipeTitle'>").append(recipe.title));
                recipeDiv.append($("<div class='recipeImageUpload'>").html($('<a href='+ recipe.file +' target="_blank"><img src=' + recipe.file + '></a>')));
                recipeDiv.append($("<div class='recipeCategory'>").append("Категория: " + recipe.category));
                recipeDiv.append($("<div class='recipeProducts'>").append("Необходими продукти: " + recipe.products));
                recipeDiv.append($("<div class='recipeTotalPreparationTime'>").append("общо време за приготвяне: " + hours + minutes));
                $("#recipes").append(recipeDiv);
            }
            showView("Recipes");
        }
    }
}

function showRecipe(recipeId) {
    let loggedIn = (sessionStorage.authToken != null);
    let authBase64 = btoa("guest:guest");
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
        //Admin view start
        if (sessionStorage.username == 'admin') {
            $('#showAuthorFullName').text(recipe.authorFullName);
            $('#showAuthorAuthorId').text(recipe.authorId);
            $('#showAuthorUsernamme').text(recipe.authorUsername);
            $('#showAuthorAuthToken').text(recipe.authorAuthToken);
        }
        //Admin view end

        $('#showRecipeDate').text(recipe.date);
        $('#showRecipeTitle').text(recipe.title); //+ "zagavietoOOOO");
        $('#showRecipeCategory').text(recipe.category);
        $('#showRecipeServings').text(recipe.servings);
        $('#showRecipePreparationTime').text(recipe.preparationTime);
        $('#showRecipeMakingTime').text(recipe.makingTime);
        $('#showRecipePrice').text(recipe.price);
        $('#showRecipeProducts').html(recipe.products);
        $('#showRecipeDescription').html(recipe.description);
        $('#showRecipeImage').prop("src", recipe.image);
        $('#showRecipeUser').text(recipe.authorUsername);
        let sel = $('#viewShowRecipe');
        sel.attr("data-post-id", recipeId);
        sel.attr("data-post-category", recipe.category);
        if ((recipe.authorId == sessionStorage.uid) || (sessionStorage.username == 'admin')) {
            sel.append($("<div>").append($("<button class='func button' id='buttonEditRecipe'>Редактирай рецепта</button>")));
            sel.append($("<div>").append($("<button class='func button' id='buttonDeleteRecipe'>Изтрий рецепта" +
                "</button>")));
        }
        showView("ShowRecipe");
    }
}

function showEditRecipeView(recipeId) {
    $("#viewEditRecipe").attr("data-post-id", recipeId);

    let recipeTitle = $('#showRecipeTitle').text();
    let recipeCategory = $('#showRecipeCategory').attr("data-post-category");
    let recipeServings = $('#showRecipeServings').text();
    let recipePreparationTime = $('#showRecipePreparationTime').text();
    let recipeRecipeMakingTime = $('#showRecipeMakingTime').text();
    let recipePrice = $('#showRecipePrice').text();
    let recipeProducts = $('#showRecipeProducts').text();
    let recipeDescription = $('#showRecipeDescription').text();
    let recipeImage= $('#showRecipeImage').attr("src");

    $('#recipeTitleEdit').val(recipeTitle);
    $('#recipeCategoryEdit').val(recipeCategory);
    $('#showRecipeServingsEdit').val(recipeServings);
    $('#showRecipePreparationTimeEdit').val(recipePreparationTime);
    $('#showRecipeMakingTimeEdit').val(recipeRecipeMakingTime);
    $('#showRecipePriceEdit').val(recipePrice);
    $('#showRecipeProductsEdit').val(recipeProducts);
    $('#recipeDescriptionEdit').val(recipeDescription);
    $('#showRecipeImageEdit').val(recipeImage);
    showView("EditRecipe");
}

function editRecipe(recipeId) {
    let authorFullNameEdit = sessionStorage.fullname;
    let authorIdEdit = sessionStorage.uid;
    let authorUsernameEdit = sessionStorage.username;
    let authorAuthTokenEdit = sessionStorage.authToken;

    let recipeEditUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/recipes/" + recipeId;
    if (sessionStorage.username == 'admin') {
        authorFullNameEdit = $('#showAuthorFullName').text();
        authorIdEdit = $('#showAuthorAuthorId').text();
        authorUsernameEdit = $('#showAuthorUsernamme').text();
        authorAuthTokenEdit = $('#showAuthorAuthToken').text();
    }

    let authHeaders = {"Authorization": "Kinvey " + authorAuthTokenEdit};

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
        date: moment().locale("bg").format('llll'),
        authorFullName: authorFullNameEdit,
        authorId: authorIdEdit,
        authorUsername: authorUsernameEdit,
        authorAuthToken: authorAuthTokenEdit
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
    if (window.confirm('Наистина ли искате да изтриете рецептата?'))
    {
        deleteRecipe($('#viewShowRecipe').attr("data-post-id"));
    }
}

function deleteRecipe(recipeId) {
    let authorAuthTokenEdit = sessionStorage.authToken;
    if (sessionStorage.username == 'admin') {
        authorAuthTokenEdit = $('#showAuthorAuthToken').text();
    }
    console.log(authorAuthTokenEdit + " sled definirane");
    let recipeDeleteUrl = kinveyBaseUrl + "appdata/" + kinveyAppID + "/recipes/" + recipeId;
    let authHeaders = {"Authorization": "Kinvey " + authorAuthTokenEdit};
    console.log(authorAuthTokenEdit + " predi ajax");
    $.ajax({
        method: "DELETE",
        url: recipeDeleteUrl,
        headers: authHeaders,
        success: recipeDeleted,
        error: showAjaxError
    });
    function recipeDeleted(data) {
        showInfo("Рецептата беше успешно изтрита!");
        drawRecipes(sessionStorage.uid);
        showView("MyRecipes");
    }
    console.log(authorAuthTokenEdit + " v kraq");
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
