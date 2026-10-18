import { useCallback, useEffect, useState } from "react";

// Day or night. Follows the local clock (night from 7pm to 6am) until the
// traveller picks one, then remembers their choice.
const KEY = "purr-inn:theme";

function autoTheme() {
  const h = new Date().getHours();
  return h >= 19 || h < 6 ? "night" : "day";
}

function stored() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => stored() || autoTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "night" ? "#2c3065" : "#e4e8f6");
  }, [theme]);

  const toggle = useCallback(() => {
    const next = theme === "night" ? "day" : "night";
    setTheme(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage disabled: the choice just won't be remembered.
    }
  }, [theme]);

  return [theme, toggle];
}
