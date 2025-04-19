import { getProducts } from './get_products';
import { getEvents } from './get_events';

// Unified search function to search products and events by query
export const searchAll = async (query) => {
  const [productsResult, eventsResult] = await Promise.all([
    getProducts(query),
    getEvents(query),
  ]);

  const products = productsResult.success ? productsResult.products : [];
  const events = eventsResult.success ? eventsResult.events : [];

  return {
    success: productsResult.success && eventsResult.success,
    products,
    events,
  };
};
