$( document ).ready(function() {
    console.log( "ready!" );
    $("#header").load("navigationSegments/topNav.html");
    $("#sideBar").load("navigationSegments/homeSideBar.html");



});


function openNav() {
    $("#sideBar nav").css("width", "250px");
}

function closeNav() {
    $("#sideBar nav").css("width", "0px");
}

$(window).bind('hashchange', function() {
     var url = window.location.href;
     var linkValue = url.substr(url.lastIndexOf("#") + 1);

     if(linkValue === "home" || linkValue === "schedule" || linkValue === "contact" || linkValue === "baseInfo"){
         $("#sideBar").load("navigationSegments/homeSideBar.html");
     } else if(linkValue === "weatherGraphs"){
         $("#sideBar").load("navigationSegments/weatherGraphsSideBar.html");
     }

     switch (linkValue){
         case "home":
         case "baseInfo":
             $("#content").load("contentSegments/baseInfo.html");
             break;
         case "schedule":
             $("#content").load("contentSegments/schedule.html");
             break;
         case "contact":
             $("#content").load("contentSegments/contact.html");
             break;
         case "weatherGraphs":
         case "baseGraphs":
             $("#content").load("contentSegments/baseGraphs.html");
             break;
     }
});
