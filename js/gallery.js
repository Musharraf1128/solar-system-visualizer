const NASA_API_KEY = "0g1C1ZIEcn4LzCvorcJIV3kwGACquTgYrbZIBrT2"; // Replace with your NASA API key
const ITEMS_PER_PAGE = 12;

async function fetchSpaceImages() {
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const gallery = document.getElementById("gallery");

  try {
    loading.style.display = "block";
    error.style.display = "none";

    const response = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&count=${ITEMS_PER_PAGE}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch images");
    }

    const data = await response.json();

    gallery.innerHTML = data
      .map(
        (item) => `
            <div class="gallery-item">
                <img src="${item.url}" alt="${item.title}">
                <div class="gallery-info">
                    <h3>${item.title}</h3>
                    <p>${item.date}</p>
                </div>
            </div>
        `
      )
      .join("");
  } catch (err) {
    error.textContent = "Error loading images. Please try again later.";
    error.style.display = "block";
  } finally {
    loading.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", fetchSpaceImages);
