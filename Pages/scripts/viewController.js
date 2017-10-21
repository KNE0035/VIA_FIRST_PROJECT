var viewController = new ViewController();

toastr.options = {
    "timeOut": "2500",
}

$( document ).ready(function() {
    console.log( "ready!" );
    $("#header").load("navigationSegments/topNav.html");
    viewController.resolveViewContent();
});

$(window).bind('hashchange', function() {
    viewController.resolveViewContent();
});

function ViewController () {

    var weatherService = new WeatherService();

    ViewController.prototype.resolveViewContent = function() {
        var url = window.location.href;
        var linkValue;


        if(url.endsWith("index.html")){
            linkValue = "index";
        } else {
            linkValue = url.substr(url.lastIndexOf("#") + 1);
        }



        if (linkValue === "home" || linkValue === "schedule" || linkValue === "contact" || linkValue === "baseInfo" || linkValue == "index") {
            $("#sideBar").load("navigationSegments/homeSideBar.html");
        } else if (linkValue === "weatherGraphs") {
            $("#sideBar").load("navigationSegments/weatherGraphsSideBar.html");
        }

        switch (linkValue) {
            case "home":
            case "baseInfo":
            case "index":
                $("#content").load("contentSegments/baseInfo.html");
                break;
            case "schedule":
                $("#content").load("contentSegments/schedule.html");
                break;
            case "contact":
                $("#content").load("contentSegments/contact.html");
                break;
            case "weatherGraphs":
            case "temperatureHistoricGraphs":
                resolveViewFortemperatureHistoricGraphsContent();
                break;
        }
    }

    function resolveViewFortemperatureHistoricGraphsContent() {
        $("#content").load("contentSegments/temperatureHistoricGraphs.html", function () {
            weatherService.getPossibleCountriesToSelect(function (countries) {
                countries.forEach(function (country) {
                    addOptionToSelection(country.name, country.alpha3Code, $("#countrySelection"));
                });
            });

            yearsToSelect = weatherService.getYearDataToSelect();

            yearsToSelect.forEach(function (year) {
                addOptionToSelection(year, year, $("#yearFromSelection"));
                addOptionToSelection(year, year, $("#yearToSelection"));
            })

        });
    }

    function addOptionToSelection(text, value, selection) {
        var opt = document.createElement('option');
        opt.innerHTML = text;
        opt.value = value;
        selection.append(opt);
    }

    ViewController.prototype.drawHistoryTemperatureGraph = function () {
        weatherService.getHistoryTemperatureDataByCriteria({ country: $( "#countrySelection" ).val(), fromYear: $( "#yearFromSelection" ).val(), toYear: $( "#yearToSelection" ).val()},function (historyTemperatureData, validationObj) {
            $( "#countrySelection" ).removeClass( "inputInvalid" );
            $( "#yearFromSelection" ).removeClass( "inputInvalid" );
            $( "#yearToSelection" ).removeClass( "inputInvalid" );

            if(!validationObj.isValid){
                resolveValidationMesseages(validationObj);
            } else {
                drawHistoryTemperatureGraph(historyTemperatureData);
            }
        })
    }

    function resolveValidationMesseages(validationObj) {
        var validationMessages = [];
        if (validationObj.wrongCountry) {
            validationMessages.push("Please select valid country");
            $("#countrySelection").addClass("inputInvalid");
        }

        if (validationObj.wrongYearInterval) {
            validationMessages.push("From year must be earlier than to year");
            $("#yearToSelection").addClass("inputInvalid");
            $("#yearFromSelection").addClass("inputInvalid");
        }

        if (validationObj.wrongFromYear) {
            validationMessages.push("Please select valid from year");
            $("#yearFromSelection").addClass("inputInvalid");
        }

        if (validationObj.wrongToYear) {
            validationMessages.push("Please select valid to year");
            $("#yearToSelection").addClass("inputInvalid");
        }

        if (validationObj.fromEqualsToYear) {
            validationMessages.push("Years can not be equal");
            $("#yearToSelection").addClass("inputInvalid");
            $("#yearFromSelection").addClass("inputInvalid");
        }


        validationMessages.forEach(function (messeage) {
            toastr.error(messeage);
        })
    }

    function drawHistoryTemperatureGraph(historyTemperatureData) {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(function () {
            var data = new google.visualization.DataTable();
            data.addColumn('number', 'Year');
            data.addColumn('number', 'Temperature');

            dataForGraph = [];
            historyTemperatureData.forEach(function (item) {
                dataForGraph.push([item.year, item.data]);
            });

            data.addRows(
                dataForGraph
            );

            var options = {'title':'Historic yearly average temperature graph from ' + $("#countrySelection option:selected").text(),
                'width':1500,
                'height':300,

                hAxis: {
                    title: 'Year',
                    titleTextStyle: {
                        fontSize: 16,
                        bold: true
                    }
                },
                vAxis: {
                    title: '% Celosia',
                    titleTextStyle: {
                        fontSize: 16,
                        bold: true
                    }
                }
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.LineChart(document.getElementById('temperatureHistoryGraph'));
            chart.draw(data, options);
        });
    }

}