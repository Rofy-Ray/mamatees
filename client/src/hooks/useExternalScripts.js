import { useEffect, useState } from "react";

function useExternalScripts({ url }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const head = document.querySelector("head");
    const script = document.createElement("script");

    script.setAttribute("src", url);
    script.onload = () => setLoaded(true);

    head.appendChild(script);

    return () => {
      head.removeChild(script);
    };
  }, [url]);
  return loaded;
}

export default useExternalScripts;
