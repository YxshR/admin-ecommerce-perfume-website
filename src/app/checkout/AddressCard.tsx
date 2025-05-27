'use client';

import { FiEdit2 } from 'react-icons/fi';

interface Address {
  addressId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  isSelected: boolean;
  onSelect: (addressId: string) => void;
  onEdit: (address: Address) => void;
}

export default function AddressCard({
  address,
  isSelected,
  onSelect,
  onEdit
}: AddressCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer ${
        isSelected ? 'border-blue-500' : 'border-gray-300'
      }`}
      onClick={() => onSelect(address.addressId)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <input
            type="radio"
            checked={isSelected}
            onChange={() => onSelect(address.addressId)}
            className="mt-1 mr-3"
          />
          <div>
            <h3 className="font-medium">{address.fullName}</h3>
            <p className="text-sm text-gray-700 mt-1">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
              <br />
              {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-sm text-gray-700 mt-1">Phone: {address.phone}</p>
            {address.isDefault && (
              <span className="text-xs text-green-600 mt-2 inline-block">
                Default Address
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(address);
          }}
          className="text-blue-600 hover:text-blue-800"
        >
          <FiEdit2 size={16} />
        </button>
      </div>
    </div>
  );
} 