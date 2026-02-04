"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, MapPin, X, Gift, Loader2, Plus, ChevronLeft, Calendar, Crosshair, Trash2 } from "lucide-react";
import axios from "axios"; 

export default function RedeemAction({ goal, addresses, setAddresses }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(addresses?.[0]?.id || "");
  const [selectedDate, setSelectedDate] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track which item is deleting
  
  // New States for Adding Address
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false); 
  
  const [formData, setFormData] = useState({
    name: "", street: "", city: "", state: "", zip: "", country: "Pakistan", phone: "",
    latitude: null, longitude: null 
  });

  if (goal.delivery) {
    return (
      <button
        onClick={() => router.push(`/tracking/${goal.delivery.id}`)}
        className="flex-1 sm:flex-none px-6 py-3 rounded-lg font-bold text-white shadow-md bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        <Truck className="w-5 h-5" /> Track Order
      </button>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ 1. GPS Function
  const handleUseGPS = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = res.data.address;
                
                setFormData(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                    street: data.road || data.suburb || prev.street,
                    city: data.city || data.town || prev.city,
                    state: data.state || prev.state,
                    zip: data.postcode || prev.zip,
                    country: data.country || prev.country
                }));
            } catch (e) {
                setFormData(prev => ({ ...prev, latitude, longitude }));
            } finally {
                setLoadingLocation(false);
            }
        },
        () => {
            alert("Location permission denied");
            setLoadingLocation(false);
        }
    );
  };

  // ✅ 2. Save Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let finalData = { ...formData };

    if (!finalData.latitude) {
        try {
            const query = `${finalData.street}, ${finalData.city}, ${finalData.state}, ${finalData.country}`;
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            if (res.data && res.data.length > 0) {
                finalData.latitude = parseFloat(res.data[0].lat);
                finalData.longitude = parseFloat(res.data[0].lon);
            }
        } catch (error) {
            console.warn("Auto-geocode failed");
        }
    }

    try {
      const res = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: finalData }) 
      });
      const data = await res.json();
      
      if (data.success) {
        const newAddr = data.newAddress || data.address; 
        const updatedList = [newAddr, ...(addresses || [])];
        
        setAddresses(updatedList);
        setSelectedAddress(newAddr.id);
        setIsAddingNew(false);
        setFormData({ name: "", street: "", city: "", state: "", zip: "", country: "Pakistan", phone: "", latitude: null, longitude: null });
      } else {
        alert(data.error || "Failed to save address");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3. Delete Address Function
  const handleDeleteAddress = async (e, id) => {
    e.stopPropagation(); // Stop click from selecting the address
    if (!confirm("Are you sure you want to delete this address?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/address/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        // Remove from local state
        const updatedList = addresses.filter(addr => addr.id !== id);
        setAddresses(updatedList);
        
        // If deleted address was selected, unselect it or select the first available
        if (selectedAddress === id) {
            setSelectedAddress(updatedList.length > 0 ? updatedList[0].id : "");
        }
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting address");
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ 4. Redeem Function
  const handleRedeem = async () => {
    if (!selectedAddress) return alert("Please select an address");
    if (!selectedDate) return alert("Please select a preferred delivery date");

    setLoading(true);

    try {
      const res = await fetch(`/api/goals/${goal.id}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            addressId: selectedAddress,
            deliveryDate: selectedDate 
        }),
      });

      const data = await res.json();
      
      if (data.success && data.deliveryId) {
        router.push(`/tracking/${data.deliveryId}`);
      } else {
        alert(data.error || "Redemption failed");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex-1 sm:flex-none px-6 py-3 rounded-lg font-bold text-white shadow-md bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2"
      >
        <Gift className="w-5 h-5" /> Redeem Product
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b flex justify-between items-center bg-gray-50 shrink-0">
              {isAddingNew ? (
                 <button onClick={() => setIsAddingNew(false)} className="flex items-center text-sm text-gray-500 hover:text-indigo-600">
                    <ChevronLeft size={16} /> Back
                 </button>
              ) : (
                 <h3 className="font-bold text-lg text-gray-800">Confirm Redemption Details</h3>
              )}
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
            </div>

            <div className="p-5 overflow-y-auto">
              {isAddingNew ? (
                /* ADD ADDRESS FORM */
                <form id="address-form" onSubmit={handleSaveAddress} className="space-y-3">
                  <h3 className="font-bold text-gray-900 mb-2">New Address Details</h3>
                  
                  <button 
                    type="button" 
                    onClick={handleUseGPS}
                    disabled={loadingLocation}
                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center gap-2 text-sm font-bold hover:bg-blue-100 mb-2"
                  >
                    {loadingLocation ? <Loader2 className="animate-spin w-4 h-4"/> : <Crosshair className="w-4 h-4" />}
                    {loadingLocation ? "Locating..." : "Use Current Location"}
                  </button>

                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Full Name" />
                  <input required name="street" value={formData.street} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Street Address" />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="City" />
                    <input required name="state" value={formData.state} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="State/Province" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input required name="zip" value={formData.zip} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Zip Code" />
                    <input required name="country" value={formData.country} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Country" />
                  </div>

                  <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-2 border rounded" placeholder="Phone" />
                  
                  <div className="text-xs flex items-center gap-1">
                     <MapPin size={12} className={formData.latitude ? "text-green-600" : "text-gray-400"}/>
                     {formData.latitude ? <span className="text-green-600">GPS Coordinates set</span> : <span className="text-gray-400">Coords auto-detected on save</span>}
                  </div>
                </form>
              ) : (
                /* SELECTION VIEW */
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar size={16} className="text-indigo-600"/> Preferred Delivery Date
                    </h4>
                    <input 
                      type="date" 
                      min={minDate}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 outline-none text-gray-700 font-medium"
                    />
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} className="text-indigo-600"/> Shipping Address
                    </h4>
                    
                    {/* SCROLLABLE LIST OF ADDRESSES */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {addresses?.length > 0 ? addresses.map((addr) => (
                        <div key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                            className={`group cursor-pointer border-2 rounded-lg p-3 flex gap-3 items-start transition-all ${selectedAddress === addr.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                            
                            {/* Icon */}
                            <div className={`mt-1 p-1 rounded-full shrink-0 ${selectedAddress === addr.id ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                                <MapPin size={14} />
                            </div>
                            
                            {/* Details */}
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm">{addr.name}</p>
                                <p className="text-xs text-gray-500">{addr.street}, {addr.city}</p>
                                <p className="text-xs text-gray-400">{addr.phone}</p>
                            </div>

                            {/* Delete Button (Only shows on hover or if selected) */}
                            <button 
                                onClick={(e) => handleDeleteAddress(e, addr.id)}
                                disabled={deletingId === addr.id}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                title="Delete Address"
                            >
                                {deletingId === addr.id ? <Loader2 size={16} className="animate-spin text-red-600"/> : <Trash2 size={16} />}
                            </button>
                        </div>
                        )) : <div className="text-center py-6 text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">No addresses found</div>}
                    </div>

                    <button onClick={() => setIsAddingNew(true)} className="mt-3 w-full py-2 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 flex items-center justify-center gap-2">
                        <Plus size={16} /> Add New Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t bg-gray-50 flex gap-3 shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-200">Cancel</button>
              {isAddingNew ? (
                 <button type="submit" form="address-form" disabled={loading} className="flex-[2] py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700">
                   {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Address"}
                 </button>
              ) : (
                 <button onClick={handleRedeem} disabled={loading || !addresses?.length || !selectedDate} className="flex-[2] py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-400 flex justify-center items-center gap-2">
                   {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm Redemption"}
                 </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}