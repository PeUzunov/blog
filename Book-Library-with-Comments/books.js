const kinveyServiceUrl = 'https://baas.kinvey.com/';
const kinveyAppID = 'kid_rJVIqufL';
const kinveyAppSecret = '6a406f7b7c2149a793ae870e23896e72';

function showView(viewId) {
	$("main > section").hide();
	$("#" + viewId).show();
}

function showHideNavigationLinks() {
	$("#linkHome").show();
	let loggedIn = sessionStorage.authToken != null;
	if (loggedIn) {
		$("#linkLogin").hide();
		$("#linkRegister").hide();
		$("#linkListBooks").show();
		$("#linkCreateBook").show();
		$("#linkLogout").show();
	} else {
		$("#linkLogin").show();
		$("#linkRegister").show();
		$("#linkListBooks").hide();
		$("#linkCreateBook").hide();
		$("#linkLogout").hide();
	}
}

function showHomeView() {
	showView('viewHome');
}

function showLoginView() {
	showView('viewLogin');
}

function  login() {
	let authBase64 = btoa(kinveyAppID + ":" + kinveyAppSecret);
	let loginUrl = kinveyServiceUrl + "user/" + kinveyAppID + "/login";
	let loginData = {
		username: $("#loginUser").val(),
		password: $("#loginPass").val()
	};

	$.ajax({
		method: "POST",
		url: loginUrl,
		data: loginData,
		headers: { "Authorization": "Basic " + authBase64 },
		success: loginSuccess,
		error: showAjaxError
	});

	function loginSuccess(data, status) {
		sessionStorage.authToken = data._kmd.authtoken;
		showListBooksView();
		showHideNavigationLinks();
		showInfo("Login successful");
	}
}

function showInfo(messageText) {
	$("#infoBox").text(messageText).show().delay(3000).fadeOut() ;
}

function showAjaxError(data, status) {
	let errorMsg = "Error:" + JSON.stringify(data);
	$('#errorBox').text(errorMsg).show();
}

function showRegisterView() {
	showView('viewRegister');
}

function register() {
	let authBase64 = btoa(kinveyAppID + ":" + kinveyAppSecret);
	let loginUrl = kinveyServiceUrl + "user/" + kinveyAppID + "/";
	let loginData = {
		username: $("#registerUser").val(),
		password: $("#registerPass").val()
	};

	$.ajax ({
		method:"POST",
		url: loginUrl,
		data: loginData,
		headers: { "Authorization": "Basic " + authBase64 },
		success: registerSuccess,
		error: showAjaxError
	});

	function registerSuccess(data, status) {
		sessionStorage.authToken = data._kmd.authtoken;
		showListBooksView();
		showHideNavigationLinks();
		showInfo("User registered successfully");
	}

}


function showListBooksView() {
	$('#books').empty();
	showView('viewListBooks');
	let booksUrl = kinveyServiceUrl + "appdata/" + kinveyAppID + "/books";
	let authHeaders = { "Authorization": "Kinvey " + sessionStorage.authToken
	};
	$.ajax({
		method: "GET",
		url: booksUrl,
		headers: authHeaders,
		success: booksLoaded,
		error: showAjaxError,
	});

	function booksLoaded(books, status) {
		showInfo("Books loaded.");

		let booksTable = $("<table>").append($("<tr>")
			.append($('<th>Title</th>'))
			.append($('<th>Author</th>'))
			.append($('<th>Description</th>'))
		);

		for (let book of books) {
			var bookTitle = book.title;
			booksTable.append($("<tr>")
				.append($('<td></td>').text(book.title))
				.append($('<td></td>').text(book.author))
				.append($('<td></td>').text(book.description))
			);

			var bookString = JSON.stringify(book);

			var commentForm = $('<form class="formComment" style="display: none">')
				.append($('<label for="commentAuthor">Your Name: </label>'))
				.append($('<input type="text" id="commentAuthor"/>'))
				.append($('<label for="commentText">Your comment: </label>'))
				.append($('<input type="text" id="commentText"/>'))
				.append($("<input type='hidden' class='bookData' value='"+bookString+"' />"))
				.append($('<button class="addComment" type="button" onclick="addComment()" >Add Comment</button>'))
				.append($('<input id="Cancel" type="button" value="Cancel" onclick="cancelComment()"/>'))
				.append($('</form>'));
			var comWrap = $('<div class="comment-wrap"></div>');

			if (book.comments != null){
				for (var i=0; i < book.comments.length; i++){
					var comment = book.comments[i];
					let comText = $('<div></div>').text('"' + comment.commentText + '"');
					let comAuth = $('<div><i>-- ' + comment.commentAuthor + ' --</i></div>');

					comWrap.append(comText, comAuth);
				}
			}

			comWrap.append($('<a href="#formComment" class="more" onclick="showFormComments()">Add Comment</a>'));
			comWrap.append(commentForm);
			booksTable.append($("<tr>")
				.append($('<td colspan="3"></td>').append(comWrap))
			);
		}
		$("#books").append(booksTable);//video time point: 2:12:22

	}
}

function showFormComments() {
	let a = document.activeElement; // in this case it is the <a> element
	a.style.display = 'none';
	a.nextElementSibling.style.display = 'inline-block'; // nextElementSibling is the hidden form
}

function addComment() {
	let buttonFormSubmit = document.activeElement;
	let parent = buttonFormSubmit.parentNode; //stores the parent node of the active element
	/*
	 var buttonIndex = Array.prototype.indexOf.call(parent.children, buttonFormSubmit);
	 checks the index of the active element
	 which in our case was [5] for the formComment submit button
	 */
	let nodes = parent.childNodes; // creates an array of all the child nodes
	let commentAuthor = nodes[1].value;
	let commentText = nodes[3].value;
	let bookData = nodes[4].value;
	let bookJSON = JSON.parse(bookData); //converts the bookData from string format to JSON
	addBookComment(bookJSON, commentText, commentAuthor);
}

function cancelComment() {
	let buttonFormCancel = document.activeElement;
	let parent = buttonFormCancel.parentNode;
	parent.style.display = 'none';
	parent.previousElementSibling.style.display = 'inline-block';
}

function addBookComment (bookData, commentText, commentAuthor) {
	let booksUrl = kinveyServiceUrl + "appdata/" + kinveyAppID + "/books";
	let authHeaders = {
		"Authorization": "Kinvey " + sessionStorage.authToken,
		"Content-type": "application/Json"
	};
	if (!bookData.comments) {
		bookData.comments = [];
	}
	bookData.comments.push({commentAuthor: commentAuthor, commentText: commentText});
	$.ajax({
		method: "PUT",
		url: booksUrl + "/" + bookData._id,
		headers: authHeaders,
		data: JSON.stringify(bookData),
		success: addBookCommentSuccess,
		error: showAjaxError
	});
	function addBookCommentSuccess(data, status) {
		showListBooksView();
		showInfo('Book comment added.')
	}
}

function showCreateBookView() {
	showView('viewCreateBook');
}

function createBook() {
	$("#createBook").text('');
	let booksUrl = kinveyServiceUrl + "appdata/" + kinveyAppID + "/books";
	let authHeaders = {
		"Authorization": "Kinvey " + sessionStorage.authToken
	};
	let newBookData = {
		title: $("#bookTitle").val(),
		author: $("#bookAuthor").val(),
		description: $("#bookDescription").val(),
	};

	$.ajax({
		method: "POST",
		url: booksUrl,
		data: newBookData,
		headers: authHeaders,
		success: bookCreated,
		error: showAjaxError
	});

	function bookCreated(data) {
		showListBooksView();
		showInfo("Books created.");
	}
}

function logout() {
	sessionStorage.clear();
	showHideNavigationLinks();
}

$(function () {
	$("#linkHome").click(showHomeView);
	$("#linkLogin").click(showLoginView);
	$("#linkRegister").click(showRegisterView);
	$("#linkListBooks").click(showListBooksView);
	$("#linkCreateBook").click(showCreateBookView);
	$("#linkLogout").click(logout);

	$("#formLogin").submit(function(e) {e.preventDefault(); login()});
	$("#formRegister").submit(function(e) {e.preventDefault(); register()});
	$("#formCreateBook").submit(function(e) {e.preventDefault(); createBook()});

	showHomeView();
	showHideNavigationLinks();

	$(document)
		.ajaxStart(function() {
			$("#loadingBox").show();
		})
		.ajaxStop(function() {
			$("#loadingBox").hide();
		})
});

