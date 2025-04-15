import { useEffect, useState } from "react";

const useCheckFocus = () => {
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isPageVisible || !isFocused) {
      console.log("User is changing tab / minimize the browser");
    }
  }, [isPageVisible, isFocused]);

  return { isPageVisible, isFocused };
};

export default useCheckFocus;
