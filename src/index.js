const apiKey = "47f5a60b3619ca61ec705339d24b427c";
const citySearch = () => {
  const city = document.getElementById("city-input").value.trim();
  if (city) {
    saveSearchHistory(city);
    weatherInCity(city); // Fetching weather data by city if the input is not empty
  } else {
    alert("Please enter a valid city name");
  }
};

const currentLocation = () => {
  if (navigator.geolocation) {
    // Checking if geolocation is supported by the browser
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords; // Getting latitude and longitude from the geolocation API
        weatherByCoordinates(latitude, longitude); // Fetching weather data by coordinates
      },
      (error) => {
        alert("Error in getting location: " + error.message);
      }
    );
  } else {
    alert("Geolocation  not supported by the browser");
  }
};

const weatherInCity = (city) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.cod === 200) {
        const { coord } = data;
        weatherByCoordinates(coord.lat, coord.lon);
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      alert("Failed to fetch  data");
    });
};

const weatherByCoordinates = (lat, lon) => {
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // API to fetch current weather data by coordinates
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`; // API to fetch forecast data by coordinates

  fetch(currentWeatherUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      getCurrentWeather(data);
    })
    .catch((error) => {
      alert("Failed to get current weather data");
    });

  fetch(forecastUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      displayFutureForecast(data.list);
    })
    .catch((error) => {
      alert("Failed to get future forecast");
    });
};

const getCurrentWeather = (data) => {
  if (!data || !data.weather || data.weather.length === 0) {
    alert("oops! No data found.");
    return;
  }

  const weatherDataContainer = document.getElementById("weather-data");
  const weatherForecast = document.getElementById("weather-forecast");
  weatherForecast.classList.remove("hidden");
  const currentDate = new Date();
  // const formattedDate = `${currentDate.getDate()}/${
  //   currentDate.getMonth() + 1
  // }/${currentDate.getFullYear()}`; // Formatting the current date
  weatherDataContainer.innerHTML = `
      <div class=" flex items-center justify-between w-full text-cyan-950">
        <div class="flex flex-col justify-center gap-2">
          <div class="flex gap-4">
            <h2 class="text-xl md:text-2xl lg:text-4xl font-bold mb-4">${data.name}</h2>
            <h3 class="text-xl md:text-2xl lg:text-4xl font-bold mb-4">(Today)</h3>
          </div>
          <p class="text-lg md:text-xl lg:text-2xl">Temperature: ${data.main.temp} °C</p>
          <p class="text-lg md:text-xl lg:text-2xl">Humidity: ${data.main.humidity} %</p>
          <p class="text-lg md:text-xl lg:text-2xl">Wind Speed: ${data.wind.speed} m/s</p>
        </div>
        <div class="flex flex-col">
          <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" class="w-20 h-20 ml-4">
          <p class="text-xl md:text-2xl font-bold">${data.weather[0].description}</p>
        </div>
      </div>
    `;
};

const displayFutureForecast = (forecastList) => {
  if (!forecastList || forecastList.length === 0) {
    alert("Failed to get future forecast data");
    return;
  }

  const futureForecastContainer = document.getElementById("future-forecast");
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  // Formating tomorrow's date for comparison
  const formattedTomorrow = tomorrow.toISOString().split("T")[0];

  futureForecastContainer.innerHTML = forecastList
    .filter((day) => {
      const date = new Date(day.dt * 1000);
      const formattedDate = date.toISOString().split("T")[0];
      return formattedDate >= formattedTomorrow; // Excluding today, starting from tomorrow
    })
    .filter((_, index) => index % 8 === 0) // Taking every 8th forecast item
    .slice(0, 7) // Limit to 7 days
    .map((day) => {
      const date = new Date(day.dt * 1000);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const formattedDate = date.toISOString().split("T")[0];

      return `
          <div class="bg-slate-600 text-red-700 p-2 lg:p-4 rounded-lg shadow-md text-center h-1 md:h-3">
            <h3 class="text-xl font-bold">${
              formattedDate === formattedTomorrow ? "Tomorrow" : dayName
            }</h3>
            <div class="flex justify-center pl-20">
              <img src="http://openweathermap.org/img/wn/${
                day.weather[0].icon
              }@2x.png" alt="${day.weather[0].description}" class="w-20 h-20">
            </div>
            <p class="text-lg lg:text-xl">Temp: ${day.main.temp} °C</p>
            <p class="text-lg lg:text-xl">Wind: ${day.wind.speed} m/s</p>
            <p class="text-lg lg:text-xl">Humidity: ${day.main.humidity} %</p>
          </div>
        `;
    })
    .join("");
};

const saveSearchHistory = (city) => {
  let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  searchHistory = searchHistory.filter(
    (search) => search.toLowerCase() !== city.toLowerCase()
  );
  searchHistory.unshift(city);
  if (searchHistory.length > 5) searchHistory.pop();
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
};

const displaysearchHistory = () => {
  const searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
  const searchHistoryDropdown = document.getElementById(
    "search-history-dropdown"
  );
  if (searchHistory.length > 0) {
    searchHistoryDropdown.innerHTML = searchHistory
      .map(
        (city) => `
        <option value="${city}">${city}</option>
      `
      )
      .join("");
    searchHistoryDropdown.size = searchHistory.length;
    searchHistoryDropdown.classList.remove("hidden");
  } else {
    searchHistoryDropdown.classList.add("hidden");
  }
};

document.getElementById("search-btn").addEventListener("click", citySearch);
document
  .getElementById("current-location-btn")
  .addEventListener("click", currentLocation);
document
  .getElementById("city-input")
  .addEventListener("focus", displaysearchHistory);

document.getElementById("city-input").addEventListener("blur", () => {
  setTimeout(() => {
    document.getElementById("search-history-dropdown").classList.add("hidden");
  }, 300);
});

document
  .getElementById("search-history-dropdown")
  .addEventListener("change", (event) => {
    document.getElementById("city-input").value = event.target.value;
    document.getElementById("search-history-dropdown").classList.add("hidden");
  });
