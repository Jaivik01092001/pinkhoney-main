// components/RelationshipIntentModal.js
"use client"
import { useRouter } from 'next/navigation'


export default function RelationshipIntentModal({ isOpen, onClose }) {
  const router = useRouter()

  const handle_next_click = () => {
    router.push(`/home`)
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
        onClick={onClose}
      />
      <div className={`fixed inset-x-0 bottom-0 transform transition-transform duration-300 ease-in-out z-50 
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-black-color text-white rounded-t-3xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="grid place-items-center">
              <h3 className="text-xl font-bold">What are you looking for?</h3>
              <p className="text-center my-2">All good if it changes. There’s something for everyone.</p>
            </div>
            <button onClick={onClose} className="text-2xl">
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {['Companionship', 'Emotional Support', 'Fun Conversations'].map((intent) => (
              <button
                key={intent}
                className="w-full py-3 px-4 border text-lg text-center border-gray-300 rounded-lg hover:border-pink-500 hover:bg-pink-100 hover:text-purple-900 text-white"
              >
                {intent}
              </button>
            ))}
          </div>

          <button onClick={handle_next_click}
        className="w-full bg-pink-500 text-white rounded-full py-3 px-6 font-medium hover:bg-pink-600 transition-colors"
      >
        Next
      </button>
        </div>
      </div>
    </>
  );
}