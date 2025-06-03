import { useState, useEffect } from "react";
import parse from "html-react-parser";

export default function useRenderRichText({ text }: { text: string }) {
  const [parsedHTML, setParsed] = useState<String | React.JSX.Element | React.JSX.Element[]>("");

  useEffect(() => {
    if (!text) return;
    const parsed = parse(text);
    setParsed(parsed);
  }, [text]);
  return parsedHTML;
}
