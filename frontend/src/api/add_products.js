export const addProduct = async (productData) => {
    try {
      const response = await fetch('/api/add_product.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };
  
  export const getCategories = async () => {
    try {
      const response = await fetch('/api/get_categories.php');
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };