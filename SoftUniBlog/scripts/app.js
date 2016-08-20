(function () {

    let baseUrl = "https://baas.kinvey.com"; // Create your own kinvey application

    let appKey = "kid_HJtv_4SL"; // Place your appKey from Kinvey here...

    let appSecret = "1c2b48aa02894f50bab6e09c4b034beb"; // Place your appSecret from Kinvey here...

    let _guestCredentials = "cd0dc8d6-eb7a-4f34-8589-7c11cc564911.CtkwadxMh1RH1h+1lrTtqOr0QImTwiOwrbPrVKgNkD0="; // Create a guest user using PostMan/RESTClient/Fiddler and place his authtoken here...

    //Create AuthorizationService and Requester
    let authService = new AuthorizationService(
        baseUrl,
        appKey,
        appSecret,
        _guestCredentials
    );
    authService.initAuthorizationType("Kinvey");
    let requester = new Requester(authService);

    let selector = ".wrapper";
    let mainContentSelector = ".main-content";

    // Create HomeView, HomeController, UserView, UserController, PostView and PostController
    let homeView = new HomeView(selector, mainContentSelector);
    let homeController = new HomeController(homeView, requester, baseUrl, appKey);

    let userView = new UserView(selector, mainContentSelector);
    let userController = new UserController(userView, requester, baseUrl, appKey);
    
    let postView = new PostView(selector, mainContentSelector);
    let postController = new PostController(postView, requester, baseUrl, appKey);

    initEventServices();

    onRoute("#/",
        // Check if user is logged in and if its not show the guest page, otherwise show the user page...
        function () {
        if (authService.isLoggedIn()){
            homeController.showUserPage();
        }
        else{
            homeController.showGuestPage();
        }
    });

    onRoute("#/post-:id", function () {
       let top = $("#post-" + this.params['id'])
           .position().top;
        $(window).scrollTop(top);
    });

    onRoute("#/login", function () {
        userController.showLoginPage(authService.isLoggedIn());
    });

    onRoute("#/register", function () {
        userController.showRegisterPage(authService.isLoggedIn());
    });

    onRoute("#/logout", function () {
        userController.logout();
    });

    onRoute('#/posts/create', function () {
        // Show the new post page...
        let data = {
            fullName: sessionStorage['fullName']
        }
        postController.showCreatePostPage(data, authService.isLoggedIn());
    });

    bindEventHandler('login', function (ev, data) {
        // Login the user...
        userController.login(data);
    });

    bindEventHandler('register', function (ev, data) {
        // Register a new user...
        userController.register(data);
    });

    bindEventHandler('createPost', function (ev, data) {
        // Create a new post...
        postController.createNewPost(data);
    });

    run('#/');
})();
