import React, { useState } from 'react';
import './OverlayLoadingAnimation.css'; // Import the CSS file for styling

const OverlayLoadingAnimation = ( timeOut=3000, data) => {
    const [loading, setLoading] = useState(true);

    // Simulate loading for 3 seconds (adjust as needed)
    setTimeout(() => {
        setLoading(timeOut);
    }, 3000);

    return (
        <div className="overlay-container">
            {loading && (
                <div className="overlay">
                    <div className="loader"></div>
                </div>
            )}
            {/*data*/}
        </div>
    );
};

export default OverlayLoadingAnimation;
