const container = document.getElementById("weather-container");
const updatedElement = document.getElementById("updated-time");

function getWeatherIcon(day) {

  if (day.rain >= 2 || day.rainProbability >= 80) {
    return "🌧️";
  }

  if (day.rain > 0 || day.rainProbability >= 50) {
    return "🌦️";
  }

  if (day.rainProbability >= 30) {
    return "⛅";
  }

  return "☀️";
}


async function loadWeather() {

  try {

    const response = await fetch("weather.json");

    if (!response.ok) {
      throw new Error("Could not load weather.json");
    }

    const data = await response.json();

    container.innerHTML = "";


    data.days.forEach(day => {

      const card = document.createElement("article");

      card.className = "weather-card";


      const probability =
        day.rainProbability !== null
          ? `${day.rainProbability}%`
          : "–";


      card.innerHTML = `

        <div class="weather-icon">
          ${getWeatherIcon(day)}
        </div>

        <h3 class="weather-day">
          ${day.day}
        </h3>

        <p class="weather-date">
          ${day.date}
        </p>

        <div class="weather-temperature">

          <strong>
            ${day.maxTemp}°
          </strong>

          <span>
            / ${day.minTemp}°
          </span>

        </div>

        <div class="weather-details">

          <p>
            💧 ${day.rain} mm
          </p>

          <p>
            ☔ ${probability}
          </p>

          <p>
            💨 ${day.windDirection} ${day.windSpeed} m/s
          </p>

        </div>

      `;

      container.appendChild(card);

    });


    if (data.updated) {

      const date = new Date(data.updated);

      updatedElement.textContent =
        "Last scraped: " +
        date.toLocaleString("sv-SE");

    }

  }

  catch (error) {

    console.error(error);

    container.innerHTML = `

      <div class="weather-card">

        <h3>
          Weather unavailable
        </h3>

        <p>
          Run the scraper to create weather.json.
        </p>

      </div>

    `;

  }

}


loadWeather();