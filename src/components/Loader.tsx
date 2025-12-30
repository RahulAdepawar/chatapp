import '@/assets/css/loader.css';
import { useEffect } from 'react';

const FullScreenLoader = () => {

    useEffect(() => {
        console.log("Loader");
    }, [])
  return (
    <div className="overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default FullScreenLoader;

