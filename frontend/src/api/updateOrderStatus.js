const API_BASE_URL = "http://localhost/DutyDinarRepo/backend/api";

export async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/update_order_status.php`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_id: orderId, status }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, message: "Network error" };
  }
}
