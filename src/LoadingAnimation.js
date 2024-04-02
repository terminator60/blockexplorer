import React, { useState, useEffect } from 'react';
import './LoadingAnimation.css'; // Import the CSS file for styling

const LoadingAnimation = () => {
    const [dots, setDots] = useState(''); // State to manage the number of dots in the animation

    useEffect(() => {
        const interval = setInterval(() => {
            // Update the number of dots in the animation
            setDots((prevDots) => (prevDots.length >= 3 ? '' : prevDots + '.'));
        }, 300); // Adjust the interval duration as needed

        return () => clearInterval(interval); // Cleanup the interval on component unmount
    }, []);

    return <div className="loading-animation">Loading{dots}</div>;
};

export default LoadingAnimation;
