type Callback = (...args: any[]) => void;

const debounce = (func: Callback, delay: number): Callback => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: any[]) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func.apply(this, args);
      timeout = null;
    }, delay);
  };
};

export default debounce;