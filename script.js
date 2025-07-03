// Populate the area dropdown when the page loads
window.addEventListener("DOMContentLoaded", function () {
  const areaSelect = document.getElementById("area-select");
  areaSelect.innerHTML = '<option value="">Select Area</option>';

  fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list")
    .then((response) => response.json())
    .then((data) => {
      if (data.meals) {
        data.meals.forEach((areaObj) => {
          const option = document.createElement("option");
          option.value = areaObj.strArea;
          option.textContent = areaObj.strArea;
          areaSelect.appendChild(option);
        });
      }
    });
});

// When the user selects an area, fetch and display meals for that area
document.getElementById("area-select").addEventListener("change", function () {
  const area = this.value;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  // Remove any existing modal from the page
  const oldModal = document.getElementById("recipe-modal");
  if (oldModal) {
    oldModal.remove();
  }

  if (!area) return;

  // Use async function to fetch meals for the selected area
  const fetchMeals = async () => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
          area
        )}`
      );
      const data = await response.json();

      if (data.meals) {
        data.meals.forEach((meal) => {
          // Create a div for each meal
          const mealDiv = document.createElement("div");
          mealDiv.className = "meal";

          // Create a title for the meal
          const title = document.createElement("h3");
          title.textContent = meal.strMeal;

          // Create an image for the meal
          const img = document.createElement("img");
          img.src = meal.strMealThumb;
          img.alt = meal.strMeal;

          // Add the title and image to the meal div
          mealDiv.appendChild(title);
          mealDiv.appendChild(img);

          // Add a click event to show details in a popup modal
          mealDiv.addEventListener("click", async () => {
            try {
              const detailResponse = await fetch(
                `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
              );
              const detailData = await detailResponse.json();
              const mealDetail = detailData.meals[0];

              // Remove any existing modal
              const existingModal = document.getElementById("recipe-modal");
              if (existingModal) {
                existingModal.remove();
              }

              // Create the modal background
              const modal = document.createElement("div");
              modal.id = "recipe-modal";
              modal.style.position = "fixed";
              modal.style.top = "0";
              modal.style.left = "0";
              modal.style.width = "100vw";
              modal.style.height = "100vh";
              modal.style.background = "rgba(0,0,0,0.5)";
              modal.style.display = "flex";
              modal.style.alignItems = "center";
              modal.style.justifyContent = "center";
              modal.style.zIndex = "1000";

              // Create the modal content box
              const modalContent = document.createElement("div");
              modalContent.style.background = "#fff";
              modalContent.style.padding = "20px";
              modalContent.style.borderRadius = "8px";
              modalContent.style.maxWidth = "400px";
              modalContent.style.width = "90%";
              modalContent.style.maxHeight = "80vh";
              modalContent.style.overflowY = "auto";
              modalContent.style.position = "relative";

              // Close button
              const closeBtn = document.createElement("button");
              closeBtn.textContent = "Close";
              closeBtn.style.position = "absolute";
              closeBtn.style.top = "10px";
              closeBtn.style.right = "10px";
              closeBtn.style.padding = "5px 10px";
              closeBtn.style.cursor = "pointer";
              closeBtn.addEventListener("click", () => {
                modal.remove();
              });

              // Show the meal title
              const detailTitle = document.createElement("h2");
              detailTitle.textContent = mealDetail.strMeal;

              // Show the meal image with rounded corners
              const detailImg = document.createElement("img");
              detailImg.src = mealDetail.strMealThumb;
              detailImg.alt = mealDetail.strMeal;
              detailImg.style.maxWidth = "100%";
              detailImg.style.borderRadius = "12px"; // Rounded corners

              // Show the ingredients
              const ingredientsTitle = document.createElement("h3");
              ingredientsTitle.textContent = "Ingredients:";

              const ingredientsList = document.createElement("ul");
              for (let i = 1; i <= 20; i++) {
                const ingredient = mealDetail[`strIngredient${i}`];
                const measure = mealDetail[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== "") {
                  const li = document.createElement("li");
                  li.textContent = `${ingredient} - ${measure}`;
                  ingredientsList.appendChild(li);
                }
              }

              // Show the instructions as an unordered list
              const instructionsTitle = document.createElement("h3");
              instructionsTitle.textContent = "Instructions:";

              // Split instructions into steps by line breaks or periods
              const instructionsList = document.createElement("ul");
              // Split by line breaks, filter out empty lines
              const steps = mealDetail.strInstructions
                .split(/\r?\n/)
                .map((step) => step.trim())
                .filter((step) => step.length > 0);
              // If splitting by line breaks gives only one step, try splitting by period
              let stepsToUse = steps;
              if (steps.length === 1) {
                stepsToUse = mealDetail.strInstructions
                  .split(".")
                  .map((step) => step.trim())
                  .filter((step) => step.length > 0);
              }
              // Add a bullet point for every other line (even index), only those lines get a bullet
              stepsToUse.forEach((step, index) => {
                if (index % 2 === 0) {
                  const li = document.createElement("li");
                  li.textContent = step;
                  instructionsList.appendChild(li);
                } else {
                  // Add as plain text (no bullet), inside the previous li if possible
                  if (instructionsList.lastChild) {
                    instructionsList.lastChild.textContent += ` ${step}`;
                  }
                }
              });

              // Add everything to the modal content
              modalContent.appendChild(closeBtn);
              modalContent.appendChild(detailTitle);
              modalContent.appendChild(detailImg);
              modalContent.appendChild(ingredientsTitle);
              modalContent.appendChild(ingredientsList);
              modalContent.appendChild(instructionsTitle);
              modalContent.appendChild(instructionsList);

              // Add modal content to modal background
              modal.appendChild(modalContent);

              // Add modal to the body
              document.body.appendChild(modal);

              // Optional: close modal when clicking outside the content
              modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                  modal.remove();
                }
              });
            } catch (error) {
              console.error("Error fetching meal details:", error);
              // Optionally show an error message in a modal
            }
          });

          // Add the meal div to the results section
          resultsDiv.appendChild(mealDiv);
        });
      } else {
        resultsDiv.textContent = "No meals found for this area.";
      }
    } catch (error) {
      resultsDiv.textContent = "Error fetching meals.";
      console.error("Error:", error);
    }
  };

  // Call the async function to fetch meals
  fetchMeals();
});
