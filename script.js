const API_KEY = "34edf5c……………………12664798391";

const cityInp = document.getElementById("city-inp");
const goBtn = document.getElementById("go-btn");
const geoBtn = document.getElementById("geo-btn");
const grid = document.getElementById("grid");
const mainCity = document.getElementById("main-city");
const mainTemp = document.getElementById("main-temp");
const mainCond = document.getElementById("main-cond");
const mainIcon = document.getElementById("main-icon");
const mainDetails = document.getElementById("main-details");
const forecastGrid = document.getElementById("forecast-grid");
const tipsBox = document.getElementById("tips");
const unitToggle = document.getElementById("unit-toggle");
const themeToggle = document.getElementById("theme-toggle");

let currentUnit = "metric"; // metric for °C, imperial for °F
const defaultList = ["Kanpur", "Delhi", "Mumbai", "Chennai", "Bengaluru", "Kolkata"];
// https://api.openweathermap.org/data/2.5/weather?q=Kanpur&appid=34edf5c3a7b9c1057ff2f12664798391&units=metric


async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod != 200) return null;
     return {
      city: data.name,
      temp: Math.round(data.main.temp),
      cond: data.weather[0].main,
      desc: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      pressure: data.main.pressure
    };
  } catch (e) {
    console.log("error fetching", e);
    return null;
  }
}


function showMain(w) {
  if (!w) return;
  mainCity.textContent = w.city;
  mainTemp.textContent = w.temp + (currentUnit === "metric" ? "°C" : "°F");
  mainCond.textContent = `${w.cond} (${w.desc})`;
  mainIcon.src = w.icon;
  mainDetails.innerHTML = `
    <p>Humidity: ${w.humidity}%</p>
    <p>Wind: ${w.wind} ${currentUnit === "metric" ? "m/s" : "mph"}</p>
    <p>Pressure: ${w.pressure} hPa</p>
  `;
  showTips(w.cond);
}


async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.cod != "200") return [];
    let forecast = [];
    for (let i = 0; i < data.list.length; i += 8) {
      let f = data.list[i];
      forecast.push({
        date: new Date(f.dt_txt).toLocaleDateString(undefined, { weekday: "short" }),
        temp: Math.round(f.main.temp),
        icon: `https://openweathermap.org/img/wn/${f.weather[0].icon}.png`,
        cond: f.weather[0].main
      });
    }
    return forecast;
  } catch (e) {
    console.log("error fetching forecast", e);
    return [];
  }
}


  forecastGrid.innerHTML = "";
  list.forEach(f => {
    const div = document.createElement("div");
    div.className = "forecast-card";
    div.innerHTML = `
      <h4>${f.date}</h4>
      <img src="${f.icon}" alt="">
      <p>${f.temp}${currentUnit === "metric" ? "°C" : "°F"}</p>
      <p>${f.cond}</p>
    `;
    forecastGrid.appendChild(div);
  });


function showForecast(list) {
  forecastGrid.innerHTML = "";
  list.forEach(f => {
    const div = document.createElement("div");
    div.className = "forecast-card";
    div.innerHTML = `
      <h4>${f.date}</h4>
      <img src="${f.icon}" alt="">
      <p>${f.temp}${currentUnit === "metric" ? "°C" : "°F"}</p>
      <p>${f.cond}</p>
    `;
    forecastGrid.appendChild(div);
  });
}


function makeCard(w) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <h4>${w.city}</h4>
    <p>${w.temp}${currentUnit === "metric" ? "°C" : "°F"}</p>
    <p>${w.cond}</p>
    <img src="${w.icon}" alt="">
  `;
  div.onclick = async () => {
    showMain(w);
    let forecast = await getForecast(w.city);
    showForecast(forecast);
  };
  return div;
}


async function loadDefaults() {
  grid.innerHTML = "";
  for (let c of defaultList) {
    let w = await getWeather(c);
    if (w) grid.appendChild(makeCard(w));
  }
}




function showTips(cond) {
  let tips = {
    Clear: "☀️ It's clear today, great for outdoor activities!",
    Clouds: "☁️ A bit cloudy, keep a light jacket handy.",
    Rain: "🌧️ Rainy day, don't forget your umbrella!",
    Snow: "❄️ Snowy weather, stay warm and drive safe.",
    Thunderstorm: "⛈️ Thunderstorm alert, better to stay indoors.",
    Drizzle: "🌦️ Light rain, a raincoat will help."
  };
  tipsBox.textContent = tips[cond] || "🌍 Stay updated with the weather!";
}




geoBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.cod == 200) {
        let w = {
          city: data.name,
          temp: Math.round(data.main.temp),
          cond: data.weather[0].main,
          desc: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          humidity: data.main.humidity,
          wind: data.wind.speed,
          pressure: data.main.pressure
        };
        showMain(w);
        let forecast = await getForecast(w.city);
        showForecast(forecast);
      }
    });
  }
});


unitToggle.addEventListener("click", async () => {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  await loadDefaults();
  const w = await getWeather(mainCity.textContent);
  if (w) {
    showMain(w);
    let forecast = await getForecast(w.city);
    showForecast(forecast);
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("night");
});

window.onload = async () => {
  await loadDefaults();
  const first = await getWeather("Kanpur");
  showMain(first);
  let forecast = await getForecast("Kanpur");
  showForecast(forecast);
};
