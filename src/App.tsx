import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate 
} from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search, 
  Store, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { cn, formatCurrency } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

// --- Components ---

const Navbar = ({ user, userData, cartCount }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: 'customer',
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-900 rounded-lg flex items-center justify-center">
              <span className="text-amber-500 font-bold text-xl">F2F</span>
            </div>
            <span className="text-2xl font-serif font-bold text-emerald-950 hidden sm:block">Farm2Feast</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-stone-600 hover:text-emerald-900 font-medium transition-colors">Marketplace</Link>
            <Link to="/about" className="text-stone-600 hover:text-emerald-900 font-medium transition-colors">Our Story</Link>
            {userData?.role === 'vendor' && (
              <Link to="/vendor" className="text-stone-600 hover:text-emerald-900 font-medium transition-colors">Vendor Portal</Link>
            )}
            {userData?.role === 'admin' && (
              <Link to="/admin" className="text-stone-600 hover:text-emerald-900 font-medium transition-colors flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1" /> Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-stone-600 hover:text-emerald-900 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => signOut(auth)}
                  className="p-2 text-stone-600 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-100">
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Profile" referrerPolicy="no-referrer" />
                </div>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-emerald-900 text-white px-6 py-2.5 rounded-full font-medium hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20"
              >
                Sign In
              </button>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-stone-600">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-stone-200 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <Link to="/products" className="block text-lg font-medium text-stone-800" onClick={() => setIsMenuOpen(false)}>Marketplace</Link>
              <Link to="/about" className="block text-lg font-medium text-stone-800" onClick={() => setIsMenuOpen(false)}>Our Story</Link>
              {userData?.role === 'vendor' && (
                <Link to="/vendor" className="block text-lg font-medium text-stone-800" onClick={() => setIsMenuOpen(false)}>Vendor Portal</Link>
              )}
              {userData?.role === 'admin' && (
                <Link to="/admin" className="block text-lg font-medium text-stone-800" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const Home = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden bg-stone-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
            alt="African Market" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-500 rounded-full text-sm font-bold tracking-wider uppercase mb-6">
              Pure African Staples
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
              From the Soil of <span className="text-amber-500 italic">Africa</span> to Your Table
            </h1>
            <p className="text-xl text-stone-300 mb-10 leading-relaxed">
              Experience the authentic taste of home. We bridge the gap between local farmers and your kitchen, delivering premium staples with pride.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-500 transition-all flex items-center justify-center group">
                Shop Marketplace <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all text-center">
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="bg-stone-50 p-10 rounded-3xl border border-stone-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Truck className="text-emerald-900 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-emerald-950 mb-4">Fast Delivery</h3>
            <p className="text-stone-600 leading-relaxed">Reliable shipping across the continent and beyond. Your staples arrive fresh within 4-7 days.</p>
          </div>
          <div className="bg-stone-50 p-10 rounded-3xl border border-stone-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-amber-700 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-emerald-950 mb-4">Secure Payments</h3>
            <p className="text-stone-600 leading-relaxed">Global payment processing with multi-currency support. Your transactions are always protected.</p>
          </div>
          <div className="bg-stone-50 p-10 rounded-3xl border border-stone-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
              <Store className="text-red-800 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-emerald-950 mb-4">Multi-Vendor</h3>
            <p className="text-stone-600 leading-relaxed">Supporting local farmers and small businesses. A diverse marketplace of authentic African products.</p>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="bg-emerald-950 py-24 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1590779033100-9f60705a2f3b?auto=format&fit=crop&q=80&w=1000" 
                  alt="African Farmer" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-amber-500 rounded-3xl flex items-center justify-center p-8 rotate-12 shadow-2xl">
                <p className="text-emerald-950 font-serif font-bold text-xl text-center leading-tight">
                  Pure African Staples
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                Farm2Feast Africa – Pure African staples, delivered with pride.
              </h2>
              <p className="text-stone-300 text-lg leading-relaxed">
                Our journey began with a simple observation: the incredible richness of African food staples often struggles to reach those who crave them most, especially in the diaspora and growing urban centers.
              </p>
              <Link to="/about" className="inline-flex items-center text-amber-500 font-bold text-lg hover:text-amber-400 transition-colors">
                Read Our Full Story <ChevronRight className="ml-1 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const About = () => {
  const content = `
# Farm2Feast Africa – Pure African staples, delivered with pride.

Our journey began with a simple observation: the incredible richness of African food staples often struggles to reach those who crave them most, especially in the diaspora and growing urban centers. We saw farmers with exceptional harvests of yam, cassava, grains, and spices, yet limited by logistics and market access.

Farm2Feast Africa was born to bridge this gap. We are more than just an e-commerce platform; we are a cultural bridge. We partner with local vendors and farmers across the continent to bring you the authentic taste of home, ensuring that quality and tradition are never compromised.

### Our Mission
To empower African producers by providing a global marketplace while delivering the highest quality food staples to families worldwide.

### Our Values
- **Authenticity:** We only source genuine African staples.
- **Pride:** We take pride in our heritage and the products we deliver.
- **Community:** We grow when our vendors and customers grow.
- **Reliability:** 4-7 day delivery you can count on.
  `;

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="prose prose-lg prose-emerald mx-auto">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

const Products = ({ addToCart }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be a Firestore listener
    // For demo, we'll use some mock data if collection is empty
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (prods.length === 0) {
        setProducts([
          { id: '1', name: 'Premium Pounded Yam Flour', price: 25000, category: 'Flour', imageUrl: 'https://images.unsplash.com/photo-1589187151003-0dd3013b21ff?auto=format&fit=crop&q=80&w=500', unit: '5kg' },
          { id: '2', name: 'Aged Brown Beans', price: 18000, category: 'Grains', imageUrl: 'https://images.unsplash.com/photo-1551462147-37885acc3c41?auto=format&fit=crop&q=80&w=500', unit: '10kg' },
          { id: '3', name: 'Pure Red Palm Oil', price: 12000, category: 'Oil', imageUrl: 'https://images.unsplash.com/photo-1621460245192-58897092996d?auto=format&fit=crop&q=80&w=500', unit: '5L' },
          { id: '4', name: 'Smoked Catfish', price: 35000, category: 'Protein', imageUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=500', unit: 'Box' },
        ]);
      } else {
        setProducts(prods);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-900"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-emerald-950 mb-2">African Marketplace</h1>
          <p className="text-stone-600">Browse authentic staples from verified vendors.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-3xl border border-stone-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
          >
            <div className="aspect-[4/5] overflow-hidden relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-emerald-950 line-clamp-1">{product.name}</h3>
                <span className="text-stone-400 text-sm">{product.unit}</span>
              </div>
              <p className="text-2xl font-serif font-bold text-emerald-800 mb-6">{formatCurrency(product.price)}</p>
              <button 
                onClick={() => addToCart(product)}
                className="w-full bg-stone-900 text-white py-3 rounded-2xl font-bold hover:bg-emerald-900 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Cart = ({ cart, removeFromCart, updateQuantity }: any) => {
  const navigate = useNavigate();
  const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const transportCost = total > 0 ? 5000 : 0; // Flat transport for demo
  const finalTotal = total + transportCost;
  const minOrder = 20000;

  const handleCheckout = async () => {
    if (total < minOrder) return;
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerEmail: auth.currentUser?.email,
          orderId: `ORD-${Date.now()}`
        })
      });
      const session = await response.json();
      // In a real app, you'd redirect to Stripe
      // window.location.href = session.url;
      alert("Redirecting to Stripe... (Demo: Payment flow simulated)");
    } catch (error) {
      console.error("Checkout failed", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-emerald-950 mb-12">Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
          <ShoppingCart className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-xl text-stone-500 mb-8">Your cart is empty.</p>
          <Link to="/products" className="bg-emerald-900 text-white px-8 py-3 rounded-full font-bold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item: any) => (
              <div key={item.id} className="flex items-center space-x-6 bg-white p-6 rounded-3xl border border-stone-100">
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-emerald-950">{item.name}</h3>
                  <p className="text-emerald-800 font-serif font-bold">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 hover:bg-stone-100">-</button>
                    <span className="px-3 py-1 font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 hover:bg-stone-100">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-stone-900 text-white p-10 rounded-3xl h-fit sticky top-32">
            <h2 className="text-2xl font-serif font-bold mb-8">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Transport</span>
                <span>{formatCurrency(transportCost)}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-amber-500">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {total < minOrder && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-6">
                <p className="text-amber-500 text-sm font-medium">
                  Minimum order is {formatCurrency(minOrder)}. Please add {formatCurrency(minOrder - total)} more.
                </p>
              </div>
            )}

            <button 
              disabled={total < minOrder}
              onClick={handleCheckout}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-lg transition-all",
                total >= minOrder 
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/20" 
                  : "bg-stone-800 text-stone-500 cursor-not-allowed"
              )}
            >
              Checkout Now
            </button>
            <p className="text-center text-stone-500 text-xs mt-6">
              Delivery takes 4-7 business days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const calculateStats = (order: any) => {
    const remaining = order.totalAmount - order.transportCost;
    const commission = remaining * 0.20;
    const payout = remaining - commission;
    return { commission, payout };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-emerald-950 mb-12">Admin Command Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-emerald-900 text-white p-8 rounded-3xl">
          <p className="text-emerald-300 text-sm font-bold uppercase tracking-wider mb-2">Total Revenue</p>
          <p className="text-4xl font-serif font-bold">{formatCurrency(orders.reduce((s, o) => s + o.totalAmount, 0))}</p>
        </div>
        <div className="bg-amber-500 text-emerald-950 p-8 rounded-3xl">
          <p className="text-emerald-900/60 text-sm font-bold uppercase tracking-wider mb-2">Total Commission (20%)</p>
          <p className="text-4xl font-serif font-bold">
            {formatCurrency(orders.reduce((s, o) => s + calculateStats(o).commission, 0))}
          </p>
        </div>
        <div className="bg-white border border-stone-200 p-8 rounded-3xl">
          <p className="text-stone-400 text-sm font-bold uppercase tracking-wider mb-2">Total Orders</p>
          <p className="text-4xl font-serif font-bold text-emerald-950">{orders.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50">
          <h2 className="text-xl font-bold text-emerald-950">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-stone-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Commission</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map(order => {
                const { commission } = calculateStats(order);
                return (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{order.id}</td>
                    <td className="px-6 py-4">{order.customerPhone || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-6 py-4 text-amber-600">{formatCurrency(commission)}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const VendorDashboard = ({ user }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('vendorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user.uid]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif font-bold text-emerald-950 mb-2">Vendor Portal</h1>
          <p className="text-stone-600">Manage your products and track your sales.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-emerald-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-800 transition-all flex items-center"
        >
          <Package className="w-5 h-5 mr-2" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" referrerPolicy="no-referrer" />
            <div className="p-6">
              <h3 className="font-bold text-emerald-950 mb-2">{product.name}</h3>
              <p className="text-emerald-800 font-serif font-bold mb-4">{formatCurrency(product.price)}</p>
              <div className="flex justify-between text-sm text-stone-400">
                <span>Stock: {product.stock}</span>
                <span>Unit: {product.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
        <Navbar user={user} userData={userData} cartCount={cart.reduce((s, i) => s + i.quantity, 0)} />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products addToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} />} />
            <Route path="/vendor" element={<VendorDashboard user={user} />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <footer className="bg-stone-950 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-emerald-900 rounded-lg flex items-center justify-center">
                    <span className="text-amber-500 font-bold text-xl">F2F</span>
                  </div>
                  <span className="text-2xl font-serif font-bold">Farm2Feast</span>
                </div>
                <p className="text-stone-400 max-w-md leading-relaxed">
                  Pure African staples, delivered with pride. We connect you to the heart of African agriculture, ensuring quality and authenticity in every package.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-amber-500 uppercase tracking-widest text-sm">Quick Links</h4>
                <ul className="space-y-4 text-stone-400">
                  <li><Link to="/products" className="hover:text-white transition-colors">Marketplace</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">Our Story</Link></li>
                  <li><Link to="/vendor" className="hover:text-white transition-colors">Sell on F2F</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-amber-500 uppercase tracking-widest text-sm">Support</h4>
                <ul className="space-y-4 text-stone-400">
                  <li><a href="#" className="hover:text-white transition-colors">Shipping Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-stone-500 text-sm">
              <p>&copy; 2026 Farm2Feast Africa. All rights reserved.</p>
              <div className="flex space-x-6">
                <CreditCard className="w-6 h-6" />
                <Package className="w-6 h-6" />
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
