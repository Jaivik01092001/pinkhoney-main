"use client"

import React from 'react'
import { useState } from 'react'
import { useSwipeable } from 'react-swipeable';

function page() {
    const avatars = [
        { name: 'Susan', img: '/avatar.PNG' },
        { name: 'Anna', img: '/avatar2.png' },
        { name: 'Emily', img: '/avatar3.PNG' }
    ];
    const [index, setIndex] = useState(0);

    const swipeHandlers = useSwipeable({
        onSwipedRight: () => setIndex((index + 1) % avatars.length),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });


    return (

        <div {...swipeHandlers} className="bg-white rounded-lg shadow-lg p-4 m-4" style={{ width: '400px' }}>
            <img src={avatars[index].img} alt={`Avatar of ${avatars[index].name}`} className="rounded-t-lg" />
            <div className="p-4">
                <h2 className="text-lg font-bold">{avatars[index].name}</h2>
                <div className="flex justify-around mt-4">
                    <button className="bg-white text-red-500 rounded-full p-2 shadow-md">
                        <i className="fas fa-times"></i>
                    </button>
                    <button className="bg-pink-500 text-white rounded-full p-2 shadow-md">
                        <i className="fas fa-heart"></i>
                    </button>
                    <button className="bg-white text-gray-500 rounded-full p-2 shadow-md">
                        <i className="fas fa-star"></i>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default page