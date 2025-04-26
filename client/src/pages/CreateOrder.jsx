import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateOrder = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch all restaurants on component mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5030/order/restaurants', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(response.data,'hellooooo');
        setRestaurants(response.data);
      } catch (err) {
        setError('Failed to fetch restaurants');
        console.error(err);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch menu items when a restaurant is selected
  useEffect(() => {
    if (!selectedRestaurant) return;

    const fetchMenuItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5030/order/restaurant/${selectedRestaurant}/menu`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMenuItems(response.data);
        console.log(response.data,'menu items');    
      } catch (err) {
        setError('Failed to fetch menu items');
        console.error(err);
      }
    };

    fetchMenuItems();
  }, [selectedRestaurant]);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem._id === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(item => item._id === itemId);
    
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item._id !== itemId));
    } else {
      setCart(cart.map(item => 
        item._id === itemId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const orderItems = cart.map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      await axios.post('http://localhost:5030/order/create', 
        {
          restaurantId: selectedRestaurant,
          items: orderItems
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Clear cart and navigate to orders page
      setCart([]);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Create Order</h1>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Restaurant Selection */}
        <div className="lg:col-span-1 bg-gray-900 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Select Restaurant</h2>
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
          <h2 className="text-xl font-bold mb-4">Menu Items</h2>
          
          {selectedRestaurant ? (
            menuItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map(item => (
                  <div key={item._id} className="bg-gray-900 rounded-lg p-4 flex justify-between">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
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
      
      {/* Cart */}
      <div className="mt-10 bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Your Order</h2>
        
        {cart.length > 0 ? (
          <>
            <div className="mb-6">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-center py-2 border-b border-gray-800">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-400">${item.price.toFixed(2)} x {item.quantity}</p>
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
            
            <div className="flex justify-between items-center font-bold text-lg mb-6">
              <span>Total:</span>
              <span className="text-yellow-500">${calculateTotal().toFixed(2)}</span>
            </div>
            
            <button
              onClick={placeOrder}
              disabled={loading}
              className={`w-full py-3 px-4 rounded font-medium bg-yellow-500 text-black hover:bg-yellow-600 transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </>
        ) : (
          <p className="text-gray-400">Your cart is empty. Add items from the menu to place an order.</p>
        )}
      </div>
    </div>
  );
};

export default CreateOrder;