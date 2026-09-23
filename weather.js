const city = "Stockholm";

const weatherURL =
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=sv`;

async function getWeather() {
  try {
    const response = await fetch(weatherURL);
    const data = await response.json();

    console.log(data);

    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;

    document.getElementById("temperature").textContent =
      `${temperature}°C`;

    document.getElementById("weather-description").textContent =
      description;
let clothing;

if (temperature < 5) {
    clothing = "coat";
} else if (temperature < 13) {
    clothing = "jacket";
} else if (temperature < 19) {
    clothing = "cardigan";
} else if (temperature < 25) {
    clothing = "shirt";
} else {
    clothing = "dress";
}

console.log("Vädret rekommenderar:", clothing);

getFashionProduct(clothing);

  } catch (error) {
    console.error("Något gick fel:", error);
  }
}

getWeather();



async function getFashionProduct(searchTerm) {

    const url =
        `https://asos10.p.rapidapi.com/api/v1/getProductListBySearchTerm?searchTerm=${searchTerm}&currency=USD&country=US&store=US&languageShort=en&sizeSchema=US&limit=50&offset=0&sort=recommended`;

    const options = {
        method: "GET",
        headers: {
            "x-rapidapi-key": RAPID_API_KEY,
            "x-rapidapi-host": "asos10.p.rapidapi.com"
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log("ASOS DATA:", data);
        const products = data.data.products;

if (products && products.length > 0) {
    const randomIndex = Math.floor(Math.random() * products.length);
const product = products[randomIndex];

    console.log("VALD PRODUKT:", product);

    document.getElementById("product-name").textContent = product.name;

  if (product.imageUrl) {
    let imageUrl = product.imageUrl;

    if (!imageUrl.startsWith("http")) {
        imageUrl = "https://" + imageUrl.replace(/^\/+/, "");
    }

    document.getElementById("product-image").src = imageUrl;
}

    if (product.price && product.price.current) {
        document.getElementById("product-price").textContent =
            product.price.current.text;
    }
}

    } catch (error) {
        console.error("ASOS error:", error);
    }
}

document.getElementById("new-outfit").addEventListener("click", function () {
    getWeather();
});