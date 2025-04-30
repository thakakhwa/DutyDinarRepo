import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51RJbVDQmRraBhPiiiaNOYDXbnq03gesKd08368EkbvBrxeJwYEqSolsMYOVd5Xj1qcaM7b0d2h0WY8hpTGXhW4hj00Qxh0qP3B');

const jordanianCities = [
  "Amman",
  "Zarqa",
  "Irbid",
  "Russeifa",
  "Aqaba",
  "Madaba",
  "Jerash",
  "Mafraq",
  "Karak",
  "Ajloun",
  "Salt",
  "Tafilah",
  "Ma'an",
  "Balqa",
  "Maan",
];

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  // Placeholder cartItems array for testing
  const cartItems = [
    {
      product_id: 1,
      event_id: null,
      quantity: 2,
      price: 50,
    },
    {
      product_id: 2,
      event_id: null,
      quantity: 1,
      price: 30,
    },
  ];

  const [paymentMethod, setPaymentMethod] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    country: 'Jordan',
    email: '',
    city: '',
    number: '',
    street: '',
  });
  const [errors, setErrors] = useState({});
  const [cardError, setCardError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (/\d/.test(formData.name)) {
      newErrors.name = 'Name cannot contain numbers';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const allowedMailboxes = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      } else {
        const domain = formData.email.split('@')[1].toLowerCase();
        if (!allowedMailboxes.includes(domain)) {
          newErrors.email = 'Email must be from a common mailbox (gmail, yahoo, hotmail, outlook, icloud)';
        }
      }
    }

    if (!formData.city) {
      newErrors.city = 'City is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street is required';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Phone number is required';
    } else {
      if (!/^\d{9}$/.test(formData.number)) {
        newErrors.number = 'Phone number must be exactly 9 digits';
      }
    }

    if (!paymentMethod) newErrors.paymentMethod = 'Please select a payment method';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'number') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const prepareOrderItems = () => {
    // Map cartItems to order items format expected by backend
    return cartItems.map(item => ({
      product_id: item.product_id || null,
      event_id: item.event_id || null,
      quantity: item.quantity,
      price: item.price,
    }));
  };

  const calculateTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCardError(null);

    if (!validate()) {
      return;
    }

    const orderItems = prepareOrderItems();
    if (orderItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const orderType = orderItems[0].product_id ? 'product' : 'event'; // simplistic assumption

    if (paymentMethod === 'visa') {
      if (!stripe || !elements) {
        return;
      }
      setProcessing(true);

      // Call backend to create PaymentIntent
      const response = await fetch('http://localhost/DutyDinarRepo/backend/api/create_payment_intent.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(calculateTotalAmount() * 100), // amount in cents
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        setCardError('Server error: ' + text);
        setProcessing(false);
        return;
      }

      const data = await response.json();

      if (data.error) {
        setCardError(data.error);
        setProcessing(false);
        return;
      }

      const clientSecret = data.clientSecret;
      const cardElement = elements.getElement(CardElement);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            address: {
              city: formData.city,
              country: formData.country,
              line1: formData.street,
            },
            phone: '+962' + formData.number,
          },
        },
      });

      if (result.error) {
        setCardError(result.error.message);
        setProcessing(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          setCardError(null);

          // Create order in backend with payment_method 'visa'
          const orderData = {
            order_type: orderType,
            items: orderItems,
            payment_method: 'visa',
          };

          const createOrderResponse = await fetch('http://localhost/DutyDinarRepo/backend/api/create_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(orderData),
          });
          const createOrderResult = await createOrderResponse.json();
          if (createOrderResult.success) {
            alert('Order created successfully!');
            // Optionally clear cart here
            navigate('/buyer-dashboard', { state: { refresh: true } });
          } else {
            alert('Failed to create order: ' + createOrderResult.message);
          }
          setProcessing(false);
        }
      }
    } else if (paymentMethod === 'cash') {
      setProcessing(true);

      // Create order in backend with payment_method 'cash'
      const orderData = {
        order_type: orderType,
        items: orderItems,
        payment_method: 'cash',
      };

      const createOrderResponse = await fetch('http://localhost/DutyDinarRepo/backend/api/create_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });
      const createOrderResult = await createOrderResponse.json();
      if (createOrderResult.success) {
        alert('Order created successfully!');
        // Optionally clear cart here
        navigate('/buyer-dashboard', { state: { refresh: true } });
      } else {
        alert('Failed to create order: ' + createOrderResult.message);
      }
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Checkout</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Select Payment Method</h3>
        <div className="flex space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="paymentMethod"
              value="visa"
              checked={paymentMethod === 'visa'}
              onChange={handlePaymentChange}
              className="form-radio text-green-600"
            />
            <span>VISA/Mastercard</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={handlePaymentChange}
              className="form-radio text-green-600"
            />
            <span>Cash</span>
          </label>
        </div>
        {errors.paymentMethod && (
          <p className="text-red-600 text-sm mt-1">{errors.paymentMethod}</p>
        )}
      </div>

      {paymentMethod === 'visa' && (
        <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Credit Card Information</h3>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#32325d',
                  '::placeholder': {
                    color: '#a0aec0',
                  },
                },
                invalid: {
                  color: '#fa755a',
                },
              },
            }}
          />
          {cardError && <p className="text-red-600 text-sm mt-2">{cardError}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-200 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="city">City</label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select a city</option>
              {jordanianCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="number">Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-200 text-gray-700 select-none">+962</span>
              <input
                type="text"
                id="number"
                name="number"
                placeholder="9 digits"
                value={formData.number}
                onChange={handleChange}
                maxLength="9"
                className={`w-full border rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
              />
            </div>
            {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="street">Street</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.street && <p className="text-red-600 text-sm mt-1">{errors.street}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={processing}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Submit Order'}
        </button>
      </form>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
