import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Phone, Star } from "lucide-react";
import { addressApi } from "../../api/addressApi";
import AddressModal from "./AddressModal";
import LoadingSpinner from "../ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function AddressList() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Fetch addresses
  const { data: addresses = [], isLoading, isError } = useQuery({
    queryKey: ["userAddresses"],
    queryFn: addressApi.fetchAddresses,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: addressApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      toast.success("Address added successfully!");
      setModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to add address.");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => addressApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      toast.success("Address updated successfully!");
      setModalOpen(false);
      setEditingAddress(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to update address.");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: addressApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      toast.success("Address deleted.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to delete address.");
    },
  });

  // Set Default mutation
  const defaultMutation = useMutation({
    mutationFn: addressApi.setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      toast.success("Default address updated.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to set default address.");
    },
  });

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl font-semibold text-xs">
        Failed to load addresses. Please refresh and try again.
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> My Saved Addresses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your delivery and billing addresses.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-3 border border-blue-200">
            <MapPin className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-slate-800">No addresses saved yet</p>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Add a shipping address to speed up checkout on your future orders.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 btn-secondary text-xs"
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                addr.is_default
                  ? "bg-blue-50/50 border-blue-300 shadow-sm"
                  : "bg-slate-50/80 border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{addr.line1}</span>
                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-900 border border-amber-300">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Default
                      </span>
                    )}
                  </div>
                  {addr.line2 && <p className="text-xs text-slate-600">{addr.line2}</p>}
                  <p className="text-xs text-slate-500">
                    {addr.city}, {addr.state} {addr.zip_code}, {addr.country}
                  </p>
                  {addr.phone_number && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {addr.phone_number}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!addr.is_default && (
                    <button
                      onClick={() => defaultMutation.mutate(addr.id)}
                      disabled={defaultMutation.isPending}
                      className="px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg border border-slate-300 transition-colors"
                      title="Set as default address"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(addr)}
                    className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    title="Edit address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this address?")) {
                        deleteMutation.mutate(addr.id);
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAddress}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
