import React, { useState } from 'react';

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    city: '',
    number: '',
    street: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.street.trim()) newErrors.street = 'Street is required';

    if (!formData.number.trim()) {
      newErrors.number = 'Phone number is required';
    } else {
      // Validate phone number starts with +962 and has 10 digits after
      const phoneRegex = /^\+962\d{10}$/;
      if (!phoneRegex.test(formData.number)) {
        newErrors.number = 'Phone number must start with +962 and have 10 digits after';
      }
    }

    if (!paymentMethod) newErrors.paymentMethod = 'Please select a payment method';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Submit form or proceed with payment
      alert('Form submitted successfully!');
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
            <label className="block mb-1 font-medium text-gray-700" htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
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
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700" htmlFor="number">Phone Number</label>
            <input
              type="text"
              id="number"
              name="number"
              placeholder="+962xxxxxxxxx"
              value={formData.number}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
            />
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
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
