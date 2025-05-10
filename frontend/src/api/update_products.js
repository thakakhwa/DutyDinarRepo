import { API_BASE_URL } from './apiConfig';

export const updateProduct = async (productData) => {
  try {
    console.log("Sending product update request with data:", productData);
    
    const response = await fetch(`${API_BASE_URL}/update_products.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(productData),
    });
    
    console.log("Update product response status:", response.status);
    
    // Check if response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      
      try {
        // Try to parse the error as JSON
        const errorJson = JSON.parse(errorText);
        return errorJson; // If it's valid JSON, return it
      } catch (parseError) {
        // If it's not valid JSON, return a generic error
        return { 
          success: false, 
          message: `Server error (${response.status}): ${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}` 
        };
      }
    }
    
    // For successful responses, try to parse JSON
    try {
      const result = await response.json();
      console.log("Update product result:", result);
      return result;
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      return { 
        success: false, 
        message: 'Invalid response from server: ' + jsonError.message 
      };
    }
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return { 
      success: false, 
      message: 'Network error: ' + error.message 
    };
  }
};
