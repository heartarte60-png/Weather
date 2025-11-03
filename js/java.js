const API_KEY = "d43ecf3a5f36407586d191006250211";

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
const result = document.getElementById("weatherResult");


function showSuggestions(list) {
  suggestions.innerHTML = "";
  if (!list || list.length === 0) {
    suggestions.style.display = "none";
    return;
  }
  list.forEach(city => {
    const li = document.createElement("li");
    li.textContent = `${city.name}, ${city.country}`;
    li.addEventListener("click", () => {
      searchInput.value = city.name;
      suggestions.style.display = "none";
      getWeather(city.name);
    });
    suggestions.appendChild(li);
  });
  suggestions.style.display = "block";
}


let lastFetchToken = 0;
searchInput.addEventListener("input", async () => {
  const q = searchInput.value.trim();
  if (q.length < 2) {
    suggestions.style.display = "none";
    return;
  }

  const token = ++lastFetchToken;
  const url = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("suggest fetch failed");
    const data = await res.json();
   
    if (token !== lastFetchToken) return;
    showSuggestions(data);
  } catch (err) {
    console.error(err);
    suggestions.style.display = "none";
  }
});


document.addEventListener("click", (e) => {
  if (!e.target.closest('.search-large')) suggestions.style.display = "none";
});


searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    suggestions.style.display = "none";
    getWeather(searchInput.value.trim());
  }
});


searchBtn.addEventListener("click", () => getWeather(searchInput.value.trim()));


window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        getWeather(`${lat},${lon}`);
      },
      () => {
        
        getWeather("Cairo");
      },
      { timeout: 8000 }
    );
  } else {
    getWeather("Cairo");
  }
});


async function getWeather(city) {
  if (!city) return;
  
  result.innerHTML = `<p style="color:rgba(255,255,255,0.7); text-align:center; width:100%;">Loading...</p>`;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=3&aqi=no&alerts=no`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch weather");
    const data = await res.json();
    showWeather(data);
  } catch (err) {
    console.error(err);
    result.innerHTML = `<p style="color:#ffb3b3; text-align:center; width:100%;">City not found or API error.</p>`;
  }
}

function showWeather(data) {
  result.innerHTML = "";
  
  (data.forecast.forecastday || []).slice(0,3).forEach(day => {
    const d = new Date(day.date);
    const dateStr = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const card = document.createElement("div");
    card.className = "card";

    
    const iconSrc = day.day.condition.icon.startsWith("//") ? "https:" + day.day.condition.icon : day.day.condition.icon;

    card.innerHTML = `
      <div class="city">${data.location.name}</div>
      <div class="date">${dateStr}</div>
      <div class="icon-wrap">
        <img src="${iconSrc}" alt="${day.day.condition.text}" />
      </div>
      <div class="temp">${Math.round(day.day.avgtemp_c)}°C</div>
      <div class="condition">${day.day.condition.text}</div>
      <div class="small">Max ${Math.round(day.day.maxtemp_c)}° • Min ${Math.round(day.day.mintemp_c)}°</div>
    `;

    result.appendChild(card);
  });
}
