const cheerio = require("cheerio");
const fs = require("fs");

const URL =
  "https://www.klart.se/se/stockholms-l%C3%A4n/v%C3%A4der-stockholm/";


async function scrapeWeather() {

  try {

    console.log("\nHämtar väder från Klart.se...\n");


    const response = await fetch(URL, {

      headers: {

        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
          "AppleWebKit/537.36 Chrome/120 Safari/537.36",

        "Accept-Language":
          "sv-SE,sv;q=0.9,en;q=0.8"

      }

    });


    if (!response.ok) {

      throw new Error(
        `Klart.se svarade med status ${response.status}`
      );

    }


    const html = await response.text();

    const $ = cheerio.load(html);


    const forecast = [];

    const usedDates = new Set();


    const weekdays =
      "Idag|måndag|tisdag|onsdag|torsdag|fredag|lördag|söndag";


    const months =
      "januari|februari|mars|april|maj|juni|juli|augusti|" +
      "september|oktober|november|december";


    $("a").each((index, element) => {

      const text = $(element)
        .text()
        .replace(/\s+/g, " ")
        .trim();


      if (
        !text.includes("max") ||
        !text.includes("min") ||
        !text.includes("Nederbörd") ||
        !text.includes("Vind")
      ) {
        return;
      }


      const pattern = new RegExp(

        `(${weekdays})\\s*` +
        `(\\d{1,2})\\s*` +
        `(${months})` +
        `.*?(-?\\d+)°\\s*max` +
        `\\s*(-?\\d+)°\\s*min` +
        `.*?Nederbörd\\s*([\\d,.]+)\\s*mm\\/dygn` +
        `.*?Vind\\s*([A-Za-zÅÄÖåäö-]+)\\s*(\\d+)\\s*m\\/s`,

        "i"

      );


      const match = text.match(pattern);


      if (!match) {
        return;
      }


      const [
        ,
        day,
        dateNumber,
        month,
        maxTemp,
        minTemp,
        rain,
        windDirection,
        windSpeed

      ] = match;


      const dateKey =
        `${dateNumber}-${month.toLowerCase()}`;


      if (usedDates.has(dateKey)) {
        return;
      }


      usedDates.add(dateKey);


      const probabilityMatch =
        text.match(
          /Sannolikhet nederbörd\s*(?:Låg|Medel|Hög)\s*\((\d+)%\)/i
        );


      forecast.push({

        day:
          day.charAt(0).toUpperCase() +
          day.slice(1).toLowerCase(),

        date:
          `${dateNumber} ${month.toLowerCase()}`,

        maxTemp:
          Number(maxTemp),

        minTemp:
          Number(minTemp),

        rain:
          Number(
            rain.replace(",", ".")
          ),

        rainProbability:
          probabilityMatch
            ? Number(probabilityMatch[1])
            : null,

        windDirection:
          windDirection,

        windSpeed:
          Number(windSpeed)

      });

    });


    const nextSevenDays =
      forecast.slice(0, 7);


    if (nextSevenDays.length === 0) {

      throw new Error(
        "Ingen väderdata hittades."
      );

    }


    const weatherData = {

      location: "Stockholm",

      source: "Klart.se",

      sourceUrl: URL,

      updated:
        new Date().toISOString(),

      days:
        nextSevenDays

    };


    fs.writeFileSync(

      "weather.json",

      JSON.stringify(
        weatherData,
        null,
        2
      ),

      "utf8"

    );


    console.log("✅ Scraping klar!");
    console.log(
      `${nextSevenDays.length} dagar sparades i weather.json\n`
    );


    console.table(

      nextSevenDays.map(day => ({

        Dag:
          day.day,

        Datum:
          day.date,

        Max:
          `${day.maxTemp}°`,

        Min:
          `${day.minTemp}°`,

        Regn:
          `${day.rain} mm`,

        Vind:
          `${day.windDirection} ${day.windSpeed} m/s`

      }))

    );

  }

  catch (error) {

    console.error("❌ Något gick fel:");
    console.error(error.message);

  }

}


scrapeWeather();