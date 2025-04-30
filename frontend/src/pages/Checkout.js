import React, { useState } from 'react';

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

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    country: 'Jordan',
    email: '',
    city: '',
    number: '',
    street: '',
    cardHolderName: '',
    cardNumber: '',
    cvv: '',
    expiryDate: '',
  });
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    return formatted;
  };

  const formatExpiryDate = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length < 3) return digits;
    return digits.substring(0, 2) + '/' + digits.substring(2, 4);
  };

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

    if (paymentMethod === 'visa') {
      if (!formData.cardHolderName.trim()) newErrors.cardHolderName = 'Card holder name is required';
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else {
        const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cardNumberDigits)) {
          newErrors.cardNumber = 'Card number must be 16 digits';
        }
      }
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3}$/.test(formData.cvv)) {
        newErrors.cvv = 'CVV must be exactly 3 digits';
      }
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Expiry date must be in MM/YY format';
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      const formattedValue = formatCardNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'expiryDate') {
      const formattedValue = formatExpiryDate(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else if (name === 'cvv') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 3);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else if (name === 'number') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 9);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
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

      {paymentMethod === 'visa' && (
        <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Credit Card Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700" htmlFor="cardHolderName">Card Holder Name</label>
              <input
                type="text"
                id="cardHolderName"
                name="cardHolderName"
                value={formData.cardHolderName}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cardHolderName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.cardHolderName && <p className="text-red-600 text-sm mt-1">{errors.cardHolderName}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700" htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                maxLength="19"
                value={formData.cardNumber}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="1234 5678 9012 3456"
              />
              {errors.cardNumber && <p className="text-red-600 text-sm mt-1">{errors.cardNumber}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700" htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                maxLength="3"
                value={formData.cvv}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="123"
              />
              {errors.cvv && <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>}
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700" htmlFor="expiryDate">Expiry Date (MM/YY)</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                maxLength="5"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleChange}
                className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.expiryDate && <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>}
            </div>
          </div>
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
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Submit Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
