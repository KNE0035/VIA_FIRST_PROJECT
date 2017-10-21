function WeatherService() {
    const COUNTRY_CACHE = "POSSIBLE_COUNTRIES";

    /*function timeConverter(UNIX_timestamp){
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
    }*/

    WeatherService.prototype.getPossibleCountriesToSelect = function(viewCallback){
        if(localStorage.getItem(COUNTRY_CACHE)){
            var possibleCountries = JSON.parse(localStorage.getItem(COUNTRY_CACHE));
            viewCallback(possibleCountries);
        } else {
            $.ajax({
                url: "https://restcountries.eu/rest/v2/all",
                dataType: 'json'
            }).done(function (data) {
                var possibleCountries = [];
                data.forEach(function (country) {
                    var possibleCountry = {};
                    possibleCountry.name = country.name;
                    possibleCountry.alpha3Code = country.alpha3Code;
                    possibleCountries.push(possibleCountry);
                })
                localStorage.setItem(COUNTRY_CACHE, JSON.stringify(possibleCountries));
                viewCallback(possibleCountries);
            });
        }
    }

    WeatherService.prototype.getYearDataToSelect = function () {
        var yearSet = [];
        for(var i = 1901; i <= 2012; i++){
            yearSet.push(i);
        }
        return yearSet;
    }

    WeatherService.prototype.getHistoryTemperatureDataByCriteria = function (weatherCriteria, viewCallback) {
        var validationObj = validateTemperatureFilters(weatherCriteria);
        var historyWeatherData = [];
        if(!validationObj.isValid){
            viewCallback(historyWeatherData, validationObj);
            return;
        }

        urlWithCriteria = "http://climatedataapi.worldbank.org/climateweb/rest/v1/country/cru/tas/year/" + weatherCriteria.country;
        $.ajax({
            url: urlWithCriteria,
            dataType: 'json'
        }).done(function (data) {
            var historyWeatherData = [];
            var fromYear = parseInt(weatherCriteria.fromYear);
            var toYear = parseInt(weatherCriteria.toYear);

            data.forEach(function (item) {
                if(item.year >= fromYear && item.year <= toYear){
                    historyWeatherData.push(item);
                }
            })

            viewCallback(historyWeatherData, validationObj);
        });
    }

    function validateTemperatureFilters(weatherCriteria){
        var fromYear = parseInt(weatherCriteria.fromYear);
        var toYear = parseInt(weatherCriteria.toYear);
        var countryAlpha3Code = weatherCriteria.country;

        var validationObj = {};
        validationObj.isValid = true;

        if(fromYear > toYear){
            validationObj.wrongYearInterval = true;
        }

        if(countryAlpha3Code.length <= 0){
            validationObj.wrongCountry = true;
        }

        if(!fromYear){
            validationObj.wrongFromYear = true;
        }

        if(!fromYear){
            validationObj.wrongToYear = true;
        }

        if(fromYear === toYear){
            validationObj.fromEqualsToYear = true;
        }

        if(validationObj.wrongCountry || validationObj.wrongFromYear || validationObj.wrongToYear || validationObj.wrongYearInterval || validationObj.fromEqualsToYear){
            validationObj.isValid = false;
        }

        return validationObj;
    }
}
