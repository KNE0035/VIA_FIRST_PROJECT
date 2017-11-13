var viewController = new ViewController();

toastr.options = {
    "timeOut": "2500",
}

$( document ).ready(function() {
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
        } else {
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
            case "temperatureHistoryGraph":
                resolveViewForTemperatureHistoryGraphContent();
                break;
            case "precipitationHistoryGraph":
                resolveViewForPrecipitationHistoryGraphContent();
                break;
            case "globalTemperatureGraph":
                resolveViewForGlobalTemperatureHistoryGraphContent();
                break;
            case "globalPrecipitationGraph":
                resolveViewForGlobalPrecipitationHistoryGraphContent();
                break;
        }
    }

    function initBasicWeatherFilters() {
        weatherService.getPossibleCountriesToSelect(function (countries) {
            var countriesForSelect = [{}];

            countries.forEach(function (item) {
                countriesForSelect.push({alpha3Code: item.alpha3Code, value: item.name, label: item.name})
            })

            $("#countrySelection").autocomplete({
                source: countriesForSelect,
                minLength: 1,
                // mustMatch implementation
                change: function (event, ui) {
                    if (ui.item === null) {
                        $(this).val('');
                    }
                },
                select: function(event, ui) {
                    // feed hidden id field
                    $("#alpha3Code").val(ui.item.alpha3Code);
                },
            });
        });

        yearsToSelect = weatherService.getYearDataToSelect();

        yearsToSelect.forEach(function (year) {
            addOptionToSelection(year, year, $("#yearFromSelection"));
            addOptionToSelection(year, year, $("#yearToSelection"));
        })
    }

    function resolveViewForTemperatureHistoryGraphContent() {
        $("#content").load("contentSegments/temperatureHistoryGraph.html", function () {
            initBasicWeatherFilters();
        });
    }

    function resolveViewForPrecipitationHistoryGraphContent() {
        $("#content").load("contentSegments/precipitationHistoryGraph.html", function () {
            initBasicWeatherFilters();
        });
    }

    function resolveViewForGlobalTemperatureHistoryGraphContent() {
        $("#content").load("contentSegments/globalTemperatureHistoryGraph.html", function () {
            initBasicWeatherFilters();
        });
    }

    function resolveViewForGlobalPrecipitationHistoryGraphContent() {
        $("#content").load("contentSegments/globalPrecipitationHistoryGraph.html", function () {
            initBasicWeatherFilters();
        });
    }

    function addOptionToSelection(text, value, selection) {
        var opt = document.createElement('option');
        opt.innerHTML = text;
        opt.value = value;
        selection.append(opt);
    }

    ViewController.prototype.drawHistoryGraph = function (typeOfChange) {
        weatherService.getHistoryWeatherDataByCriteria({ country: $( "#alpha3Code" ).val(), fromYear: $( "#yearFromSelection" ).val(), toYear: $( "#yearToSelection" ).val()},function (historyTemperatureData, validationObj) {
            $( "#countrySelection" ).removeClass( "inputInvalid" );
            $( "#yearFromSelection" ).removeClass( "inputInvalid" );
            $( "#yearToSelection" ).removeClass( "inputInvalid" );

            if(!validationObj.isValid){
                resolveValidationMesseages(validationObj);
            } else {
                if(typeOfChange == TEMPERATURE_TYPE_CHANGE){
                    graphName = 'Graf vývoje průměrné teploty, týkající se země: '
                } else {
                    graphName = 'Graf vývoje průměrné hodnoty srážek, týkající se země: '
                }
                graphName = graphName + $("#countrySelection").val()
                drawHistoryWeatherGraph(historyTemperatureData, "historyGraph", typeOfChange, graphName);
            }
        }, typeOfChange)
    }

    ViewController.prototype.drawGlobalHistoryGraph = function (typeOfChange) {
        weatherService.getGlobalHistoryWeatherDataByCriteria({ fromYear: $( "#yearFromSelection" ).val(), toYear: $( "#yearToSelection" ).val()},function (globalHistoryTemperatureData, validationObj) {
            $( "#yearFromSelection" ).removeClass( "inputInvalid" );
            $( "#yearToSelection" ).removeClass( "inputInvalid" );

            if(!validationObj.isValid){
                resolveValidationMesseages(validationObj);
            } else {
                var graphName = ""
                if(typeOfChange == TEMPERATURE_TYPE_CHANGE){
                    graphName = "Globální graf vývoje průměrné teploty"
                } else {
                    graphName = "Globální graf vývoje průměrných srážek"
                }
                drawHistoryWeatherGraph(globalHistoryTemperatureData, "globalHistoryGraph", typeOfChange, graphName)
            }
        }, typeOfChange)
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

    function drawHistoryWeatherGraph(historyWeatherData, graphId, typeOfChange, graphTitle) {
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(function () {
            var data = new google.visualization.DataTable();
            data.addColumn('number', 'Rok');
            data.addColumn('number', typeOfChange === TEMPERATURE_TYPE_CHANGE ? 'Teplota' : 'Srážky');

            dataForGraph = [];
            historyWeatherData.forEach(function (item) {
                dataForGraph.push([item.year, item.data]);
            });

            data.addRows(
                dataForGraph
            );

            var options = {'title': graphTitle,
                'height':300,

                hAxis: {
                    title: 'Rok',
                    titleTextStyle: {
                        fontSize: 16,
                    }
                },
                vAxis: {
                    title: typeOfChange === TEMPERATURE_TYPE_CHANGE ? "°Celsia" : "Srážky v mm vody",
                    titleTextStyle: {
                        fontSize: 16,
                    }
                }
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.LineChart(document.getElementById(graphId));
            chart.draw(data, options);
        });
    }

}