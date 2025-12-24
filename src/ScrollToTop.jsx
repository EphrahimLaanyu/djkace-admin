import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "0, 0" means Top Left coordinates of the window
    window.scrollTo(0, 0);
  }, [pathname]); // This dependency array ensures it runs every time 'pathname' changes

  return null; // This component renders nothing visually
}