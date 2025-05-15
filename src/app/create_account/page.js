// components/FormCard.js
"use client"

import { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import RelationshipIntentModal from '../components/RelationshipIntentModal';
import { useRouter } from 'next/navigation'

export default function FormCard() {
  const router = useRouter()

  const [selectedGender, setSelectedGender] = useState('Male');
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);

  const handleGenderClick = (gender) => {
    setSelectedGender(gender);
  };

  const handle_next_click = () => {
    router.push(`/home`)
  };

  return (
    <>
      <div className="p-6 max-w-md mx-auto text-center space-y-6 pt-20">
        <div className="flex items-center justify-center gap-2 text-pink-500 font-semibold">
          {/* <div className="w-2 h-2 rounded-full bg-pink-500" /> */}
          <svg width="19" height="32" viewBox="0 0 19 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.6331 0C7.44189 12.7343 0.921753 15.3 0.921753 24.2279C0.921753 28.7073 5.3497 32 9.6331 32C14.0127 32 18.1741 28.9204 18.1741 24.6675C18.1741 16.0975 11.8975 12.7102 9.63317 0H9.6331ZM5.33968 15.9931C3.27967 21.5573 4.9636 27.3799 9.33621 29.2074C10.4549 29.6751 11.6733 29.7757 12.8653 29.6701C4.30986 33.3378 -0.82501 23.7901 5.33946 15.993L5.33968 15.9931Z" fill="#FE506B" />
          </svg>

          <span>Pink Honey</span>
        </div>

        <h1 className="text-2xl font-bold text-white">
          Create account
        </h1>

      </div>
      <div className="max-w-md mx-auto p-6 rounded-lg shadow-md space-y-6">
        {/* First Name Field */}
        <div className="space-y-2">
          <label className="block text-white font-semibold">First Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter first name"
              className="w-full border border-gray-300 bg-black-color rounded-lg px-4 py-2 focus:outline-none"
            />
            {/* <FaSearch className="absolute right-4 top-3 text-gray-400" /> */}
          </div>
        </div>

        {/* Birthday Field */}
        <div className="space-y-2">
          <label className="block text-white font-semibold">Birthday</label>
          <select className="w-full border border-gray-300 text-gray-300 bg-black-color rounded-lg px-4 py-2 pr-4 focus:outline-none">
            <option value="" disabled selected>Select year</option>
            <option value="1990">1990</option>
            <option value="1991">1991</option>
            <option value="1992">1992</option>
          </select>
        </div>

        {/* Gender Field */}
        <div className="space-y-2">
          <label className="block text-white font-semibold">Gender</label>
          <div className="flex space-x-4">
            {['Male', 'Female', 'Non-binary'].map((gender) => (
              <button
                key={gender}
                onClick={() => handleGenderClick(gender)}
                className={`px-4 py-2 rounded-full border transition-colors ${selectedGender === gender
                    ? 'bg-red-500 text-white'
                    : 'bg-black-color text-white border-gray-300'
                  }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Photos Section */}
        {/* <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Profile Photos <span className="text-gray-400">(Optional)</span></h3>
          </div>
          <p className="text-sm text-gray-500">Photos help your profile stand out.</p>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 aspect-square border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
              <FaPlus className="text-red-400 text-lg" />
            </div>

            {[...Array(5)].map((_, index) => (
              <div key={index} className="aspect-square border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
                <FaPlus className="text-red-400 text-lg" />
              </div>
            ))}
          </div>
        </div> */}

        {/* Looking For Section */}
        <div className="space-y-2">
          <label className="block text-white font-semibold">Looking for</label>
          <button
            onClick={() => setIsRelationshipModalOpen(true)}
            className="w-full border border-red-400 text-red-400 rounded-2xl py-2 flex items-center justify-center space-x-2"
          >
            <FaPlus className="text-red-400 text-sm" />
            <span className="text-sm">Add Relationship Intent</span>
          </button>
        </div>

        {/* Interests Section */}
        {/* <div className="space-y-2">
          <label className="block text-white font-semibold">Interests</label>
          <button className="w-full border border-red-400 text-red-400 rounded-2xl py-2 flex items-center justify-center space-x-2">
            <FaPlus className="text-red-400 text-sm" />
            <span className="text-sm">Add Interest</span>
          </button>
        </div> */}
      </div>

      <RelationshipIntentModal
        isOpen={isRelationshipModalOpen}
        onClose={() => setIsRelationshipModalOpen(false)}
      />
{/* 
      <button onClick={handle_next_click}
        className="w-full bg-pink-500 text-white rounded-full py-3 px-6 font-medium hover:bg-pink-600 transition-colors"
      >
        Next
      </button> */}
    </>
  );
}