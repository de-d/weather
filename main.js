import { UI, DETAILS_UI } from "./src/modules/constants.js";
import { saveFavoriteCities, getFavoriteCities } from "./src/modules/localData.js";
import { format } from "date-fns";

export let favoriteCities = new Set();

function validateCityName(cityName) {
  if (/\d/.test(cityName)) {
    alert("В названии городов вроде нет цифр");
    throw new Error("В названии городов вроде нет цифр");
  }
}

async function fetchWeatherData(cityName) {
  const WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather";
  const FORECAST_URL = "http://api.openweathermap.org/data/2.5/forecast";
  const METRIC = "&units=metric";

  const API_KEY = "cdbaa2db9a9310e76fa37970cfabeb93";

  const url = `${WEATHER_URL}?q=${cityName}&appid=${API_KEY}&units=metric`;
  const urlForecast = `${FORECAST_URL}?q=${cityName}${METRIC}&appid=${API_KEY}&cnt=3`;

  try {
    const weatherData = await fetchWeather(url);
    const forecastData = await fetchForecastWeather(urlForecast);
    return [weatherData, forecastData];
  } catch (error) {
    console.error("Ошибка при получении данных о погоде:", error);
    alert("Ошибка при получении данных о погоде, скорее всего вы ввели неправильное название города");
    throw new Error("Не удалось получить данные о погоде");
  }
}

async function fetchWeather(url) {
  const res = await fetch(url);
  const informWeather = await res.json();

  const icon = informWeather.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;
  const cityName = informWeather.name;

  UI.ACTIVE_CITY.textContent = cityName;
  UI.TEMP.textContent = Math.round(informWeather.main.temp);
  UI.WEATHER_ICON.src = iconUrl;
  UI.FEELS_LIKE.textContent = Math.round(informWeather.main.feels_like);

  const dateTime = new Date((informWeather.dt + informWeather.timezone) * 1000);
  const timezoneOffset = Math.abs(dateTime.getTimezoneOffset());
  const adjustedDateTime = (timestamp) => new Date((timestamp + informWeather.timezone - timezoneOffset * 60) * 1000);
  const sunriseHourMin = format(adjustedDateTime(informWeather.sys.sunrise), "HH:mm");
  const sunsetHourMin = format(adjustedDateTime(informWeather.sys.sunset), "HH:mm");
  UI.SUNRISE.textContent = sunriseHourMin;
  UI.SUNSET.textContent = sunsetHourMin;

  updateActiveCheckbox(cityName);

  return informWeather;
}

async function fetchForecastWeather(urlForecast) {
  const res = await fetch(urlForecast);
  const informWeather = await res.json();

  DETAILS_UI.FORECAST_TEMP_ONE.textContent = Math.round(informWeather.list[0].main.temp);
  DETAILS_UI.FORECAST_TEMP_TWO.textContent = Math.round(informWeather.list[1].main.temp);
  DETAILS_UI.FORECAST_TEMP_THREE.textContent = Math.round(informWeather.list[2].main.temp);

  DETAILS_UI.FORECAST_FEELS_LIKE_ONE.textContent = Math.round(informWeather.list[0].main.feels_like);
  DETAILS_UI.FORECAST_FEELS_LIKE_TWO.textContent = Math.round(informWeather.list[1].main.feels_like);
  DETAILS_UI.FORECAST_FEELS_LIKE_THREE.textContent = Math.round(informWeather.list[2].main.feels_like);

  DETAILS_UI.FORECAST_IMG_ONE.src = `https://openweathermap.org/img/wn/${informWeather.list[0].weather[0].icon}@4x.png`;
  DETAILS_UI.FORECAST_IMG_TWO.src = `https://openweathermap.org/img/wn/${informWeather.list[1].weather[0].icon}@4x.png`;
  DETAILS_UI.FORECAST_IMG_THREE.src = `https://openweathermap.org/img/wn/${informWeather.list[2].weather[0].icon}@4x.png`;

  const formatTimeForecast = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  DETAILS_UI.FORECAST_TIME_ONE.textContent = formatTimeForecast(informWeather.list[0].dt_txt);
  DETAILS_UI.FORECAST_TIME_TWO.textContent = formatTimeForecast(informWeather.list[1].dt_txt);
  DETAILS_UI.FORECAST_TIME_THREE.textContent = formatTimeForecast(informWeather.list[2].dt_txt);

  return informWeather;
}

window.addEventListener("load", () => {
  const defaultCity = "Niger";

  favoriteCities = getFavoriteCities();
  favoriteCities.forEach((cityName) => createFavList(cityName));
  fetchWeatherData(defaultCity);
  console.log("Избранные города:", favoriteCities);
});

function createFavList(cityName) {
  const div = document.createElement("div");
  div.classList.add("fav-list__item");
  div.id = cityName;

  const pText = document.createElement("p");
  pText.classList.add("fav-list__city-name");
  pText.textContent = cityName;

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("fav-list__delete-btn");
  const img = document.createElement("img");
  img.src = "/src/icon/close-icon.svg";
  img.alt = "close";

  deleteBtn.appendChild(img);

  div.append(pText, deleteBtn);

  const favList = document.getElementById("city__favlist-container");
  favList.appendChild(div);

  div.addEventListener("click", () => {
    fetchWeatherData(cityName);
  });

  deleteBtn.addEventListener("click", () => {
    const divToRemove = document.getElementById(cityName);
    if (divToRemove) {
      divToRemove.remove();
      favoriteCities.delete(cityName);
      saveFavoriteCities(favoriteCities);
      updateActiveCheckbox(cityName);
    }
  });

  favoriteCities.add(cityName);
  saveFavoriteCities(favoriteCities);

  return div;
}

UI.FAV_CHECKBOX.addEventListener("click", () => {
  const cityName = UI.ACTIVE_CITY.textContent;

  if (!favoriteCities.has(cityName)) {
    favoriteCities.add(cityName);
    createFavList(cityName);
  } else {
    favoriteCities.delete(cityName);
    removeFavList(cityName);
  }
  console.log("Избранные города:", favoriteCities);
});

function updateActiveCheckbox(cityName) {
  UI.FAV_CHECKBOX.checked = favoriteCities.has(cityName);
}

function removeFavList(cityName) {
  const favList = document.getElementById("city__favlist-container");
  const favItems = favList.getElementsByClassName("fav-list__item");
  for (let i = 0; i < favItems.length; i++) {
    const item = favItems[i];
    const cityText = item.querySelector(".fav-list__city-name").textContent;
    if (cityText === cityName) {
      item.remove();
      favoriteCities.delete(cityName);
      saveFavoriteCities(favoriteCities);
      break;
    }
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  const cityName = UI.SEARCH_INPUT.value;
  validateCityName(cityName);
  fetchWeatherData(cityName);

  localStorage.setItem("lastSearchedCity", cityName);

  event.target.reset();

  return false;
}
UI.SEARCH_FORM.addEventListener("submit", handleFormSubmit);
