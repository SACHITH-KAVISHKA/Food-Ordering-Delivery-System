import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../CartContext';

const CreateOrder = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useContext(CartContext);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const navigate = useNavigate();

  // Debug: Log cart on render
  useEffect(() => {
    console.log('Cart in CreateOrder:', cart);
  }, [cart]);

  // Fetch all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5030/order/restaurants', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched restaurants:', response.data); // Debug
        setRestaurants(response.data);
      } catch (err) {
        setError('Failed to fetch restaurants');
        console.error('Restaurant fetch error:', err);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch menu items for selected restaurant
  useEffect(() => {
    if (!selectedRestaurant) {
      setMenuItems([]);
      return;
    }

    const fetchMenuItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5030/order/restaurant/${selectedRestaurant}/menu`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Fetched menu items:', response.data); // Debug
        setMenuItems(response.data);
      } catch (err) {
        setError('Failed to fetch menu items');
        console.error('Menu fetch error:', err);
      }
    };

    fetchMenuItems();
  }, [selectedRestaurant]);

  const calculateTotal = () => {
    const displayedCartItems = selectedRestaurant
      ? cart.filter(item => item.restaurantId === selectedRestaurant)
      : cart;
    return displayedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(coords);
        
        // Reverse geocoding to get address
        try {
          const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=YOUR_GOOGLE_MAPS_API_KEY`
          );
          
          if (response.data.results && response.data.results.length > 0) {
            setAddress(response.data.results[0].formatted_address);
          } else {
            setAddress('Address not found');
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          setAddress('Failed to get address');
        }
        
        setLoadingLocation(false);
      },
      (error) => {
        setError(`Failed to get location: ${error.message}`);
        setLoadingLocation(false);
      }
    );
  };

  const placeOrder = async () => {
    if (cart.length === 0 || !selectedRestaurant) {
      setError('Cart is empty or no restaurant selected');
      return;
    }

    if (!location) {
      setError('Please provide your delivery location');
      return;
    }

    const orderItems = cart.filter(item => item.restaurantId === selectedRestaurant);
    if (orderItems.length === 0) {
      setError('No items from the selected restaurant in the cart');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formattedItems = orderItems.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      await axios.post('http://localhost:5030/order/create',
        {
          restaurantId: selectedRestaurant,
          items: formattedItems,
          location: {
            address: address,
            coordinates: location
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear cart
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      console.error('Order error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Display cart items, filtered by selected restaurant if set
  const displayedCartItems = selectedRestaurant
    ? cart.filter(item => item.restaurantId === selectedRestaurant)
    : cart;

  console.log('Displayed cart items:', displayedCartItems); // Debug

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="bg-yellow-500 text-black p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">FoodDelivery</h1>
          <nav className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 text-black font-medium hover:underline"
            >
              Home
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Create Order</h2>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Restaurant Selection */}
          <div className="lg:col-span-1 bg-gray-900 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Select Restaurant</h3>
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">-- Select a Restaurant --</option>
              {restaurants.map(restaurant => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">Menu Items</h3>
            {selectedRestaurant ? (
              menuItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map(item => (
                    <div key={item._id} className="bg-gray-900 rounded-lg p-4 flex justify-between">
                      <div>
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                        <p className="text-yellow-500 mt-2">${item.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-yellow-500 text-black px-3 py-1 rounded self-center hover:bg-yellow-600"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No menu items available for this restaurant.</p>
              )
            ) : (
              <p className="text-gray-400">Please select a restaurant to view menu items.</p>
            )}
          </div>
        </div>

        {/* Location Selection */}
        <div className="mt-8 bg-gray-900 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Delivery Location</h3>
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="flex-1 w-full">
              <label className="block text-gray-400 mb-2">Delivery Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="w-full px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <button
              onClick={getCurrentLocation}
              disabled={loadingLocation}
              className={`px-4 py-3 mt-4 md:mt-8 rounded bg-blue-600 text-white hover:bg-blue-700 ${loadingLocation ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loadingLocation ? 'Getting location...' : 'Use Current Location'}
            </button>
          </div>
          {location && (
            <div className="mt-4">
              <p className="text-green-500">✓ Location captured</p>
              <p className="text-sm text-gray-400">Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}</p>
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="mt-10 bg-gray-900 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Your Order</h3>
          {cart.length > 0 ? (
            <>
              {displayedCartItems.length === 0 && selectedRestaurant ? (
                <p className="text-yellow-500 mb-4">
                  No items in the cart match the selected restaurant. Please add items from this restaurant or change the selection.
                </p>
              ) : (
                <div className="mb-6">
                  {displayedCartItems.map(item => (
                    <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-800">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-400">${item.price.toFixed(2)} x {item.quantity}</p>
                        <p className="text-sm text-gray-400">Restaurant: {item.restaurantName}</p>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="bg-gray-800 text-white px-3 py-1 rounded mr-2 hover:bg-gray-700"
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-gray-800 text-white px-3 py-1 rounded ml-2 hover:bg-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-lg mb-6">
                <span>Total:</span>
                <span className="text-yellow-500">${calculateTotal().toFixed(2)}</span>
              </div>
              <button
                onClick={placeOrder}
                disabled={loading || displayedCartItems.length === 0 || !location}
                className={`w-full py-3 px-4 rounded font-medium bg-yellow-500 text-black hover:bg-yellow-600 transition duration-200 ${loading || displayedCartItems.length === 0 || !location ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              {!location && displayedCartItems.length > 0 && (
                <p className="text-yellow-500 text-sm mt-2">Please provide your delivery location to place the order.</p>
              )}
            </>
          ) : (
            <p className="text-gray-400">Your cart is empty. Add items from the menu to place an order.</p>
          )}
        </div>
      </main>

      <footer className="bg-gray-900 text-white text-center py-4">
        <p>© {new Date().getFullYear()} Eatzaa. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CreateOrder;