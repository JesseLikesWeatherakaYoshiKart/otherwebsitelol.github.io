const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "f";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

//function to update Forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 14;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/24.png?raw=true";
  } else if (condition === "partly-cloudy-night") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/23.png?raw=true";
  } else if (condition === "rain") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/08.png?raw=true";
  } else if (condition === "clear-day") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/26.png?raw=true";
  } else if (condition === "clear-night") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/25.png?raw=true";
  } else if (condition === "cloudy") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/20.png?raw=true";
  } else if (condition === "snow") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/10.png?raw=true";
   } else if (condition === "fog") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/15.png?raw=true";
   } else if (condition === "wind") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/18.png?raw=true";
   } else if (condition === "thunder-rain") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/47.png?raw=true";
  } else if (condition === "thunder-rain") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/47.png?raw=true";
  } else if (condition === "thunder-showers-day") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/29.png?raw=true";
  } else if (condition === "thunder-showers-night") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/37.png?raw=true";
  } else if (condition === "snow-showers-day") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/32.png?raw=true";
  } else if (condition === "snow-showers-night") {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/36.png?raw=true";
  } else {
    return "https://github.com/brenden7158/Weatherscan/blob/master/webroot/images/icons2007/05.png?raw=true";
  }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
  } else if (condition === "rain") {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === "clear-day") {
    bg = "https://i.ibb.co/WGry01m/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
  } else {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}

// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 7) {
    uvText.innerText = "High";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Very High";
  } else {
    uvText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good👌";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate😐";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups😷";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy😷";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy😨";
  } else {
    airQualityStatus.innerText = "Hazardous😱";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32 + 5).toFixed(0);
}




var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /*create a li element for each matching element:*/
      b = document.createElement("li");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
  var x = document.getElementById("suggestions");
  if (x) x = x.getElementsByTagName("li");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key
      is pressed,
      increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    /*If the arrow UP key
      is pressed,
      decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  }
  if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}



// Cities add your own to get in search

cities = [
  {
    country: "PK",
    name: "Abbottabad",
    lat: "34.1463",
    lng: "73.21168",
  },
    {
    country: "PK",
    name: "Chicago, IL",
    lat: "41.8375",
    lng: "-87.6866",
  },
  {
    country: "PK",
    name: "New York, NY",
    lat: "40.6943",
    lng: "-87.6866",
  },
  {
    country: "PK",
    name: "Sormerset Airport NJ (SMQ)",
    lat: "40.6943",
    lng: "-87.6866",
  },
  {
    country: "PK",
    name: "Adilpur",
    lat: "27.93677",
    lng: "69.31941",
  },
  {
    country: "PK",
    name: "Ahmadpur East",
    lat: "29.14269",
    lng: "71.25771",
  },
  {
    country: "PK",
    name: "Ahmadpur Sial",
    lat: "30.67791",
    lng: "71.74344",
  },
  {
    country: "PK",
    name: "Akora",
    lat: "34.00337",
    lng: "72.12561",
  },
  {
    country: "PK",
    name: "Aliabad",
    lat: "36.30703",
    lng: "74.61545",
  },
  {
    country: "PK",
    name: "Alik Ghund",
    lat: "30.48976",
    lng: "67.52177",
  },
  {
    country: "PK",
    name: "Alipur",
    lat: "29.38242",
    lng: "70.91106",
  },
  {
    country: "PK",
    name: "Alizai",
    lat: "33.53613",
    lng: "70.34607",
  },
  {
    country: "PK",
    name: "Alpurai",
    lat: "34.92039",
    lng: "72.63265",
  },
  {
    country: "PK",
    name: "Aman Garh",
    lat: "34.00584",
    lng: "71.92971",
  },
  {
    country: "PK",
    name: "Amirabad",
    lat: "34.18729",
    lng: "73.09078",
  },
  {
    country: "PK",
    name: "Arifwala",
    lat: "30.29058",
    lng: "73.06574",
  },
  {
    country: "PK",
    name: "Ashanagro Koto",
    lat: "34.10773",
    lng: "72.24517",
  },
  {
    country: "PK",
    name: "Athmuqam",
    lat: "34.57173",
    lng: "73.89724",
  },
  {
    country: "PK",
    name: "Attock City",
    lat: "33.76671",
    lng: "72.35977",
  },
  {
    country: "PK",
    name: "Awaran",
    lat: "26.45677",
    lng: "65.23144",
  },
  {
    country: "PK",
    name: "Baddomalhi",
    lat: "31.99042",
    lng: "74.6641",
  },
  {
    country: "PK",
    name: "Badin",
    lat: "24.656",
    lng: "68.837",
  },
  {
    country: "PK",
    name: "Baffa",
    lat: "34.4377",
    lng: "73.22368",
  },
  {
    country: "PK",
    name: "Bagarji",
    lat: "27.75431",
    lng: "68.75866",
  },
  {
    country: "PK",
    name: "Bagh",
    lat: "33.98111",
    lng: "73.77608",
  },
  {
    country: "PK",
    name: "Bahawalnagar",
    lat: "29.99835",
    lng: "73.25272",
  },
  {
    country: "PK",
    name: "Bahawalnagar",
    lat: "30.55083",
    lng: "73.39083",
  },
  {
    country: "PK",
    name: "Bahawalpur",
    lat: "29.39779",
    lng: "71.6752",
  },
  {
    country: "PK",
    name: "Bakhri Ahmad Khan",
    lat: "30.73586",
    lng: "70.83796",
  },
  {
    country: "PK",
    name: "Bandhi",
    lat: "26.58761",
    lng: "68.30215",
  },
  {
    country: "PK",
    name: "Bannu",
    lat: "32.98527",
    lng: "70.60403",
  },
  {
    country: "PK",
    name: "Barishal",
    lat: "36.32162",
    lng: "74.69502",
  },
  {
    country: "PK",
    name: "Barkhan",
    lat: "29.89773",
    lng: "69.52558",
  },
  {
    country: "PK",
    name: "Basirpur",
    lat: "30.57759",
    lng: "73.83912",
  },
  {
    country: "PK",
    name: "Basti Dosa",
    lat: "30.78769",
    lng: "70.86853",
  },
  {
    country: "PK",
    name: "Bat Khela",
    lat: "34.6178",
    lng: "71.97247",
  },
  {
    country: "PK",
    name: "Battagram",
    lat: "34.67719",
    lng: "73.02329",
  },
  {
    country: "PK",
    name: "Begowala",
    lat: "32.43816",
    lng: "74.26794",
  },
  {
    country: "PK",
    name: "Bela",
    lat: "26.22718",
    lng: "66.31178",
  },
  {
    country: "PK",
    name: "Berani",
    lat: "25.78497",
    lng: "68.80754",
  },
  {
    country: "PK",
    name: "Bhag",
    lat: "29.04174",
    lng: "67.82394",
  },
  {
    country: "PK",
    name: "Bhakkar",
    lat: "31.62685",
    lng: "71.06471",
  },
  {
    country: "PK",
    name: "Bhalwal",
    lat: "32.26576",
    lng: "72.89809",
  },
  {
    country: "PK",
    name: "Bhan",
    lat: "26.55831",
    lng: "67.72139",
  },
  {
    country: "PK",
    name: "Bhawana",
    lat: "31.56884",
    lng: "72.64917",
  },
  {
    country: "PK",
    name: "Bhera",
    lat: "32.48206",
    lng: "72.90865",
  },
  {
    country: "PK",
    name: "Bhimbar",
    lat: "32.97465",
    lng: "74.07846",
  },
  {
    country: "PK",
    name: "Bhiria",
    lat: "26.91041",
    lng: "68.19466",
  },
  {
    country: "PK",
    name: "Bhit Shah",
    lat: "25.80565",
    lng: "68.49143",
  },
  {
    country: "PK",
    name: "Bhopalwala",
    lat: "32.42968",
    lng: "74.3635",
  },
  {
    country: "PK",
    name: "Bozdar Wada",
    lat: "27.183",
    lng: "68.6358",
  },
  {
    country: "PK",
    name: "Bulri",
    lat: "24.86667",
    lng: "68.33333",
  },
  {
    country: "PK",
    name: "Būrewāla",
    lat: "30.16667",
    lng: "72.65",
  },
  {
    country: "PK",
    name: "Chak",
    lat: "27.85838",
    lng: "68.83378",
  },
  {
    country: "PK",
    name: "Chak Azam Sahu",
    lat: "30.75202",
    lng: "73.02834",
  },
  {
    country: "PK",
    name: "Chak Five Hundred Seventy-five",
    lat: "31.54514",
    lng: "73.82891",
  },
  {
    country: "PK",
    name: "Chak Jhumra",
    lat: "31.56808",
    lng: "73.18317",
  },
  {
    country: "PK",
    name: "Chak One Hundred Twenty Nine Left",
    lat: "30.42919",
    lng: "73.04522",
  },
  {
    country: "PK",
    name: "Chak Thirty-one -Eleven Left",
    lat: "30.42388",
    lng: "72.69737",
  },
  {
    country: "PK",
    name: "Chak Two Hundred Forty-nine Thal Development Authority",
    lat: "31.17772",
    lng: "71.2048",
  },
  {
    country: "PK",
    name: "Chakwal",
    lat: "32.93286",
    lng: "72.85394",
  },
  {
    country: "PK",
    name: "Chaman",
    lat: "30.91769",
    lng: "66.45259",
  },
  {
    country: "PK",
    name: "Chamber",
    lat: "25.29362",
    lng: "68.81176",
  },
  {
    country: "PK",
    name: "Charsadda",
    lat: "34.14822",
    lng: "71.7406",
  },
  {
    country: "PK",
    name: "Chawinda",
    lat: "32.34434",
    lng: "74.70507",
  },
  {
    country: "PK",
    name: "Chenab Nagar",
    lat: "31.75511",
    lng: "72.91403",
  },
  {
    country: "PK",
    name: "Cherat Cantonement",
    lat: "33.82342",
    lng: "71.89292",
  },
  {
    country: "PK",
    name: "Chhor",
    lat: "25.5126",
    lng: "69.78437",
  },
  {
    country: "PK",
    name: "Chichawatni",
    lat: "30.5301",
    lng: "72.69155",
  },
  {
    country: "PK",
    name: "Chilas",
    lat: "35.41287",
    lng: "74.10407",
  },
  {
    country: "PK",
    name: "Chiniot",
    lat: "31.72091",
    lng: "72.97836",
  },
  {
    country: "PK",
    name: "Chishtian",
    lat: "29.79713",
    lng: "72.85772",
  },
  {
    country: "PK",
    name: "Chitral",
    lat: "35.8518",
    lng: "71.78636",
  },
  {
    country: "PK",
    name: "Choa Saidan Shah",
    lat: "32.71962",
    lng: "72.98625",
  },
  {
    country: "PK",
    name: "Chowki Jamali",
    lat: "28.01944",
    lng: "67.92083",
  },
  {
    country: "PK",
    name: "Chuchar-kana Mandi",
    lat: "31.75",
    lng: "73.8",
  },
  {
    country: "PK",
    name: "Chuhar Jamali",
    lat: "24.3944",
    lng: "67.99298",
  },
  {
    country: "PK",
    name: "Chunian",
    lat: "30.96621",
    lng: "73.97908",
  },
  {
    country: "PK",
    name: "Dadhar",
    lat: "29.47489",
    lng: "67.65167",
  },
  {
    country: "PK",
    name: "Dadu",
    lat: "26.73033",
    lng: "67.7769",
  },
  {
    country: "PK",
    name: "Daggar",
    lat: "34.51106",
    lng: "72.48438",
  },
  {
    country: "PK",
    name: "Daira Din Panah",
    lat: "30.57053",
    lng: "70.93722",
  },
  {
    country: "PK",
    name: "Dajal",
    lat: "29.55769",
    lng: "70.37614",
  },
  {
    country: "PK",
    name: "Dalbandin",
    lat: "28.88846",
    lng: "64.40616",
  },
  {
    country: "PK",
    name: "Dandot RS",
    lat: "32.64167",
    lng: "72.975",
  },
  {
    country: "PK",
    name: "Daromehar",
    lat: "24.79382",
    lng: "68.17978",
  },
  {
    country: "PK",
    name: "Darya Khan",
    lat: "31.78447",
    lng: "71.10197",
  },
  {
    country: "PK",
    name: "Darya Khan Marri",
    lat: "26.67765",
    lng: "68.28666",
  },
  {
    country: "PK",
    name: "Daska Kalan",
    lat: "32.32422",
    lng: "74.35039",
  },
  {
    country: "PK",
    name: "Dasu",
    lat: "35.29169",
    lng: "73.2906",
  },
  {
    country: "PK",
    name: "Daud Khel",
    lat: "32.87533",
    lng: "71.57118",
  },
  {
    country: "PK",
    name: "Daulatpur",
    lat: "26.50158",
    lng: "67.97079",
  },
  {
    country: "PK",
    name: "Daultala",
    lat: "33.19282",
    lng: "73.14099",
  },
  {
    country: "PK",
    name: "Daur",
    lat: "26.45528",
    lng: "68.31835",
  },
  {
    country: "PK",
    name: "Dera Allahyar",
    lat: "28.37353",
    lng: "68.35078",
  },
  {
    country: "PK",
    name: "Dera Bugti",
    lat: "29.03619",
    lng: "69.15849",
  },
  {
    country: "PK",
    name: "Dera Ghazi Khan",
    lat: "30.04587",
    lng: "70.64029",
  },
  {
    country: "PK",
    name: "Dera Ismail Khan",
    lat: "31.83129",
    lng: "70.9017",
  },
  {
    country: "PK",
    name: "Dera Murad Jamali",
    lat: "28.54657",
    lng: "68.22308",
  },
  {
    country: "PK",
    name: "Dhanot",
    lat: "29.57991",
    lng: "71.75213",
  },
  {
    country: "PK",
    name: "Dhaunkal",
    lat: "32.40613",
    lng: "74.13706",
  },
  {
    country: "PK",
    name: "Dhoro Naro",
    lat: "25.50484",
    lng: "69.5709",
  },
  {
    country: "PK",
    name: "Digri",
    lat: "25.15657",
    lng: "69.11098",
  },
  {
    country: "PK",
    name: "Dijkot",
    lat: "31.21735",
    lng: "72.99621",
  },
  {
    country: "PK",
    name: "Dinan Bashnoian Wala",
    lat: "29.76584",
    lng: "73.26557",
  },
  {
    country: "PK",
    name: "Dinga",
    lat: "32.64101",
    lng: "73.72039",
  },
  {
    country: "PK",
    name: "Dipalpur",
    lat: "30.66984",
    lng: "73.65306",
  },
  {
    country: "PK",
    name: "Diplo",
    lat: "24.46688",
    lng: "69.58114",
  },
  {
    country: "PK",
    name: "Doaba",
    lat: "33.4245",
    lng: "70.73676",
  },
  {
    country: "PK",
    name: "Dokri",
    lat: "27.37421",
    lng: "68.09715",
  },
  {
    country: "PK",
    name: "Duki",
    lat: "30.15307",
    lng: "68.57323",
  },
  {
    country: "PK",
    name: "Dullewala",
    lat: "31.83439",
    lng: "71.43639",
  },
  {
    country: "PK",
    name: "Dunga Bunga",
    lat: "29.74975",
    lng: "73.24294",
  },
  {
    country: "PK",
    name: "Dunyapur",
    lat: "29.80275",
    lng: "71.74344",
  },
  {
    country: "PK",
    name: "Eidgah",
    lat: "35.34712",
    lng: "74.85632",
  },
  {
    country: "PK",
    name: "Eminabad",
    lat: "32.04237",
    lng: "74.25996",
  },
  {
    country: "PK",
    name: "Faisalabad",
    lat: "31.41554",
    lng: "73.08969",
  },
  {
    country: "PK",
    name: "Faqirwali",
    lat: "29.46799",
    lng: "73.03489",
  },
  {
    country: "PK",
    name: "Faruka",
    lat: "31.88642",
    lng: "72.41362",
  },
  {
    country: "PK",
    name: "Fazilpur",
    lat: "32.17629",
    lng: "75.06583",
  },
  {
    country: "PK",
    name: "Fort Abbas",
    lat: "29.19344",
    lng: "72.85525",
  },
  {
    country: "PK",
    name: "Gadani",
    lat: "25.11853",
    lng: "66.72985",
  },
  {
    country: "PK",
    name: "Gakuch",
    lat: "36.17683",
    lng: "73.76383",
  },
  {
    country: "PK",
    name: "Gambat",
    lat: "27.3517",
    lng: "68.5215",
  },
  {
    country: "PK",
    name: "Gandava",
    lat: "28.61321",
    lng: "67.48564",
  },
  {
    country: "PK",
    name: "Garh Maharaja",
    lat: "30.83383",
    lng: "71.90491",
  },
  {
    country: "PK",
    name: "Garhi Khairo",
    lat: "28.06029",
    lng: "67.98033",
  },
  {
    country: "PK",
    name: "Garhiyasin",
    lat: "27.90631",
    lng: "68.5121",
  },
  {
    country: "PK",
    name: "Gharo",
    lat: "24.74182",
    lng: "67.58534",
  },
  {
    country: "PK",
    name: "Ghauspur",
    lat: "28.13882",
    lng: "69.08245",
  },
  {
    country: "PK",
    name: "Ghotki",
    lat: "28.00437",
    lng: "69.31569",
  },
  {
    country: "PK",
    name: "Gilgit",
    lat: "35.91869",
    lng: "74.31245",
  },
  {
    country: "PK",
    name: "Gojra",
    lat: "31.14926",
    lng: "72.68323",
  },
  {
    country: "PK",
    name: "Goth Garelo",
    lat: "27.43521",
    lng: "68.07572",
  },
  {
    country: "PK",
    name: "Goth Phulji",
    lat: "26.88099",
    lng: "67.68239",
  },
  {
    country: "PK",
    name: "Goth Radhan",
    lat: "27.19846",
    lng: "67.95348",
  },
  {
    country: "PK",
    name: "Gujar Khan",
    lat: "33.25411",
    lng: "73.30433",
  },
  {
    country: "PK",
    name: "Gujranwala",
    lat: "32.15567",
    lng: "74.18705",
  },
  {
    country: "PK",
    name: "Gujrat",
    lat: "32.5742",
    lng: "74.07542",
  },
  {
    country: "PK",
    name: "Gulishah Kach",
    lat: "32.67087",
    lng: "70.33917",
  },
  {
    country: "PK",
    name: "Gwadar",
    lat: "25.12163",
    lng: "62.32541",
  },
  {
    country: "PK",
    name: "Hadali",
    lat: "32.64043",
    lng: "74.56898",
  },
  {
    country: "PK",
    name: "Hafizabad",
    lat: "32.07095",
    lng: "73.68802",
  },
  {
    country: "PK",
    name: "Hala",
    lat: "25.81459",
    lng: "68.42198",
  },
  {
    country: "PK",
    name: "Hangu",
    lat: "33.53198",
    lng: "71.0595",
  },
  {
    country: "PK",
    name: "Haripur",
    lat: "33.99783",
    lng: "72.93493",
  },
  {
    country: "PK",
    name: "Harnai",
    lat: "30.10077",
    lng: "67.93824",
  },
  {
    country: "PK",
    name: "Harnoli",
    lat: "32.27871",
    lng: "71.55429",
  },
  {
    country: "PK",
    name: "Harunabad",
    lat: "29.61206",
    lng: "73.13802",
  },
  {
    country: "PK",
    name: "Hasilpur",
    lat: "29.69221",
    lng: "72.54566",
  },
  {
    country: "PK",
    name: "Hattian Bala",
    lat: "34.1691",
    lng: "73.7432",
  },
  {
    country: "PK",
    name: "Haveli Lakha",
    lat: "30.45097",
    lng: "73.69371",
  },
  {
    country: "PK",
    name: "Havelian",
    lat: "34.05348",
    lng: "73.15993",
  },
  {
    country: "PK",
    name: "Hazro City",
    lat: "33.9099",
    lng: "72.49179",
  },
  {
    country: "PK",
    name: "Hingorja",
    lat: "27.21088",
    lng: "68.41598",
  },
  {
    country: "PK",
    name: "Hujra Shah Muqim",
    lat: "30.74168",
    lng: "73.82327",
  },
  {
    country: "PK",
    name: "Hyderabad",
    lat: "25.39242",
    lng: "68.37366",
  },
  {
    country: "PK",
    name: "Islamabad",
    lat: "33.72148",
    lng: "73.04329",
  },
  {
    country: "PK",
    name: "Islamkot",
    lat: "24.69904",
    lng: "70.17982",
  },
  {
    country: "PK",
    name: "Jacobabad",
    lat: "28.28187",
    lng: "68.43761",
  },
  {
    country: "PK",
    name: "Jahanian Shah",
    lat: "31.80541",
    lng: "72.2774",
  },
  {
    country: "PK",
    name: "Jalalpur Jattan",
    lat: "32.64118",
    lng: "74.20561",
  },
  {
    country: "PK",
    name: "Jalalpur Pirwala",
    lat: "29.5051",
    lng: "71.22202",
  },
  {
    country: "PK",
    name: "Jampur",
    lat: "29.64235",
    lng: "70.59518",
  },
  {
    country: "PK",
    name: "Jamshoro",
    lat: "25.43608",
    lng: "68.28017",
  },
  {
    country: "PK",
    name: "Jand",
    lat: "33.43304",
    lng: "72.01877",
  },
  {
    country: "PK",
    name: "Jandiala Sher Khan",
    lat: "31.82098",
    lng: "73.91815",
  },
  {
    country: "PK",
    name: "Jaranwala",
    lat: "31.3332",
    lng: "73.41868",
  },
  {
    country: "PK",
    name: "Jati",
    lat: "24.35492",
    lng: "68.26732",
  },
  {
    country: "PK",
    name: "Jatoi Shimali",
    lat: "29.51827",
    lng: "70.84474",
  },
  {
    country: "PK",
    name: "Jauharabad",
    lat: "32.29016",
    lng: "72.28182",
  },
  {
    country: "PK",
    name: "Jhang City",
    lat: "31.30568",
    lng: "72.32594",
  },
  {
    country: "PK",
    name: "Jhang Sadr",
    lat: "31.26981",
    lng: "72.31687",
  },
  {
    country: "PK",
    name: "Jhawarian",
    lat: "32.36192",
    lng: "72.62275",
  },
  {
    country: "PK",
    name: "Jhelum",
    lat: "32.93448",
    lng: "73.73102",
  },
  {
    country: "PK",
    name: "Jhol",
    lat: "25.95533",
    lng: "68.88871",
  },
  {
    country: "PK",
    name: "Jiwani",
    lat: "25.04852",
    lng: "61.74573",
  },
  {
    country: "PK",
    name: "Johi",
    lat: "26.69225",
    lng: "67.61431",
  },
  {
    country: "PK",
    name: "Jām Sāhib",
    lat: "26.29583",
    lng: "68.62917",
  },
  {
    country: "PK",
    name: "Kabirwala",
    lat: "30.40472",
    lng: "71.86269",
  },
  {
    country: "PK",
    name: "Kadhan",
    lat: "24.48041",
    lng: "68.98551",
  },
  {
    country: "PK",
    name: "Kahna Nau",
    lat: "31.36709",
    lng: "74.36899",
  },
  {
    country: "PK",
    name: "Kahror Pakka",
    lat: "29.6243",
    lng: "71.91437",
  },
  {
    country: "PK",
    name: "Kahuta",
    lat: "33.59183",
    lng: "73.38736",
  },
  {
    country: "PK",
    name: "Kakad Wari Dir Upper",
    lat: "34.99798",
    lng: "72.07295",
  },
  {
    country: "PK",
    name: "Kalabagh",
    lat: "32.96164",
    lng: "71.54638",
  },
  {
    country: "PK",
    name: "Kalaswala",
    lat: "32.20081",
    lng: "74.64858",
  },
  {
    country: "PK",
    name: "Kalat",
    lat: "29.02663",
    lng: "66.59361",
  },
  {
    country: "PK",
    name: "Kaleke Mandi",
    lat: "31.97597",
    lng: "73.59999",
  },
  {
    country: "PK",
    name: "Kallar Kahar",
    lat: "32.77998",
    lng: "72.69793",
  },
  {
    country: "PK",
    name: "Kalur Kot",
    lat: "32.15512",
    lng: "71.26631",
  },
  {
    country: "PK",
    name: "Kamalia",
    lat: "30.72708",
    lng: "72.64607",
  },
  {
    country: "PK",
    name: "Kamar Mushani",
    lat: "32.84318",
    lng: "71.36192",
  },
  {
    country: "PK",
    name: "Kambar",
    lat: "27.58753",
    lng: "68.00066",
  },
  {
    country: "PK",
    name: "Kamoke",
    lat: "31.97526",
    lng: "74.22304",
  },
  {
    country: "PK",
    name: "Kamra",
    lat: "33.74698",
    lng: "73.51229",
  },
  {
    country: "PK",
    name: "Kandhkot",
    lat: "28.24574",
    lng: "69.17974",
  },
  {
    country: "PK",
    name: "Kandiari",
    lat: "26.9155",
    lng: "68.52193",
  },
  {
    country: "PK",
    name: "Kandiaro",
    lat: "27.05918",
    lng: "68.21022",
  },
  {
    country: "PK",
    name: "Kanganpur",
    lat: "30.76468",
    lng: "74.12286",
  },
  {
    country: "PK",
    name: "Karachi",
    lat: "24.8608",
    lng: "67.0104",
  },
  {
    country: "PK",
    name: "Karak",
    lat: "33.11633",
    lng: "71.09354",
  },
  {
    country: "PK",
    name: "Karaundi",
    lat: "26.89709",
    lng: "68.40643",
  },
  {
    country: "PK",
    name: "Kario Ghanwar",
    lat: "24.80817",
    lng: "68.60483",
  },
  {
    country: "PK",
    name: "Karor",
    lat: "31.2246",
    lng: "70.95153",
  },
  {
    country: "PK",
    name: "Kashmor",
    lat: "28.4326",
    lng: "69.58364",
  },
  {
    country: "PK",
    name: "Kasur",
    lat: "31.11866",
    lng: "74.45025",
  },
  {
    country: "PK",
    name: "Keshupur",
    lat: "32.26",
    lng: "72.5",
  },
  {
    country: "PK",
    name: "Keti Bandar",
    lat: "24.14422",
    lng: "67.45094",
  },
  {
    country: "PK",
    name: "Khadan Khak",
    lat: "30.75236",
    lng: "67.71133",
  },
  {
    country: "PK",
    name: "Khadro",
    lat: "26.14713",
    lng: "68.71777",
  },
  {
    country: "PK",
    name: "Khairpur",
    lat: "28.06437",
    lng: "69.70363",
  },
  {
    country: "PK",
    name: "Khairpur Mir’s",
    lat: "27.52948",
    lng: "68.75915",
  },
  {
    country: "PK",
    name: "Khairpur Nathan Shah",
    lat: "27.09064",
    lng: "67.73489",
  },
  {
    country: "PK",
    name: "Khairpur Tamewah",
    lat: "29.58139",
    lng: "72.23804",
  },
  {
    country: "PK",
    name: "Khalabat",
    lat: "34.05997",
    lng: "72.88963",
  },
  {
    country: "PK",
    name: "Khandowa",
    lat: "32.74255",
    lng: "72.73478",
  },
  {
    country: "PK",
    name: "Khanewal",
    lat: "30.30173",
    lng: "71.93212",
  },
  {
    country: "PK",
    name: "Khangah Dogran",
    lat: "31.83294",
    lng: "73.62213",
  },
  {
    country: "PK",
    name: "Khangarh",
    lat: "29.91446",
    lng: "71.16067",
  },
  {
    country: "PK",
    name: "Khanpur",
    lat: "28.64739",
    lng: "70.65694",
  },
  {
    country: "PK",
    name: "Khanpur Mahar",
    lat: "27.84088",
    lng: "69.41302",
  },
  {
    country: "PK",
    name: "Kharan",
    lat: "28.58459",
    lng: "65.41501",
  },
  {
    country: "PK",
    name: "Kharian",
    lat: "32.81612",
    lng: "73.88697",
  },
  {
    country: "PK",
    name: "Khewra",
    lat: "32.6491",
    lng: "73.01059",
  },
  {
    country: "PK",
    name: "Khurrianwala",
    lat: "31.49936",
    lng: "73.26763",
  },
  {
    country: "PK",
    name: "Khushāb",
    lat: "32.29667",
    lng: "72.3525",
  },
  {
    country: "PK",
    name: "Khuzdar",
    lat: "27.81193",
    lng: "66.61096",
  },
  {
    country: "PK",
    name: "Kohat",
    lat: "33.58196",
    lng: "71.44929",
  },
  {
    country: "PK",
    name: "Kohlu",
    lat: "29.89651",
    lng: "69.25324",
  },
  {
    country: "PK",
    name: "Kot Addu",
    lat: "30.46907",
    lng: "70.96699",
  },
  {
    country: "PK",
    name: "Kot Diji",
    lat: "27.34156",
    lng: "68.70821",
  },
  {
    country: "PK",
    name: "Kot Ghulam Muhammad",
    lat: "32.33311",
    lng: "74.54694",
  },
  {
    country: "PK",
    name: "Kot Malik Barkhurdar",
    lat: "30.20379",
    lng: "66.98723",
  },
  {
    country: "PK",
    name: "Kot Mumin",
    lat: "32.18843",
    lng: "73.02987",
  },
  {
    country: "PK",
    name: "Kot Radha Kishan",
    lat: "31.17068",
    lng: "74.10126",
  },
  {
    country: "PK",
    name: "Kot Rajkour",
    lat: "32.41208",
    lng: "74.62855",
  },
  {
    country: "PK",
    name: "Kot Samaba",
    lat: "28.55207",
    lng: "70.46837",
  },
  {
    country: "PK",
    name: "Kot Sultan",
    lat: "30.7737",
    lng: "70.93125",
  },
  {
    country: "PK",
    name: "Kotli",
    lat: "33.51836",
    lng: "73.9022",
  },
  {
    country: "PK",
    name: "Kotli Loharan",
    lat: "32.58893",
    lng: "74.49466",
  },
  {
    country: "PK",
    name: "Kotri",
    lat: "25.36566",
    lng: "68.30831",
  },
  {
    country: "PK",
    name: "Kulachi",
    lat: "31.93058",
    lng: "70.45959",
  },
  {
    country: "PK",
    name: "Kundian",
    lat: "32.45775",
    lng: "71.47892",
  },
  {
    country: "PK",
    name: "Kunjah",
    lat: "32.52982",
    lng: "73.97486",
  },
  {
    country: "PK",
    name: "Kunri",
    lat: "25.17874",
    lng: "69.56572",
  },
  {
    country: "PK",
    name: "Lachi",
    lat: "33.38291",
    lng: "71.33733",
  },
  {
    country: "PK",
    name: "Ladhewala Waraich",
    lat: "32.15692",
    lng: "74.11564",
  },
  {
    country: "PK",
    name: "Lahore",
    lat: "31.558",
    lng: "74.35071",
  },
  {
    country: "PK",
    name: "Lakhi",
    lat: "27.84884",
    lng: "68.69972",
  },
  {
    country: "PK",
    name: "Lakki",
    lat: "32.60724",
    lng: "70.91234",
  },
  {
    country: "PK",
    name: "Lala Musa",
    lat: "32.70138",
    lng: "73.95746",
  },
  {
    country: "PK",
    name: "Lalian",
    lat: "31.82462",
    lng: "72.80116",
  },
  {
    country: "PK",
    name: "Landi Kotal",
    lat: "34.0988",
    lng: "71.14108",
  },
  {
    country: "PK",
    name: "Larkana",
    lat: "27.55898",
    lng: "68.21204",
  },
  {
    country: "PK",
    name: "Layyah",
    lat: "30.96128",
    lng: "70.93904",
  },
  {
    country: "PK",
    name: "Liliani",
    lat: "32.20393",
    lng: "72.9512",
  },
  {
    country: "PK",
    name: "Lodhran",
    lat: "29.5339",
    lng: "71.63244",
  },
  {
    country: "PK",
    name: "Loralai",
    lat: "30.37051",
    lng: "68.59795",
  },
  {
    country: "PK",
    name: "Mach",
    lat: "29.86371",
    lng: "67.33018",
  },
  {
    country: "PK",
    name: "Madeji",
    lat: "27.75314",
    lng: "68.45166",
  },
  {
    country: "PK",
    name: "Mailsi",
    lat: "29.80123",
    lng: "72.17398",
  },
  {
    country: "PK",
    name: "Malakand",
    lat: "34.56561",
    lng: "71.93043",
  },
  {
    country: "PK",
    name: "Malakwal",
    lat: "32.55449",
    lng: "73.21274",
  },
  {
    country: "PK",
    name: "Malakwal City",
    lat: "32.55492",
    lng: "73.2122",
  },
  {
    country: "PK",
    name: "Malir Cantonment",
    lat: "24.94343",
    lng: "67.20591",
  },
  {
    country: "PK",
    name: "Mamu Kanjan",
    lat: "30.83044",
    lng: "72.79943",
  },
  {
    country: "PK",
    name: "Mananwala",
    lat: "31.58803",
    lng: "73.68927",
  },
  {
    country: "PK",
    name: "Mandi Bahauddin",
    lat: "32.58704",
    lng: "73.49123",
  },
  {
    country: "PK",
    name: "Mangla",
    lat: "31.89306",
    lng: "72.38167",
  },
  {
    country: "PK",
    name: "Mankera",
    lat: "31.38771",
    lng: "71.44047",
  },
  {
    country: "PK",
    name: "Mansehra",
    lat: "34.33023",
    lng: "73.19679",
  },
  {
    country: "PK",
    name: "Mardan",
    lat: "34.19794",
    lng: "72.04965",
  },
  {
    country: "PK",
    name: "Mastung",
    lat: "29.79966",
    lng: "66.84553",
  },
  {
    country: "PK",
    name: "Matiari",
    lat: "25.59709",
    lng: "68.4467",
  },
  {
    country: "PK",
    name: "Matli",
    lat: "25.0429",
    lng: "68.65591",
  },
  {
    country: "PK",
    name: "Mehar",
    lat: "27.18027",
    lng: "67.82051",
  },
  {
    country: "PK",
    name: "Mehmand Chak",
    lat: "32.78518",
    lng: "73.82306",
  },
  {
    country: "PK",
    name: "Mehrabpur",
    lat: "28.10773",
    lng: "68.02554",
  },
  {
    country: "PK",
    name: "Mian Channun",
    lat: "30.44067",
    lng: "72.35679",
  },
  {
    country: "PK",
    name: "Mianke Mor",
    lat: "31.2024",
    lng: "73.94857",
  },
  {
    country: "PK",
    name: "Mianwali",
    lat: "32.57756",
    lng: "71.52847",
  },
  {
    country: "PK",
    name: "Minchianabad",
    lat: "30.16356",
    lng: "73.56858",
  },
  {
    country: "PK",
    name: "Mingora",
    lat: "34.7795",
    lng: "72.36265",
  },
  {
    country: "PK",
    name: "Miran Shah",
    lat: "33.00059",
    lng: "70.07117",
  },
  {
    country: "PK",
    name: "Miro Khan",
    lat: "27.75985",
    lng: "68.09195",
  },
  {
    country: "PK",
    name: "Mirpur Bhtoro",
    lat: "24.72852",
    lng: "68.2601",
  },
  {
    country: "PK",
    name: "Mirpur Khas",
    lat: "25.5276",
    lng: "69.01255",
  },
  {
    country: "PK",
    name: "Mirpur Mathelo",
    lat: "28.02136",
    lng: "69.54914",
  },
  {
    country: "PK",
    name: "Mirpur Sakro",
    lat: "24.54692",
    lng: "67.62797",
  },
  {
    country: "PK",
    name: "Mirwah Gorchani",
    lat: "25.30981",
    lng: "69.05019",
  },
  {
    country: "PK",
    name: "Mitha Tiwana",
    lat: "32.2454",
    lng: "72.10615",
  },
  {
    country: "PK",
    name: "Mithi",
    lat: "24.73701",
    lng: "69.79707",
  },
  {
    country: "PK",
    name: "Moro",
    lat: "26.66317",
    lng: "68.00016",
  },
  {
    country: "PK",
    name: "Moza Shahwala",
    lat: "30.80563",
    lng: "70.84911",
  },
  {
    country: "PK",
    name: "Multan",
    lat: "30.19679",
    lng: "71.47824",
  },
  {
    country: "PK",
    name: "Muridke",
    lat: "31.80258",
    lng: "74.25772",
  },
  {
    country: "PK",
    name: "Murree",
    lat: "33.90836",
    lng: "73.3903",
  },
  {
    country: "PK",
    name: "Musa Khel Bazar",
    lat: "30.85944",
    lng: "69.82208",
  },
  {
    country: "PK",
    name: "Mustafābād",
    lat: "30.89222",
    lng: "73.49889",
  },
  {
    country: "PK",
    name: "Muzaffargarh",
    lat: "30.07258",
    lng: "71.19379",
  },
  {
    country: "PK",
    name: "Muzaffarābād",
    lat: "34.37002",
    lng: "73.47082",
  },
  {
    country: "PK",
    name: "Nabisar",
    lat: "25.06717",
    lng: "69.6434",
  },
  {
    country: "PK",
    name: "Nankana Sahib",
    lat: "31.4501",
    lng: "73.70653",
  },
  {
    country: "PK",
    name: "Narang Mandi",
    lat: "31.90376",
    lng: "74.51587",
  },
  {
    country: "PK",
    name: "Narowal",
    lat: "32.10197",
    lng: "74.87303",
  },
  {
    country: "PK",
    name: "Nasirabad",
    lat: "27.38137",
    lng: "67.91644",
  },
  {
    country: "PK",
    name: "Naudero",
    lat: "27.66684",
    lng: "68.3609",
  },
  {
    country: "PK",
    name: "Naukot",
    lat: "24.85822",
    lng: "69.40153",
  },
  {
    country: "PK",
    name: "Naushahra Virkan",
    lat: "31.96258",
    lng: "73.97117",
  },
  {
    country: "PK",
    name: "Naushahro Firoz",
    lat: "26.8401",
    lng: "68.12265",
  },
  {
    country: "PK",
    name: "Nawabshah",
    lat: "26.23939",
    lng: "68.40369",
  },
  {
    country: "PK",
    name: "Nazir Town",
    lat: "33.30614",
    lng: "73.4833",
  },
  {
    country: "PK",
    name: "New Bādāh",
    lat: "27.34167",
    lng: "68.03194",
  },
  {
    country: "PK",
    name: "New Mirpur",
    lat: "33.14782",
    lng: "73.75187",
  },
  {
    country: "PK",
    name: "Noorabad",
    lat: "34.25195",
    lng: "71.96656",
  },
  {
    country: "PK",
    name: "Nowshera",
    lat: "34.01583",
    lng: "71.98123",
  },
  {
    country: "PK",
    name: "Nowshera Cantonment",
    lat: "33.99829",
    lng: "71.99834",
  },
  {
    country: "PK",
    name: "Nushki",
    lat: "29.55218",
    lng: "66.02288",
  },
  {
    country: "PK",
    name: "Okara",
    lat: "30.81029",
    lng: "73.45155",
  },
  {
    country: "PK",
    name: "Ormara",
    lat: "25.2088",
    lng: "64.6357",
  },
  {
    country: "PK",
    name: "Pabbi",
    lat: "34.00968",
    lng: "71.79445",
  },
  {
    country: "PK",
    name: "Pad Idan",
    lat: "26.77455",
    lng: "68.30094",
  },
  {
    country: "PK",
    name: "Paharpur",
    lat: "32.10502",
    lng: "70.97055",
  },
  {
    country: "PK",
    name: "Pakpattan",
    lat: "30.34314",
    lng: "73.38944",
  },
  {
    country: "PK",
    name: "Panjgur",
    lat: "26.97186",
    lng: "64.09459",
  },
  {
    country: "PK",
    name: "Pano Aqil",
    lat: "27.85619",
    lng: "69.11111",
  },
  {
    country: "PK",
    name: "Parachinar",
    lat: "33.89968",
    lng: "70.10012",
  },
  {
    country: "PK",
    name: "Pasni",
    lat: "25.26302",
    lng: "63.46921",
  },
  {
    country: "PK",
    name: "Pasrur",
    lat: "32.26286",
    lng: "74.66327",
  },
  {
    country: "PK",
    name: "Pattoki",
    lat: "31.02021",
    lng: "73.85333",
  },
  {
    country: "PK",
    name: "Peshawar",
    lat: "34.008",
    lng: "71.57849",
  },
  {
    country: "PK",
    name: "Phalia",
    lat: "32.43104",
    lng: "73.579",
  },
  {
    country: "PK",
    name: "Pind Dadan Khan",
    lat: "32.58662",
    lng: "73.04456",
  },
  {
    country: "PK",
    name: "Pindi Bhattian",
    lat: "31.89844",
    lng: "73.27339",
  },
  {
    country: "PK",
    name: "Pindi Gheb",
    lat: "33.24095",
    lng: "72.2648",
  },
  {
    country: "PK",
    name: "Pir Jo Goth",
    lat: "27.59178",
    lng: "68.61848",
  },
  {
    country: "PK",
    name: "Pir Mahal",
    lat: "30.76663",
    lng: "72.43455",
  },
  {
    country: "PK",
    name: "Pishin",
    lat: "30.58176",
    lng: "66.99406",
  },
  {
    country: "PK",
    name: "Pithoro",
    lat: "25.51122",
    lng: "69.37803",
  },
  {
    country: "PK",
    name: "Qadirpur Ran",
    lat: "30.29184",
    lng: "71.67164",
  },
  {
    country: "PK",
    name: "Qila Abdullah",
    lat: "30.72803",
    lng: "66.66117",
  },
  {
    country: "PK",
    name: "Qila Saifullah",
    lat: "30.70077",
    lng: "68.35984",
  },
  {
    country: "PK",
    name: "Quetta",
    lat: "30.18414",
    lng: "67.00141",
  },
  {
    country: "PK",
    name: "Rahim Yar Khan",
    lat: "28.41987",
    lng: "70.30345",
  },
  {
    country: "PK",
    name: "Raiwind",
    lat: "31.24895",
    lng: "74.21534",
  },
  {
    country: "PK",
    name: "Raja Jang",
    lat: "31.22078",
    lng: "74.25483",
  },
  {
    country: "PK",
    name: "Rajanpur",
    lat: "29.10408",
    lng: "70.32969",
  },
  {
    country: "PK",
    name: "Rajo Khanani",
    lat: "24.98391",
    lng: "68.8537",
  },
  {
    country: "PK",
    name: "Ranipur",
    lat: "27.2872",
    lng: "68.50623",
  },
  {
    country: "PK",
    name: "Rasulnagar",
    lat: "32.32794",
    lng: "73.7804",
  },
  {
    country: "PK",
    name: "Ratodero",
    lat: "27.80227",
    lng: "68.28902",
  },
  {
    country: "PK",
    name: "Rawala Kot",
    lat: "33.85782",
    lng: "73.76043",
  },
  {
    country: "PK",
    name: "Rawalpindi",
    lat: "33.59733",
    lng: "73.0479",
  },
  {
    country: "PK",
    name: "Renala Khurd",
    lat: "30.87878",
    lng: "73.59857",
  },
  {
    country: "PK",
    name: "Risalpur Cantonment",
    lat: "34.06048",
    lng: "71.99276",
  },
  {
    country: "PK",
    name: "Rohri",
    lat: "27.69203",
    lng: "68.89503",
  },
  {
    country: "PK",
    name: "Rojhan",
    lat: "28.68735",
    lng: "69.9535",
  },
  {
    country: "PK",
    name: "Rustam",
    lat: "27.96705",
    lng: "68.80386",
  },
  {
    country: "PK",
    name: "Saddiqabad",
    lat: "28.3091",
    lng: "70.12652",
  },
  {
    country: "PK",
    name: "Sahiwal",
    lat: "31.97386",
    lng: "72.33109",
  },
  {
    country: "PK",
    name: "Sahiwal",
    lat: "30.66595",
    lng: "73.10186",
  },
  {
    country: "PK",
    name: "Saidu Sharif",
    lat: "34.74655",
    lng: "72.35568",
  },
  {
    country: "PK",
    name: "Sakrand",
    lat: "26.13845",
    lng: "68.27444",
  },
  {
    country: "PK",
    name: "Samaro",
    lat: "25.28143",
    lng: "69.39623",
  },
  {
    country: "PK",
    name: "Sambrial",
    lat: "32.47835",
    lng: "74.35338",
  },
  {
    country: "PK",
    name: "Sanghar",
    lat: "26.04694",
    lng: "68.94917",
  },
  {
    country: "PK",
    name: "Sangla Hill",
    lat: "31.71667",
    lng: "73.38333",
  },
  {
    country: "PK",
    name: "Sanjwal",
    lat: "33.76105",
    lng: "72.43315",
  },
  {
    country: "PK",
    name: "Sann",
    lat: "26.0403",
    lng: "68.13763",
  },
  {
    country: "PK",
    name: "Sarai Alamgir",
    lat: "32.90495",
    lng: "73.75518",
  },
  {
    country: "PK",
    name: "Sarai Naurang",
    lat: "32.82581",
    lng: "70.78107",
  },
  {
    country: "PK",
    name: "Sarai Sidhu",
    lat: "30.59476",
    lng: "71.9699",
  },
  {
    country: "PK",
    name: "Sargodha",
    lat: "32.08586",
    lng: "72.67418",
  },
  {
    country: "PK",
    name: "Sehwan",
    lat: "26.42495",
    lng: "67.86126",
  },
  {
    country: "PK",
    name: "Setharja Old",
    lat: "27.2127",
    lng: "68.46883",
  },
  {
    country: "PK",
    name: "Shabqadar",
    lat: "34.21599",
    lng: "71.5548",
  },
  {
    country: "PK",
    name: "Shahdad Kot",
    lat: "27.84726",
    lng: "67.90679",
  },
  {
    country: "PK",
    name: "Shahdadpur",
    lat: "25.92539",
    lng: "68.6228",
  },
  {
    country: "PK",
    name: "Shahkot",
    lat: "31.5709",
    lng: "73.48531",
  },
  {
    country: "PK",
    name: "Shahpur",
    lat: "32.2682",
    lng: "72.46884",
  },
  {
    country: "PK",
    name: "Shahpur Chakar",
    lat: "26.15411",
    lng: "68.65013",
  },
  {
    country: "PK",
    name: "Shahr Sultan",
    lat: "29.57517",
    lng: "71.02209",
  },
  {
    country: "PK",
    name: "Shakargarh",
    lat: "32.26361",
    lng: "75.16008",
  },
  {
    country: "PK",
    name: "Sharqpur Sharif",
    lat: "31.46116",
    lng: "74.10091",
  },
  {
    country: "PK",
    name: "Shekhupura",
    lat: "31.71287",
    lng: "73.98556",
  },
  {
    country: "PK",
    name: "Shikarpur",
    lat: "27.95558",
    lng: "68.63823",
  },
  {
    country: "PK",
    name: "Shingli Bala",
    lat: "34.67872",
    lng: "72.98491",
  },
  {
    country: "PK",
    name: "Shinpokh",
    lat: "34.32959",
    lng: "71.17852",
  },
  {
    country: "PK",
    name: "Shorkot",
    lat: "31.91023",
    lng: "70.87757",
  },
  {
    country: "PK",
    name: "Shujaabad",
    lat: "29.88092",
    lng: "71.29344",
  },
  {
    country: "PK",
    name: "Sialkot",
    lat: "32.49268",
    lng: "74.53134",
  },
  {
    country: "PK",
    name: "Sibi",
    lat: "29.54299",
    lng: "67.87726",
  },
  {
    country: "PK",
    name: "Sillanwali",
    lat: "31.82539",
    lng: "72.54064",
  },
  {
    country: "PK",
    name: "Sinjhoro",
    lat: "26.03008",
    lng: "68.80867",
  },
  {
    country: "PK",
    name: "Skardu",
    lat: "35.29787",
    lng: "75.63372",
  },
  {
    country: "PK",
    name: "Sobhodero",
    lat: "27.30475",
    lng: "68.39715",
  },
  {
    country: "PK",
    name: "Sodhri",
    lat: "32.46211",
    lng: "74.18207",
  },
  {
    country: "PK",
    name: "Sohbatpur",
    lat: "28.52038",
    lng: "68.54298",
  },
  {
    country: "PK",
    name: "Sukheke Mandi",
    lat: "31.86541",
    lng: "73.50875",
  },
  {
    country: "PK",
    name: "Sukkur",
    lat: "27.70323",
    lng: "68.85889",
  },
  {
    country: "PK",
    name: "Surab",
    lat: "28.49276",
    lng: "66.25999",
  },
  {
    country: "PK",
    name: "Surkhpur",
    lat: "32.71816",
    lng: "74.44773",
  },
  {
    country: "PK",
    name: "Swabi",
    lat: "34.12018",
    lng: "72.46982",
  },
  {
    country: "PK",
    name: "Sīta Road",
    lat: "27.03333",
    lng: "67.85",
  },
  {
    country: "PK",
    name: "Talagang",
    lat: "32.92766",
    lng: "72.41594",
  },
  {
    country: "PK",
    name: "Talamba",
    lat: "30.52693",
    lng: "72.24079",
  },
  {
    country: "PK",
    name: "Talhar",
    lat: "24.88454",
    lng: "68.81437",
  },
  {
    country: "PK",
    name: "Tandlianwala",
    lat: "31.03359",
    lng: "73.13268",
  },
  {
    country: "PK",
    name: "Tando Adam",
    lat: "25.76818",
    lng: "68.66196",
  },
  {
    country: "PK",
    name: "Tando Allahyar",
    lat: "25.4605",
    lng: "68.71745",
  },
  {
    country: "PK",
    name: "Tando Bago",
    lat: "24.78914",
    lng: "68.96535",
  },
  {
    country: "PK",
    name: "Tando Jam",
    lat: "25.42813",
    lng: "68.52923",
  },
  {
    country: "PK",
    name: "Tando Mitha Khan",
    lat: "25.99625",
    lng: "69.20251",
  },
  {
    country: "PK",
    name: "Tando Muhammad Khan",
    lat: "25.12384",
    lng: "68.53677",
  },
  {
    country: "PK",
    name: "Tangi",
    lat: "34.3009",
    lng: "71.65238",
  },
  {
    country: "PK",
    name: "Tangwani",
    lat: "28.27886",
    lng: "68.9976",
  },
  {
    country: "PK",
    name: "Tank",
    lat: "32.21707",
    lng: "70.38315",
  },
  {
    country: "PK",
    name: "Taunsa",
    lat: "30.70358",
    lng: "70.65054",
  },
  {
    country: "PK",
    name: "Thal",
    lat: "35.47836",
    lng: "72.24383",
  },
  {
    country: "PK",
    name: "Tharu Shah",
    lat: "26.9423",
    lng: "68.11759",
  },
  {
    country: "PK",
    name: "Thatta",
    lat: "24.74745",
    lng: "67.92353",
  },
  {
    country: "PK",
    name: "Thul",
    lat: "28.2403",
    lng: "68.7755",
  },
  {
    country: "PK",
    name: "Timargara",
    lat: "34.82659",
    lng: "71.84423",
  },
  {
    country: "PK",
    name: "Toba Tek Singh",
    lat: "30.97127",
    lng: "72.48275",
  },
  {
    country: "PK",
    name: "Topi",
    lat: "34.07034",
    lng: "72.62147",
  },
  {
    country: "PK",
    name: "Turbat",
    lat: "26.00122",
    lng: "63.04849",
  },
  {
    country: "PK",
    name: "Ubauro",
    lat: "28.16429",
    lng: "69.73114",
  },
  {
    country: "PK",
    name: "Umarkot",
    lat: "25.36329",
    lng: "69.74184",
  },
  {
    country: "PK",
    name: "Upper Dir",
    lat: "35.2074",
    lng: "71.8768",
  },
  {
    country: "PK",
    name: "Usta Muhammad",
    lat: "28.17723",
    lng: "68.04367",
  },
  {
    country: "PK",
    name: "Uthal",
    lat: "25.80722",
    lng: "66.62194",
  },
  {
    country: "PK",
    name: "Utmanzai",
    lat: "34.18775",
    lng: "71.76274",
  },
  {
    country: "PK",
    name: "Vihari",
    lat: "30.0445",
    lng: "72.3556",
  },
  {
    country: "PK",
    name: "Wana",
    lat: "32.29889",
    lng: "69.5725",
  },
  {
    country: "PK",
    name: "Warah",
    lat: "27.44805",
    lng: "67.79654",
  },
  {
    country: "PK",
    name: "Wazirabad",
    lat: "32.44324",
    lng: "74.12",
  },
  {
    country: "PK",
    name: "Yazman",
    lat: "29.12122",
    lng: "71.74459",
  },
  {
    country: "PK",
    name: "Zafarwal",
    lat: "32.34464",
    lng: "74.8999",
  },
  {
    country: "PK",
    name: "Zahir Pir",
    lat: "28.81284",
    lng: "70.52341",
  },
  {
    country: "PK",
    name: "Zaida",
    lat: "34.0595",
    lng: "72.4669",
  },
  {
    country: "PK",
    name: "Zhob",
    lat: "31.34082",
    lng: "69.4493",
  },
  {
    country: "PK",
    name: "Ziarat",
    lat: "30.38244",
    lng: "67.72562",
  },
 {
    name: 'Adrian',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.89755000',
    longitude: '-84.03717000'
  },
  {
    name: 'Albion',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.24310000',
    longitude: '-84.75303000'
  },
  {
    name: 'Alcona County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '44.71161000',
    longitude: '-83.34366000'
  },
  {
    name: 'Alger County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '46.45110000',
    longitude: '-86.54755000'
  },
  {
    name: 'Algonac',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.61858000',
    longitude: '-82.53230000'
  },
  {
    name: 'Allegan',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.52920000',
    longitude: '-85.85530000'
  },
  {
    name: 'Allegan County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.51766000',
    longitude: '-85.91034000'
  },
  {
    name: 'Allen Park',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.25754000',
    longitude: '-83.21104000'
  },
  {
    name: 'Allendale',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.97225000',
    longitude: '-85.95365000'
  },
  {
    name: 'Alma',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.37892000',
    longitude: '-84.65973000'
  },
  {
    name: 'Almont',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.92058000',
    longitude: '-83.04493000'
  },
  {
    name: 'Alpena',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.06168000',
    longitude: '-83.43275000'
  },
  {
    name: 'Alpena County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.06350000',
    longitude: '-83.46039000'
  },
  {
    name: 'Ann Arbor',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.27756000',
    longitude: '-83.74088000'
  },
  {
    name: 'Antrim County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.00737000',
    longitude: '-85.17579000'
  },
  {
    name: 'Arenac County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '44.04289000',
    longitude: '-83.74725000'
  },
  {
    name: 'Argentine',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.79142000',
    longitude: '-83.84634000'
  },
  {
    name: 'Armada',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.84420000',
    longitude: '-82.88437000'
  },
  {
    name: 'Athens',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.08866000',
    longitude: '-85.23471000'
  },
  {
    name: 'Atlanta',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.00473000',
    longitude: '-84.14389000'
  },
  {
    name: 'Au Sable',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '44.41085000',
    longitude: '-83.33219000'
  },
  {
    name: 'Auburn',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.60336000',
    longitude: '-84.06970000'
  },
  {
    name: 'Auburn Hills',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.68753000',
    longitude: '-83.23410000'
  },
  {
    name: 'Bad Axe',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.80196000',
    longitude: '-83.00078000'
  },
  {
    name: 'Baldwin',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.90112000',
    longitude: '-85.85173000'
  },
  {
    name: 'Bangor',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.31254000',
    longitude: '-86.11308000'
  },
  {
    name: 'Baraga',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '46.77854000',
    longitude: '-88.48902000'
  },
  {
    name: 'Baraga County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '46.69976000',
    longitude: '-88.35215000'
  },
  {
    name: 'Barnes Lake-Millers Lake',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.17956000',
    longitude: '-83.31230000'
  },
  {
    name: 'Barry County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.59503000',
    longitude: '-85.30897000'
  },
  {
    name: 'Bath',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.81864000',
    longitude: '-84.44859000'
  },
  {
    name: 'Battle Creek',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.31730000',
    longitude: '-85.17816000'
  },
  {
    name: 'Bay City',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.59447000',
    longitude: '-83.88886000'
  },
  {
    name: 'Bay County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.72137000',
    longitude: '-83.94184000'
  },
  {
    name: 'Bay Harbor',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.36413000',
    longitude: '-85.08208000'
  },
  {
    name: 'Beaverton',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.88225000',
    longitude: '-84.48473000'
  },
  {
    name: 'Beecher',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.09003000',
    longitude: '-83.69440000'
  },
  {
    name: 'Beechwood',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.79697000',
    longitude: '-86.12588000'
  },
  {
    name: 'Belding',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.09781000',
    longitude: '-85.22891000'
  },
  {
    name: 'Bellaire',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '44.98028000',
    longitude: '-85.21117000'
  },
  {
    name: 'Belleville',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.20476000',
    longitude: '-83.48521000'
  },
  {
    name: 'Bellevue',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.44337000',
    longitude: '-85.01805000'
  },
  {
    name: 'Benton Harbor',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.11671000',
    longitude: '-86.45419000'
  },
  {
    name: 'Benton Heights',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.13115000',
    longitude: '-86.40724000'
  },
  {
    name: 'Benzie County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '44.61687000',
    longitude: '-86.13899000'
  },
  {
    name: 'Berkley',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.50309000',
    longitude: '-83.18354000'
  },
  {
    name: 'Berrien County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.91863000',
    longitude: '-86.42807000'
  },
  {
    name: 'Berrien Springs',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.94643000',
    longitude: '-86.33890000'
  },
  {
    name: 'Bessemer',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '46.48134000',
    longitude: '-90.05295000'
  },
  {
    name: 'Beulah',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '44.63194000',
    longitude: '-86.09092000'
  },
  {
    name: 'Beverly Hills',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.52392000',
    longitude: '-83.22326000'
  },
  {
    name: 'Big Rapids',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.69808000',
    longitude: '-85.48366000'
  },
  {
    name: 'Bingham Farms',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.51587000',
    longitude: '-83.27326000'
  },
  {
    name: 'Birch Run',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.25086000',
    longitude: '-83.79413000'
  },
  {
    name: 'Birmingham',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.54670000',
    longitude: '-83.21132000'
  },
  {
    name: 'Blissfield',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.83255000',
    longitude: '-83.86244000'
  },
  {
    name: 'Bloomfield Hills',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.58364000',
    longitude: '-83.24549000'
  },
  {
    name: 'Boyne City',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.21668000',
    longitude: '-85.01394000'
  },
  {
    name: 'Branch County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.91611000',
    longitude: '-85.05903000'
  },
  {
    name: 'Breckenridge',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.40808000',
    longitude: '-84.47500000'
  },
  {
    name: 'Bridgeport',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.35947000',
    longitude: '-83.88164000'
  },
  {
    name: 'Bridgman',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.94310000',
    longitude: '-86.55697000'
  },
  {
    name: 'Brighton',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.52948000',
    longitude: '-83.78022000'
  },
  {
    name: 'Bronson',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.87227000',
    longitude: '-85.19470000'
  },
  {
    name: 'Brooklyn',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.10587000',
    longitude: '-84.24828000'
  },
  {
    name: 'Brown City',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.21225000',
    longitude: '-82.98966000'
  },
  {
    name: 'Brownlee Park',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.31893000',
    longitude: '-85.14249000'
  },
  {
    name: 'Buchanan',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.82727000',
    longitude: '-86.36112000'
  },
  {
    name: 'Buena Vista',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.42030000',
    longitude: '-83.89858000'
  },
  {
    name: 'Burt',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.23669000',
    longitude: '-83.90636000'
  },
  {
    name: 'Burton',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.99947000',
    longitude: '-83.61634000'
  },
  {
    name: 'Byron Center',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.81225000',
    longitude: '-85.72281000'
  },
  {
    name: 'Cadillac',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '44.25195000',
    longitude: '-85.40116000'
  },
  {
    name: 'Caledonia',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.78920000',
    longitude: '-85.51669000'
  },
  {
    name: 'Calhoun County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.24653000',
    longitude: '-85.00559000'
  },
  {
    name: 'Canadian Lakes',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.57919000',
    longitude: '-85.30170000'
  },
  {
    name: 'Canton',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.30865000',
    longitude: '-83.48216000'
  },
  {
    name: 'Capac',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.01253000',
    longitude: '-82.92799000'
  },
  {
    name: 'Carleton',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.05921000',
    longitude: '-83.39077000'
  },
  {
    name: 'Caro',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.49073000',
    longitude: '-83.39885000'
  },
  {
    name: 'Carrollton',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.45864000',
    longitude: '-83.93025000'
  },
  {
    name: 'Carson City',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.17698000',
    longitude: '-84.84639000'
  },
  {
    name: 'Cass City',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.60085000',
    longitude: '-83.17467000'
  },
  {
    name: 'Cass County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.91540000',
    longitude: '-85.99346000'
  },
  {
    name: 'Cassopolis',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.91171000',
    longitude: '-86.01001000'
  },
  {
    name: 'Cedar Springs',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.22336000',
    longitude: '-85.55142000'
  },
  {
    name: 'Center Line',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.48504000',
    longitude: '-83.02770000'
  },
  {
    name: 'Centreville',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '41.92338000',
    longitude: '-85.52832000'
  },
  {
    name: 'Charlevoix',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.31806000',
    longitude: '-85.25840000'
  },
  {
    name: 'Charlevoix County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.26715000',
    longitude: '-85.24017000'
  },
  {
    name: 'Charlotte',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.56365000',
    longitude: '-84.83582000'
  },
  {
    name: 'Cheboygan',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.64696000',
    longitude: '-84.47448000'
  },
  {
    name: 'Cheboygan County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '45.47294000',
    longitude: '-84.49206000'
  },
  {
    name: 'Chelsea',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.31807000',
    longitude: '-84.02181000'
  },
  {
    name: 'Chesaning',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.18475000',
    longitude: '-84.11497000'
  },
  {
    name: 'Chippewa County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '46.32818000',
    longitude: '-84.52936000'
  },
  {
    name: 'Clare',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.81947000',
    longitude: '-84.76863000'
  },
  {
    name: 'Clare County',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '43.98787000',
    longitude: '-84.84784000'
  },
  {
    name: 'Clarkston',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.73586000',
    longitude: '-83.41883000'
  },
  {
    name: 'Clawson',
    countryCode: 'US',
    stateCode: 'MI',
    latitude: '42.53337000',
    longitude: '-83.14632000'
  },
  {
    name: 'Albany',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.63651000',
    longitude: '-123.10593000'
  },
  {
    name: 'Aloha',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.49428000',
    longitude: '-122.86705000'
  },
  {
    name: 'Altamont',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.20681000',
    longitude: '-121.73722000'
  },
  {
    name: 'Amity',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.11567000',
    longitude: '-123.20733000'
  },
  {
    name: 'Ashland',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.19458000',
    longitude: '-122.70948000'
  },
  {
    name: 'Astoria',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '46.18788000',
    longitude: '-123.83125000'
  },
  {
    name: 'Athena',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.81180000',
    longitude: '-118.49053000'
  },
  {
    name: 'Aumsville',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.84095000',
    longitude: '-122.87092000'
  },
  {
    name: 'Baker City',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.77487000',
    longitude: '-117.83438000'
  },
  {
    name: 'Baker County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.70923000',
    longitude: '-117.67534000'
  },
  {
    name: 'Bandon',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.11900000',
    longitude: '-124.40845000'
  },
  {
    name: 'Banks',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.61872000',
    longitude: '-123.11428000'
  },
  {
    name: 'Barview',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.35428000',
    longitude: '-124.31317000'
  },
  {
    name: 'Bay City',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.52260000',
    longitude: '-123.88930000'
  },
  {
    name: 'Beavercreek',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.28790000',
    longitude: '-122.53564000'
  },
  {
    name: 'Beaverton',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.48706000',
    longitude: '-122.80371000'
  },
  {
    name: 'Bend',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.05817000',
    longitude: '-121.31531000'
  },
  {
    name: 'Benton County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.49176000',
    longitude: '-123.42931000'
  },
  {
    name: 'Bethany',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.55789000',
    longitude: '-122.86760000'
  },
  {
    name: 'Boardman',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.83986000',
    longitude: '-119.70058000'
  },
  {
    name: 'Brookings',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.05261000',
    longitude: '-124.28398000'
  },
  {
    name: 'Brownsville',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.39346000',
    longitude: '-122.98481000'
  },
  {
    name: 'Bunker Hill',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.35595000',
    longitude: '-124.20483000'
  },
  {
    name: 'Burns',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.58626000',
    longitude: '-119.05410000'
  },
  {
    name: 'Canby',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.26290000',
    longitude: '-122.69259000'
  },
  {
    name: 'Cannon Beach',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.89177000',
    longitude: '-123.96153000'
  },
  {
    name: 'Canyon City',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.38960000',
    longitude: '-118.95023000'
  },
  {
    name: 'Canyonville',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.92734000',
    longitude: '-123.28117000'
  },
  {
    name: 'Carlton',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.29428000',
    longitude: '-123.17649000'
  },
  {
    name: 'Cascade Locks',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.66984000',
    longitude: '-121.89064000'
  },
  {
    name: 'Cave Junction',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.16289000',
    longitude: '-123.64812000'
  },
  {
    name: 'Cedar Hills',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.50484000',
    longitude: '-122.79843000'
  },
  {
    name: 'Cedar Mill',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.52484000',
    longitude: '-122.81093000'
  },
  {
    name: 'Central Point',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.37596000',
    longitude: '-122.91643000'
  },
  {
    name: 'Chenoweth',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.62762000',
    longitude: '-121.24341000'
  },
  {
    name: 'Clackamas',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.40762000',
    longitude: '-122.57037000'
  },
  {
    name: 'Clackamas County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.18816000',
    longitude: '-122.22094000'
  },
  {
    name: 'Clatskanie',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '46.10122000',
    longitude: '-123.20679000'
  },
  {
    name: 'Clatsop County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '46.01747000',
    longitude: '-123.71677000'
  },
  {
    name: 'Coburg',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.13707000',
    longitude: '-123.06648000'
  },
  {
    name: 'Columbia City',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.89011000',
    longitude: '-122.80705000'
  },
  {
    name: 'Columbia County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.94377000',
    longitude: '-123.08805000'
  },
  {
    name: 'Condon',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.23430000',
    longitude: '-120.18503000'
  },
  {
    name: 'Coos Bay',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.36650000',
    longitude: '-124.21789000'
  },
  {
    name: 'Coos County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.18501000',
    longitude: '-124.09333000'
  },
  {
    name: 'Coquille',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.17705000',
    longitude: '-124.18761000'
  },
  {
    name: 'Cornelius',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.51984000',
    longitude: '-123.05983000'
  },
  {
    name: 'Corvallis',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.56457000',
    longitude: '-123.26204000'
  },
  {
    name: 'Cottage Grove',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.79762000',
    longitude: '-123.05952000'
  },
  {
    name: 'Creswell',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.91790000',
    longitude: '-123.02453000'
  },
  {
    name: 'Crook County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.14219000',
    longitude: '-120.35658000'
  },
  {
    name: 'Culp Creek',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.70346000',
    longitude: '-122.84757000'
  },
  {
    name: 'Culver',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.52568000',
    longitude: '-121.21310000'
  },
  {
    name: 'Curry County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.46661000',
    longitude: '-124.21534000'
  },
  {
    name: 'Dallas',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.91928000',
    longitude: '-123.31705000'
  },
  {
    name: 'Damascus',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.41762000',
    longitude: '-122.45898000'
  },
  {
    name: 'Dayton',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.22067000',
    longitude: '-123.07621000'
  },
  {
    name: 'Depoe Bay',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.80845000',
    longitude: '-124.06317000'
  },
  {
    name: 'Deschutes County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.91488000',
    longitude: '-121.22789000'
  },
  {
    name: 'Deschutes River Woods',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.99151000',
    longitude: '-121.35836000'
  },
  {
    name: 'Donald',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.22234000',
    longitude: '-122.83926000'
  },
  {
    name: 'Douglas County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.28536000',
    longitude: '-123.17942000'
  },
  {
    name: 'Drain',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.65873000',
    longitude: '-123.31870000'
  },
  {
    name: 'Dundee',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.27817000',
    longitude: '-123.01094000'
  },
  {
    name: 'Dunes City',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.88318000',
    longitude: '-124.11512000'
  },
  {
    name: 'Durham',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.40206000',
    longitude: '-122.75287000'
  },
  {
    name: 'Eagle Point',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.47263000',
    longitude: '-122.80282000'
  },
  {
    name: 'Elgin',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.56486000',
    longitude: '-117.91743000'
  },
  {
    name: 'Enterprise',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.42626000',
    longitude: '-117.27878000'
  },
  {
    name: 'Estacada',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.28957000',
    longitude: '-122.33370000'
  },
  {
    name: 'Eugene',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.05207000',
    longitude: '-123.08675000'
  },
  {
    name: 'Fairview',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.53845000',
    longitude: '-122.43398000'
  },
  {
    name: 'Florence',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.98262000',
    longitude: '-124.09984000'
  },
  {
    name: 'Forest Grove',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.51984000',
    longitude: '-123.11066000'
  },
  {
    name: 'Fossil',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.99819000',
    longitude: '-120.21614000'
  },
  {
    name: 'Four Corners',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.92790000',
    longitude: '-122.98371000'
  },
  {
    name: 'Fruitdale',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.42206000',
    longitude: '-123.30811000'
  },
  {
    name: 'Garden Home-Whitford',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.46400000',
    longitude: '-122.75891000'
  },
  {
    name: 'Gearhart',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '46.02427000',
    longitude: '-123.91125000'
  },
  {
    name: 'Gervais',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.10818000',
    longitude: '-122.89760000'
  },
  {
    name: 'Gilliam County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.37806000',
    longitude: '-120.21087000'
  },
  {
    name: 'Gladstone',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.38068000',
    longitude: '-122.59481000'
  },
  {
    name: 'Glide',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.30151000',
    longitude: '-123.10118000'
  },
  {
    name: 'Gold Beach',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.40733000',
    longitude: '-124.42177000'
  },
  {
    name: 'Gold Hill',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.43179000',
    longitude: '-123.05060000'
  },
  {
    name: 'Grand Ronde',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.06011000',
    longitude: '-123.60928000'
  },
  {
    name: 'Grant County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.49125000',
    longitude: '-119.00738000'
  },
  {
    name: 'Grants Pass',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.43933000',
    longitude: '-123.33067000'
  },
  {
    name: 'Green',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.16039000',
    longitude: '-123.36785000'
  },
  {
    name: 'Gresham',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.49818000',
    longitude: '-122.43148000'
  },
  {
    name: 'Happy Valley',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.44679000',
    longitude: '-122.53037000'
  },
  {
    name: 'Harbor',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '42.05317000',
    longitude: '-124.26759000'
  },
  {
    name: 'Harney County',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.06402000',
    longitude: '-118.96787000'
  },
  {
    name: 'Harrisburg',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.27401000',
    longitude: '-123.17065000'
  },
  {
    name: 'Hayesville',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '44.98595000',
    longitude: '-122.98287000'
  },
  {
    name: 'Heppner',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.35318000',
    longitude: '-119.55780000'
  },
  {
    name: 'Hermiston',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.84041000',
    longitude: '-119.28946000'
  },
  {
    name: 'Hillsboro',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.52289000',
    longitude: '-122.98983000'
  },
  {
    name: 'Hines',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '43.56404000',
    longitude: '-119.08105000'
  },
  {
    name: 'Hood River',
    countryCode: 'US',
    stateCode: 'OR',
    latitude: '45.70540000',
    longitude: '-121.52146000'
  },
  {
    name: 'Aberdeen',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.94408000',
    longitude: '-112.83833000'
  },
  {
    name: 'Ada County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.45112000',
    longitude: '-116.24109000'
  },
  {
    name: 'Adams County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.88965000',
    longitude: '-116.45387000'
  },
  {
    name: 'American Falls',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.78602000',
    longitude: '-112.85444000'
  },
  {
    name: 'Ammon',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.46964000',
    longitude: '-111.96664000'
  },
  {
    name: 'Arco',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.63657000',
    longitude: '-113.30028000'
  },
  {
    name: 'Ashton',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.07158000',
    longitude: '-111.44829000'
  },
  {
    name: 'Bannock County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.66851000',
    longitude: '-112.22463000'
  },
  {
    name: 'Bear Lake County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.28479000',
    longitude: '-111.32965000'
  },
  {
    name: 'Bellevue',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.46352000',
    longitude: '-114.26060000'
  },
  {
    name: 'Benewah County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '47.21755000',
    longitude: '-116.65883000'
  },
  {
    name: 'Bingham County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.21652000',
    longitude: '-112.39805000'
  },
  {
    name: 'Blackfoot',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.19047000',
    longitude: '-112.34498000'
  },
  {
    name: 'Blaine County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.41233000',
    longitude: '-113.98040000'
  },
  {
    name: 'Boise',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.61350000',
    longitude: '-116.20345000'
  },
  {
    name: 'Boise County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.98913000',
    longitude: '-115.73024000'
  },
  {
    name: 'Bonner County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '48.29975000',
    longitude: '-116.60097000'
  },
  {
    name: 'Bonners Ferry',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '48.69133000',
    longitude: '-116.31631000'
  },
  {
    name: 'Bonneville County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.38773000',
    longitude: '-111.61493000'
  },
  {
    name: 'Boundary County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '48.76702000',
    longitude: '-116.46288000'
  },
  {
    name: 'Buhl',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.59907000',
    longitude: '-114.75949000'
  },
  {
    name: 'Burley',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.53574000',
    longitude: '-113.79279000'
  },
  {
    name: 'Butte County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.72287000',
    longitude: '-113.17202000'
  },
  {
    name: 'Caldwell',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.66294000',
    longitude: '-116.68736000'
  },
  {
    name: 'Camas County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.46325000',
    longitude: '-114.80585000'
  },
  {
    name: 'Canyon County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.62513000',
    longitude: '-116.70929000'
  },
  {
    name: 'Caribou County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.77051000',
    longitude: '-111.56224000'
  },
  {
    name: 'Cascade',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.51628000',
    longitude: '-116.04180000'
  },
  {
    name: 'Cassia County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.28387000',
    longitude: '-113.60037000'
  },
  {
    name: 'Challis',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.50464000',
    longitude: '-114.23173000'
  },
  {
    name: 'Chubbuck',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.92075000',
    longitude: '-112.46609000'
  },
  {
    name: 'Clark County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.28398000',
    longitude: '-112.35135000'
  },
  {
    name: 'Clearwater County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.67370000',
    longitude: '-115.65686000'
  },
  {
    name: "Coeur d'Alene",
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '47.67768000',
    longitude: '-116.78047000'
  },
  {
    name: 'Council',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.72989000',
    longitude: '-116.43820000'
  },
  {
    name: 'Custer County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.24142000',
    longitude: '-114.28180000'
  },
  {
    name: 'Dalton Gardens',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '47.72963000',
    longitude: '-116.77019000'
  },
  {
    name: 'Driggs',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.72325000',
    longitude: '-111.11133000'
  },
  {
    name: 'Dubois',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.17630000',
    longitude: '-112.23082000'
  },
  {
    name: 'Eagle',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.69544000',
    longitude: '-116.35401000'
  },
  {
    name: 'Elmore County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.35390000',
    longitude: '-115.46918000'
  },
  {
    name: 'Emmett',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.87350000',
    longitude: '-116.49930000'
  },
  {
    name: 'Fairfield',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.34657000',
    longitude: '-114.79173000'
  },
  {
    name: 'Filer',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.57019000',
    longitude: '-114.60782000'
  },
  {
    name: 'Fort Hall',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.03325000',
    longitude: '-112.43831000'
  },
  {
    name: 'Franklin County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.18117000',
    longitude: '-111.81323000'
  },
  {
    name: 'Fremont County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.22879000',
    longitude: '-111.48202000'
  },
  {
    name: 'Fruitland',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.00766000',
    longitude: '-116.91655000'
  },
  {
    name: 'Garden City',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.62211000',
    longitude: '-116.23817000'
  },
  {
    name: 'Gem County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.06169000',
    longitude: '-116.39723000'
  },
  {
    name: 'Glenns Ferry',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.95490000',
    longitude: '-115.30090000'
  },
  {
    name: 'Gooding',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.93879000',
    longitude: '-114.71311000'
  },
  {
    name: 'Gooding County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.97090000',
    longitude: '-114.81152000'
  },
  {
    name: 'Grangeville',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '45.92655000',
    longitude: '-116.12237000'
  },
  {
    name: 'Hailey',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.51963000',
    longitude: '-114.31532000'
  },
  {
    name: 'Hansen',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.53068000',
    longitude: '-114.30101000'
  },
  {
    name: 'Hayden',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '47.76602000',
    longitude: '-116.78658000'
  },
  {
    name: 'Heyburn',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.55852000',
    longitude: '-113.76390000'
  },
  {
    name: 'Hidden Spring',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.72216000',
    longitude: '-116.25093000'
  },
  {
    name: 'Homedale',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.61766000',
    longitude: '-116.93376000'
  },
  {
    name: 'Idaho City',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.82850000',
    longitude: '-115.83455000'
  },
  {
    name: 'Idaho County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '45.84420000',
    longitude: '-115.46745000'
  },
  {
    name: 'Idaho Falls',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.46658000',
    longitude: '-112.03414000'
  },
  {
    name: 'Iona',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.52630000',
    longitude: '-111.93302000'
  },
  {
    name: 'Jefferson County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.82014000',
    longitude: '-112.31128000'
  },
  {
    name: 'Jerome',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.72407000',
    longitude: '-114.51865000'
  },
  {
    name: 'Jerome County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.68990000',
    longitude: '-114.26403000'
  },
  {
    name: 'Kamiah',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.22712000',
    longitude: '-116.02931000'
  },
  {
    name: 'Kellogg',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '47.53826000',
    longitude: '-116.11933000'
  },
  {
    name: 'Ketchum',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.68074000',
    longitude: '-114.36366000'
  },
  {
    name: 'Kimberly',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.53380000',
    longitude: '-114.36476000'
  },
  {
    name: 'Kootenai County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '47.67456000',
    longitude: '-116.70001000'
  },
  {
    name: 'Kuna',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.49183000',
    longitude: '-116.42012000'
  },
  {
    name: 'Lapwai',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.40489000',
    longitude: '-116.80487000'
  },
  {
    name: 'Latah County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.81613000',
    longitude: '-116.71168000'
  },
  {
    name: 'Lemhi County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.94331000',
    longitude: '-113.93324000'
  },
  {
    name: 'Lewis County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.23702000',
    longitude: '-116.42625000'
  },
  {
    name: 'Lewiston',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.41655000',
    longitude: '-117.01766000'
  },
  {
    name: 'Lewiston Orchards',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.38044000',
    longitude: '-116.97543000'
  },
  {
    name: 'Lincoln',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.51297000',
    longitude: '-111.96441000'
  },
  {
    name: 'Lincoln County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.00241000',
    longitude: '-114.13831000'
  },
  {
    name: 'Madison County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.78419000',
    longitude: '-111.65934000'
  },
  {
    name: 'Malad City',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.19159000',
    longitude: '-112.25080000'
  },
  {
    name: 'Marsing',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.54544000',
    longitude: '-116.81320000'
  },
  {
    name: 'McCall',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '44.91101000',
    longitude: '-116.09874000'
  },
  {
    name: 'Meridian',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.61211000',
    longitude: '-116.39151000'
  },
  {
    name: 'Middleton',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.70683000',
    longitude: '-116.62014000'
  },
  {
    name: 'Minidoka County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.85440000',
    longitude: '-113.63752000'
  },
  {
    name: 'Montpelier',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.32215000',
    longitude: '-111.29770000'
  },
  {
    name: 'Moreland',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.22269000',
    longitude: '-112.44248000'
  },
  {
    name: 'Moscow',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.73239000',
    longitude: '-117.00017000'
  },
  {
    name: 'Mountain Home',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.13295000',
    longitude: '-115.69120000'
  },
  {
    name: 'Murphy',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.21822000',
    longitude: '-116.55234000'
  },
  {
    name: 'Nampa',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.54072000',
    longitude: '-116.56346000'
  },
  {
    name: 'New Plymouth',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '43.96989000',
    longitude: '-116.81904000'
  },
  {
    name: 'Nez Perce County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.32676000',
    longitude: '-116.75024000'
  },
  {
    name: 'Nezperce',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.23489000',
    longitude: '-116.24070000'
  },
  {
    name: 'Oneida County',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '42.19490000',
    longitude: '-112.53962000'
  },
  {
    name: 'Orofino',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '46.47935000',
    longitude: '-116.25514000'
  },
  {
    name: 'Osburn',
    countryCode: 'US',
    stateCode: 'ID',
    latitude: '47.50604000',
    longitude: '-115.99933000'
  },
  {
    name: 'Ashaway',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.42343000',
    longitude: '-71.78562000'
  },
  {
    name: 'Barrington',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.74066000',
    longitude: '-71.30866000'
  },
  {
    name: 'Bradford',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.39899000',
    longitude: '-71.73701000'
  },
  {
    name: 'Bristol',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.67705000',
    longitude: '-71.26616000'
  },
  {
    name: 'Bristol County',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.70554000',
    longitude: '-71.28612000'
  },
  {
    name: 'Central Falls',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.89066000',
    longitude: '-71.39228000'
  },
  {
    name: 'Charlestown',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.38316000',
    longitude: '-71.64173000'
  },
  {
    name: 'Chepachet',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.91510000',
    longitude: '-71.67146000'
  },
  {
    name: 'Coventry',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.70010000',
    longitude: '-71.68284000'
  },
  {
    name: 'Cranston',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.77982000',
    longitude: '-71.43728000'
  },
  {
    name: 'Cumberland',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.96677000',
    longitude: '-71.43284000'
  },
  {
    name: 'Cumberland Hill',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.97454000',
    longitude: '-71.46700000'
  },
  {
    name: 'East Greenwich',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.66038000',
    longitude: '-71.45589000'
  },
  {
    name: 'East Providence',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.81371000',
    longitude: '-71.37005000'
  },
  {
    name: 'Exeter',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.57760000',
    longitude: '-71.53756000'
  },
  {
    name: 'Foster',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.85371000',
    longitude: '-71.75812000'
  },
  {
    name: 'Greenville',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.87121000',
    longitude: '-71.55201000'
  },
  {
    name: 'Harrisville',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.96565000',
    longitude: '-71.67451000'
  },
  {
    name: 'Hope Valley',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.50760000',
    longitude: '-71.71618000'
  },
  {
    name: 'Hopkinton',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.46121000',
    longitude: '-71.77757000'
  },
  {
    name: 'Jamestown',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.49705000',
    longitude: '-71.36728000'
  },
  {
    name: 'Johnston',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.82186000',
    longitude: '-71.50675000'
  },
  {
    name: 'Kent County',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.67334000',
    longitude: '-71.57895000'
  },
  {
    name: 'Kingston',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.48038000',
    longitude: '-71.52256000'
  },
  {
    name: 'Lincoln',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.92111000',
    longitude: '-71.43500000'
  },
  {
    name: 'Melville',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.58705000',
    longitude: '-71.28338000'
  },
  {
    name: 'Middletown',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.54566000',
    longitude: '-71.29144000'
  },
  {
    name: 'Narragansett',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.45010000',
    longitude: '-71.44950000'
  },
  {
    name: 'Narragansett Pier',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.43232000',
    longitude: '-71.45644000'
  },
  {
    name: 'New Shoreham',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.17233000',
    longitude: '-71.55783000'
  },
  {
    name: 'Newport',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.49010000',
    longitude: '-71.31283000'
  },
  {
    name: 'Newport County',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.49980000',
    longitude: '-71.28100000'
  },
  {
    name: 'Newport East',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.51579000',
    longitude: '-71.28752000'
  },
  {
    name: 'North Kingstown',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.55010000',
    longitude: '-71.46617000'
  },
  {
    name: 'North Providence',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.85010000',
    longitude: '-71.46617000'
  },
  {
    name: 'North Scituate',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.83177000',
    longitude: '-71.58729000'
  },
  {
    name: 'North Smithfield',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.96677000',
    longitude: '-71.54951000'
  },
  {
    name: 'Pascoag',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.95565000',
    longitude: '-71.70229000'
  },
  {
    name: 'Pawtucket',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.87871000',
    longitude: '-71.38256000'
  },
  {
    name: 'Portsmouth',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.60232000',
    longitude: '-71.25033000'
  },
  {
    name: 'Providence',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.82399000',
    longitude: '-71.41283000'
  },
  {
    name: 'Providence County',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.87136000',
    longitude: '-71.57860000'
  },
  {
    name: 'Smithfield',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.92204000',
    longitude: '-71.54951000'
  },
  {
    name: 'South Kingstown',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.44718000',
    longitude: '-71.52494000'
  },
  {
    name: 'Tiverton',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.62594000',
    longitude: '-71.21338000'
  },
  {
    name: 'Valley Falls',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.90677000',
    longitude: '-71.39061000'
  },
  {
    name: 'Wakefield-Peacedale',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.44606000',
    longitude: '-71.50040000'
  },
  {
    name: 'Warren',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.73038000',
    longitude: '-71.28255000'
  },
  {
    name: 'Warwick',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.70010000',
    longitude: '-71.41617000'
  },
  {
    name: 'Washington County',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.39649000',
    longitude: '-71.61966000'
  },
  {
    name: 'West Greenwich',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.63700000',
    longitude: '-71.66004000'
  },
  {
    name: 'West Warwick',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.69689000',
    longitude: '-71.52194000'
  },
  {
    name: 'Westerly',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '41.37760000',
    longitude: '-71.82729000'
  },
  {
    name: 'Andrews AFB, MD',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Andrews Manor, MD',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Camp Springs, MD',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Washington DC',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Dover, DE',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Denver CO',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Valdez AK',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Great Falls, MT',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Anchorage, AK',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Dallas, TX',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'San Angelo, TX',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Nuevo Laredo, TX',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Saragosa, TX',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: '30813',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Hamliton, Bermuda',
    countryCode: 'US',
    stateCode: '',
    latitude: '',
    longitude: ''
  },
  {
    name: 'Woonsocket',
    countryCode: 'US',
    stateCode: 'RI',
    latitude: '42.00288000',
    longitude: '-71.51478000'
  },
];

