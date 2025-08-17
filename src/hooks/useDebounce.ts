import { useEffect } from "react";
import { debounce } from "../tools/debouncer";

export const useDebounce = (
  callback: () => void,
  delay: number,
  dependencies: any[],
) => {
  const debouncedCallback = debounce(() => {
    callback();
  }, delay);
  useEffect(() => {
    debouncedCallback();
  }, dependencies);

  return {
    debouncedCallback,
  };
};
