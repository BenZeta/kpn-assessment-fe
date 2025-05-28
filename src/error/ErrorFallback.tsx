import { useEffect } from "react";
import { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ ...props }: FallbackProps | any) {
  // Handle failed lazy loading of a JS/CSS chunk.
  useEffect(() => {
    const chunkFailedMessage = /^.*Failed\s+to\s+fetch\s+dynamically\s+imported\s+module.*$/;
    if (props.error?.message && chunkFailedMessage.test(props.error.message)) {
      console.log(props.error?.message);
      // window.location.reload();
    }
  }, [props.error]);

  return (
    <div>
      <p>Something went wrong.</p>
      <pre>{props.error?.message}</pre>
    </div>
  );
}
