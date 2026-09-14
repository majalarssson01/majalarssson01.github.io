const cheerio = require("cheerio");
const fs = require("fs/promises");

const url = "https://www.allabolag.se/bransch-s%C3%B6k?q=Arkitekter";

async function scrape() {
  try {
    console.log("Hämtar sidan...");

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8",
      },
    });

    console.log("Status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Kunde inte hämta sidan. HTTP-status: ${response.status}`
      );
    }

    const html = await response.text();

    const $ = cheerio.load(html);

    const companyNames = [];

    // Företagsrubrikerna är h2-rubriker med länkar till /foretag/...
    $("h2 a[href^='/foretag/']").each((index, element) => {
      const name = $(element).text().trim();

      if (name) {
        companyNames.push(name);
      }
    });

    // Tar bort eventuella dubletter
    const uniqueNames = [...new Set(companyNames)];

    console.log(`Hittade ${uniqueNames.length} företag.`);

    // Gör varje företagsnamn till en säker CSV-rad.
    // Citattecken dubblas enligt CSV-formatet.
    const csv = uniqueNames
      .map((name) => `"${name.replaceAll('"', '""')}"`)
      .join("\n");

    // BOM gör att å, ä och ö brukar visas korrekt i Excel.
    await fs.writeFile("rubriker.csv", "\uFEFF" + csv, "utf8");

    console.log("Klart!");
    console.log("Resultatet har sparats i rubriker.csv");
  } catch (error) {
    console.error("Något gick fel:");
    console.error(error.message);
  }
}

scrape();