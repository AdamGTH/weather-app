# Introduce 
##  Url address to the view and using application:  https://weather-forec.herokuapp.com/. When we do first run the application and will be write data to input form text then will be get answer and forecast's informations appers on the charts
##  This application presents to weather forecast with the requests through API https://openweathermap.org/
##  Application use the Promise() to get the informations about weather actual and weather forecast.
```js
Promise.all([fetchWeather(city), fetchForecast(city)])
    .then(transformData)
    .then(update)
    .catch(function (error) {
      console.log(error);
    });
});

```
##  This application to presents forecast's data use the charts from open surce library chart.js (https://www.chartjs.org/)
