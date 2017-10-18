$( document ).ready(function() {
    console.log( "ready!" );
    $("#header").load("navigationSegments/topNav.html");
    resolveViewContent();
});

function resolveViewContent() {
    var url = window.location.href;
    var linkValue = url.substr(url.lastIndexOf("#") + 1);

    if (linkValue === "home" || linkValue === "schedule" || linkValue === "contact" || linkValue === "baseInfo") {
        $("#sideBar").load("navigationSegments/homeSideBar.html");
    } else if (linkValue === "weatherGraphs") {
        $("#sideBar").load("navigationSegments/weatherGraphsSideBar.html");
    }

    switch (linkValue) {
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
            $("#content").load("contentSegments/baseGraphs.html", function () {
                if(localStorage.getItem("possibleCountries")){

                }
                getPossibleCountriesToSelect(function (countries) {
                    var countrySelection = $("#countrySelection");
                    countries.forEach(function (country) {
                        var opt = document.createElement('option');
                        opt.innerHTML = country.name;
                        opt.value = country.alpha3Code;
                        countrySelection.append(opt);
                    });
                });
            });
            break;
    }
}

$(window).bind('hashchange', function() {
    resolveViewContent();
});
