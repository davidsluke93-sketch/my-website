// Get all saved orders from sessionStorage.
// If there are no saved orders yet, return an empty array.
function getOrders() {
  return JSON.parse(sessionStorage.getItem("orders")) || [];
}

// Save the updated orders array back into sessionStorage.
function saveOrders(orders) {
  sessionStorage.setItem("orders", JSON.stringify(orders));
}

// Generate a new order from TheMealDB API using the main ingredient entered by the user.
async function generateOrder() {
  // Get the ingredient from the input field,
  // convert it to lowercase, and replace spaces with underscores.
  const ingredient = document.getElementById("ingredient").value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  // Check if the user entered an ingredient.
  if (!ingredient) {
    document.getElementById("output").textContent = "Please enter an ingredient.";
    return;
  }

  try {
    // Fetch meals from TheMealDB API based on the ingredient entered.
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`
    );
    const data = await res.json();

    // If no meals are returned, show a suitable message.
    if (!data || !data.meals) {
      document.getElementById("output").textContent =
        "No meals found for that ingredient.";
      return;
    }

    // Select one random meal from the meals returned by the API.
    const randomMeal =
      data.meals[Math.floor(Math.random() * data.meals.length)];

    // Get existing orders and the last order number used.
    const orders = getOrders();
    const lastOrderNumber =
      Number(sessionStorage.getItem("lastOrderNumber")) || 0;

    // Create a new order object.
    const order = {
      orderNumber: lastOrderNumber + 1,
      description: randomMeal.strMeal,
      completionStatus: "incomplete"
    };

    // Add the new order to the orders array and save it.
    orders.push(order);
    saveOrders(orders);

    // Save the latest order number and last generated order separately.
    sessionStorage.setItem("lastOrderNumber", order.orderNumber);
    sessionStorage.setItem("lastGeneratedOrder", JSON.stringify(order));

    // Display the new order to the user.
    document.getElementById("output").textContent =
      `New order created:\nOrder #${order.orderNumber} - ${order.description}`;
  } catch (error) {
    // Show an error message if the API request fails.
    document.getElementById("output").textContent =
      "Problem connecting to TheMealDB API.";
  }
}

// Display all incomplete orders stored in sessionStorage.
// Show only the order number and description.
function showIncomplete() {
  const orders = getOrders().filter(
    (order) => order.completionStatus === "incomplete"
  );

  if (orders.length === 0) {
    document.getElementById("output").textContent = "No incomplete orders.";
    return;
  }

  document.getElementById("output").textContent = orders
    .map((order) => `Order #${order.orderNumber} - ${order.description}`)
    .join("\n");
}

// Display all completed orders stored in sessionStorage.
// Show only the order number and description.
function showComplete() {
  const orders = getOrders().filter(
    (order) => order.completionStatus === "complete"
  );

  if (orders.length === 0) {
    document.getElementById("output").textContent = "No completed orders.";
    return;
  }

  document.getElementById("output").textContent = orders
    .map((order) => `Order #${order.orderNumber} - ${order.description}`)
    .join("\n");
}

// Mark an incomplete order as complete using the entered order number.
function markComplete() {
  // Get the value entered by the user.
  const value = document.getElementById("orderNum").value.trim();

  // Check if the input is empty.
  if (value === "") {
    document.getElementById("output").textContent =
      "Please enter an order number.";
    return;
  }

  // Convert the input value to a number.
  const num = Number(value);

  // Check for invalid number input.
  if (isNaN(num)) {
    document.getElementById("output").textContent =
      "Please enter a valid order number.";
    return;
  }

  const orders = getOrders();

  // If the user enters 0, do not update anything.
  if (num === 0) {
    document.getElementById("output").textContent = "No order updated.";
    return;
  }

  // Find the matching incomplete order.
  const order = orders.find(
    (o) => o.orderNumber === num && o.completionStatus === "incomplete"
  );

  // If the order number does not exist among incomplete orders, show a message.
  if (!order) {
    document.getElementById("output").textContent =
      "That incomplete order number does not exist.";
    return;
  }

  // Update the order status to complete and save the changes.
  order.completionStatus = "complete";
  saveOrders(orders);

  // Also update the last generated order if it matches this order number.
  const lastOrder = JSON.parse(sessionStorage.getItem("lastGeneratedOrder"));
  if (lastOrder && lastOrder.orderNumber === num) {
    lastOrder.completionStatus = "complete";
    sessionStorage.setItem("lastGeneratedOrder", JSON.stringify(lastOrder));
  }

  // Show confirmation message.
  document.getElementById("output").textContent =
    `Order #${num} marked as complete.`;
}