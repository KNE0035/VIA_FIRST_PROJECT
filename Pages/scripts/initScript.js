$( document ).ready(function() {
    console.log( "ready!" );
    $("#header").load("segments/topNav.html");
    $("#sideBar").load("segments/aboutAuthorSideBar.html");
});


function openNav() {
    $("#sideBar nav").css("width", "250px");
}

function closeNav() {
    $("#sideBar nav").css("width", "0px");
}
