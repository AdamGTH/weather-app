const API_KEY = "74c606af1b6f26de866db286dabb1909";
const UNITS = "metric";
let city = "Kraków";
let chart_tab = [];

function image_src(ico) {
  return `https://raw.githubusercontent.com/erikflowers/weather-icons/bb80982bf1f43f2d57f9dd753e7413bf88beb9ed/svg/${ico}.svg`;
}

document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault(); // nie wywołuje się to co jest w action

  city = event.target.cityName.value;

  Promise.all([fetchWeather(city), fetchForecast(city)])
    .then(transformData)
    .then(update)
    .catch(function (error) {
      console.log(error);
    });
});

const iconMap = new Map([
  // lub Map ale set nie pozwoli dublować danych
  ["01d", "wi-day-sunny"],
  ["01n", "wi-night-clear"], //clear sky
  ["02d", "wi-day-cloudy"],
  ["02n", "wi-night-alt-cloudy"], //few clouds
  ["03d", "wi-cloud"],
  ["03n", "wi-cloud"], //scattered clouds
  ["04d", "wi-cloudy"],
  ["04n", "wi-cloudy"], //broken clouds
  ["09d", "wi-showers"],
  ["09n", "wi-showers"], //shower rain
  ["10d", "wi-rain"],
  ["10n", "wi-rain"], //rain
  ["11d", "wi-thunderstorm"],
  ["11n", "wi-thunderstorm"], //thunderstorm
  ["13d", "wi-snowflake-cold"],
  ["13n", "wi-snowflake-cold"], //snow
  ["50d", "wi-fog"],
  ["50n", "wi-fog"], //mist
]);

function changeCity({ city, country = "PL" }) {
  // przekazujemy cały obiekt w nawiasach klamrowych. W ten sposób ustrzeżemy się pomylenia kolejności
  const cityNameElement = document.querySelector("h1");
  cityNameElement.innerHTML = city + "<small>," + country + "</small>";
}

function updateWeather({ icon, temp }) {
  const weatherElement = document.querySelector(".weather");
  weatherElement.innerHTML = `<span class="weather__icon"><i class="wi ${icon}"></i></span><span class="weather__temperature">${temp}&deg;C</span>`;
}

function changePreassureHumidity({ humidity, pressure }) {
  const preasureHum = document.querySelector(".card.air");
  preasureHum.innerHTML = `<div class="card__item"><i class="wi wi-humidity"></i>${humidity}%</div>
  <div class="card__item"><i class="wi wi-barometer"></i>${pressure}hPa</div>`;
}

function windDirectionAndStrength({ wind: { deg, speed } }) {
  const dirStrength = document.querySelector(".card.wind");
  dirStrength.innerHTML = `<div class="card__item"><i class="wi wi-direction-down-right"></i>${deg}&deg</div><div class="card__item"><i class="wi wi-strong-wind"></i>${speed}m/s</div>`;
}

function changeForecast({ forecast }) {
  const forecastElement = document.querySelector(".forecast-hours");
  let html = "";
  forecast.forEach(function (element) {
    // bierze każdy element z forecast
    //specjalna pętla forEach stosowana do tablicy forecast, następnie wszystkie wywołania sumowane i zapisywane do zmiennej html
    html += `<li class="card card--small card--centered">
  <time class="card__item forecast__hour">${element.hour}</time>
  <div class="card__item forecast__icon">
    <i class="wi ${element.icon}"></i>
  </div>
   <div class="card__item forecast__temperature">${element.temp}&deg;C</div>
   </li>`;
  });

  forecastElement.innerHTML = html;
}

function fetchWeather(city) {
  return fetchData("https://api.openweathermap.org/data/2.5/weather", city);
}
function fetchForecast(city) {
  return fetchData("https://api.openweathermap.org/data/2.5/forecast", city);
}

function update(data) {
  // funkcja robi Update danych

  changeCity(data);
  updateWeather(data);
  changePreassureHumidity(data);
  windDirectionAndStrength(data);
  changeForecast(data);

  if (chart_tab.length == 0) draw_charts(data);
  else
    chart_tab[0].data.datasets[0].data = [
      "30",
      "30",
      "30",
      "30",
      "30",
      "30",
      "30",
      "30",
    ];
  console.log(chart_tab[0]);

  //console.log(chart_tab.first_day.config);
}

function draw_charts(data) {
  draw_chart("f_day", data, "first_day");
  draw_chart("s_day", data, "sec_day");
  draw_chart("t_day", data, "third_day");
  draw_chart("fo_day", data, "fourth_day");
  draw_chart("fi_day", data, "fifth_day");
}

function transformData([weatherData, forecastData]) {
  //funkcja filtruje tylko te dane które potrzebujemy i wrzuca do kolejnego .thena z funkcją update

  d = new Date();
  idx_start = 0;

  // wyszukiwanie indexu startowego końca obecnego dnia
  for (i = 0; i < forecastData.list.length; i++) {
    if (
      d.getDate().toString() ==
      Number(forecastData.list[i].dt_txt.substring(8, 10))
    ) {
      continue;
    } else {
      idx_start = i;
      break;
    }
  }

  return {
    city: weatherData.name,
    country: weatherData.sys.country,
    icon: iconMap.get(weatherData.weather[0].icon),
    temp: parseFloat(weatherData.main.temp).toFixed(1),
    humidity: weatherData.main.humidity,
    pressure: weatherData.main.pressure,
    wind: weatherData.wind,
    forecast: forecastData.list.slice(0, 4).map(function (element) {
      // wyciga tylko pierwszych elementów (od 0 - 3 bez 4) z tablicy API a następnie metoda map tworzy nową tablicę i przypisuje do niej te 4 elementów
      return {
        hour: element.dt_txt.substr(11, 5), //metoda która wycina część stringu
        icon: iconMap.get(element.weather[0].icon),
        temp: parseFloat(element.main.temp).toFixed(1),
      };
    }),
    forecastx: {
      first_day: forecastData.list.slice(idx_start, 9).map(ret),
      sec_day: forecastData.list.slice(idx_start + 8, 17).map(ret),
      third_day: forecastData.list.slice(idx_start + 16, 25).map(ret),
      fourth_day: forecastData.list.slice(idx_start + 24, 33).map(ret),
      fifth_day: forecastData.list.slice(idx_start + 32).map(ret),
    },
  };
}

function ret(element) {
  daysPL = [
    "NIEDZIELA",
    "PONIEDZIAŁEK",
    "WTOREK",
    "ŚRODA",
    "CZWARTEK",
    "PIĄTEK",
    "SOBOTA",
  ];
  return {
    date_hour: new Date(element.dt_txt).toString().substring(16, 21),
    date_day: daysPL[new Date(element.dt_txt).getDay()],
    date_date: new Date(element.dt_txt).toString(),
    icon: iconMap.get(element.weather[0].icon),
    img_src: image_src(iconMap.get(element.weather[0].icon)),
    temp: parseFloat(element.main.temp).toFixed(1),
  };
}
//Chart.defaults.borderColor = "gray"; // kolory siatki
Chart.defaults.color = "black"; // ustawianie kolorów liczb na osi x i y
Chart.register(ChartDataLabels);

function draw_chart(id, data, nr_day) {
  let xValues = [];
  let yValues = [];
  let colors = [];
  let img_tab_ico = [];
  let img_weath = new Image();
  let chart_current = {};

  for (i = 0; i < data.forecastx[nr_day].length; i++) {
    img_weath.src = data.forecastx[nr_day][i].img_src;
    img_tab_ico.push(img_weath);
  }

  data.forecastx[nr_day].forEach((element) => {
    xValues.push(element.date_hour);
    yValues.push(element.temp);
    if (element.temp < 0) colors.push("#0b40b8");
    else if (element.temp > 0 && element.temp < 10) colors.push("#0bb8b3");
    else if (element.temp > 10 && element.temp < 15) colors.push("#0bb850");
    else if (element.temp > 15 && element.temp < 23) colors.push("#97b80b");
    else if (element.temp > 23 && element.temp < 25) colors.push("#b8790b");
    else if (element.temp > 25) colors.push("#b8250b");
  });

  let data_plugins = {
    id: "data_plugins",
    afterDatasetDraw(chart, args, options) {
      const { ctx } = chart;
      ctx.save();
      ctx.legend = options.legend;
      ctx.title = options.title;
      ctx.tooltip = options.tooltip;
      for (i = 0; i < img_tab_ico.length; i++) {
        ctx.drawImage(
          img_tab_ico[i],
          chart.getDatasetMeta(0).data[i].x - 25,
          45,
          35,
          35
        );
      }
    },
  };

  dt = [];
  for (i = 0; i < xValues.length; i++) {
    dt.push({ x: xValues[i], y: yValues[i] });
  }

  let id_chart = document.getElementById(id);
  chart_current = new Chart(id_chart, {
    type: "bar",

    data: {
      labels: xValues,
      datasets: [
        {
          borderWidth: 2,
          data: yValues,
          backgroundColor: colors,
        },
      ],
    },

    options: {
      aspectRatio: 2, // skala
      scales: {
        y: {
          max: 50,
          min: -50,
          ticks: {
            callback: function (value, index, ticks) {
              return value + "°C";
            },
          },
        },
      },
      plugins: {
        // tooltip: {
        //   callbacks: {
        //     label: (item) => `Temperatura: ${item.formattedValue} °C`,
        //   },
        // },
        title: {
          display: true,
          text: data.forecastx[nr_day][0].date_day,
          color: "black",
          font: {
            size: 16,
          },
        },
        legend: {
          display: false,
        },
        datalabels: {
          // This code is used to display data values
          anchor: "end",
          align: "top",
          formatter: (value, context) => {
            return value + "°C";
          },
          font: {
            weight: "bold",
            size: 12,
          },
        },
      },

      // deferred: {
      //   xOffset: 150, // defer until 150px of the canvas width are inside the viewport
      //   yOffset: "50%", // defer until 50% of the canvas height are inside the viewport
      //   delay: 500, // delay of 500 ms after the canvas is considered inside the viewport
      // },
    },
    plugins: [data_plugins],
  });

  chart_tab.push(chart_current);
}

function fetchData(url, city) {
  return fetch(`${url}?q=${city}&appid=${API_KEY}&units=${UNITS}`).then(
    function (response) {
      if (response.status !== 200) {
        throw new Error(
          "Looks like there was a problem. Status Code: " + response.status
        );
      }

      return response.json();
    }
  );
}
