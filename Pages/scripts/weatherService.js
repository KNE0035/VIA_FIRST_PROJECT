const TEMPERATURE_TYPE_CHANGE = "temperature";
const PRECIPITATION_TYPE_CHANGE = "precipitation";

function WeatherService() {
    const COUNTRY_CACHE = "POSSIBLE_COUNTRIES";

    var possibleCountriesToSelect = [];
    var allCountriesWeatherData = [];

    //const COUNTRIES_ALPHA_3_CODE_TO_GET_GLOBAL_DATA = ["CZE", "FRA", "ESP"
    //                                                    ,""]

    WeatherService.prototype.getPossibleCountriesToSelect = function(viewCallback){
        if(localStorage.getItem(COUNTRY_CACHE)){
            possibleCountriesToSelect = JSON.parse(localStorage.getItem(COUNTRY_CACHE));
            viewCallback(possibleCountriesToSelect);
        } else {
            $.ajax({
                url: "https://restcountries.eu/rest/v2/all",
                dataType: 'json'
            }).done(function (data) {
                data.forEach(function (country) {
                    var possibleCountry = {};
                    possibleCountry.name = country.name;
                    possibleCountry.alpha3Code = country.alpha3Code;
                    possibleCountriesToSelect.push(possibleCountry);
                })
                localStorage.setItem(COUNTRY_CACHE, JSON.stringify(possibleCountriesToSelect));
                viewCallback(possibleCountriesToSelect);
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

    WeatherService.prototype.getGlobalHistoryWeatherDataByCriteria = function (weatherCriteria, viewCallback, typeOfChange) {
        var validationObj = validateWeatherFilters(weatherCriteria);
        var globalHistoryWeatherData = [];
        if(!validationObj.isValid){
            viewCallback(globalHistoryWeatherData, validationObj);
            return;
        }

        var baseUrlWithCriteria;
        if(typeOfChange === TEMPERATURE_TYPE_CHANGE){
            baseUrlWithCriteria = "http://climatedataapi.worldbank.org/climateweb/rest/v1/country/cru/tas/year/";
        } else if(typeOfChange === PRECIPITATION_TYPE_CHANGE){
            baseUrlWithCriteria = "http://climatedataapi.worldbank.org/climateweb/rest/v1/country/cru/pr/year/";
        }

        allCountriesWeatherData = [];

        possibleCountriesToSelect.forEach(function (country) {
            $.ajax({
                url: baseUrlWithCriteria + country.alpha3Code,
                dataType: 'json'
            }).done(function (data) {
                var countryWeatherData = [];
                var historyWeatherData = [];
                var fromYear = parseInt(weatherCriteria.fromYear);
                var toYear = parseInt(weatherCriteria.toYear);

                data.forEach(function (item) {
                    if(item.year >= fromYear && item.year <= toYear){
                        countryWeatherData.push(item);
                    }
                })

                allCountriesWeatherData.push(countryWeatherData);
            });
        });

        $(document).ajaxStop(function() {
            if(allCountriesWeatherData.length > 0){
                var globalWeatherData = getAggregateCountriesDataToGlobalAverage(allCountriesWeatherData);

                viewCallback(globalWeatherData, validationObj);
            }
        });

    }

    WeatherService.prototype.getHistoryWeatherDataByCriteria = function (weatherCriteria, viewCallback, typeOfChange) {
        var validationObj = validateWeatherFilters(weatherCriteria);
        var historyWeatherData = [];
        if(!validationObj.isValid){
            viewCallback(historyWeatherData, validationObj);
            return;
        }

        var urlWithCriteria;
        if(typeOfChange === TEMPERATURE_TYPE_CHANGE){
            urlWithCriteria = "http://climatedataapi.worldbank.org/climateweb/rest/v1/country/cru/tas/year/" + weatherCriteria.country;
        } else if(typeOfChange === PRECIPITATION_TYPE_CHANGE){
            urlWithCriteria = "http://climatedataapi.worldbank.org/climateweb/rest/v1/country/cru/pr/year/" + weatherCriteria.country;
        }

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

    function validateWeatherFilters(weatherCriteria){
        var fromYear = parseInt(weatherCriteria.fromYear);
        var toYear = parseInt(weatherCriteria.toYear);
        var countryAlpha3Code = weatherCriteria.country;

        var validationObj = {};
        validationObj.isValid = true;

        if(fromYear > toYear){
            validationObj.wrongYearInterval = true;
        }


        if(countryAlpha3Code != undefined){
            if(countryAlpha3Code.length <= 0){
                validationObj.wrongCountry = true;
            }
        }


        if(!fromYear){
            validationObj.wrongFromYear = true;
        }

        if(!toYear){
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

    function getAggregateCountriesDataToGlobalAverage(allCountriesWeatherData){
        var globalWeatherData = [];
        var countOfCountriesWithNoData = 0;
        allCountriesWeatherData.forEach(function (countryWeatherData) {
            if(countryWeatherData.length == 0){
                countOfCountriesWithNoData++;
            }
            for(var i = 0; i < countryWeatherData.length; i++){
                if(globalWeatherData[i]){
                    globalWeatherData[i].data = globalWeatherData[i].data + countryWeatherData[i].data;
                } else {
                    globalWeatherData[i] = {year: countryWeatherData[i].year, data: countryWeatherData[i].data};
                }
            }
        });

        globalWeatherData.forEach(function (yearGlobalData) {
            yearGlobalData.data = yearGlobalData.data / (allCountriesWeatherData.length - countOfCountriesWithNoData);
        })
        return globalWeatherData;
    }
}
