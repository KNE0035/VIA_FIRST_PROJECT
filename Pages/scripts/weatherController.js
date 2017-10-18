const COUNTRY_CACHE = "POSSIBLE_COUNTRIES";

$( document ).ready(function() {
    $.ajax({
        url: "http://climatedataapi.worldbank.org/climateweb/rest/v1/country/mavg/tas/1980/1999/CZE",
        dataType: 'json'
    }).done(function (data) {
        var weatherData = data;
    });

    var timeStampInMs = new Date("2013-09-05").getTime() / 1000;

    console.log(timeStampInMs);
    console.log(timeConverter(timeStampInMs));
    /*google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(function () {
        drawChart();
    });*/
});


function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
        ['Mushrooms', 3],
        ['Onions', 1],
        ['Olives', 1],
        ['Zucchini', 1],
        ['Pepperoni', 2]
    ]);

    // Set chart options
    var options = {'title':'How Much Pizza I Ate Last Night',
        'width':500,
        'height':300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
    chart.draw(data, options);

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Topping');
    data.addColumn('number', 'Slices');
    data.addRows([
        ['Mushrooms', 3],
        ['Onions', 1],
        ['Olives', 1],
        ['Zucchini', 1],
        ['Pepperoni', 2]
    ]);

    // Set chart options
    var options = {'title':'How Much Pizza I Ate Last Night',
        'width':500,
        'height':300};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

function getPossibleCountriesToSelect(callback){
    if(localStorage.getItem(COUNTRY_CACHE)){
        var possibleCountries = JSON.parse(localStorage.getItem(COUNTRY_CACHE));
        callback(possibleCountries);
    } else {
        $.ajax({
            url: "https://restcountries.eu/rest/v2/all",
            dataType: 'json'
        }).done(function (data) {
            var possibleCountries = [];
            possibleCountries.push({name: "Select country weather data", alpha3Code: "unselected"});
            data.forEach(function (country) {
                var possibleCountry = {};
                possibleCountry.name = country.name;
                possibleCountry.alpha3Code = country.alpha3Code;
                possibleCountries.push(possibleCountry);
            })
            localStorage.setItem(COUNTRY_CACHE, JSON.stringify(possibleCountries));
            callback(possibleCountries);
        });
    }
}