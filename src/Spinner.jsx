import { createPortal } from "react-dom";

function Spinner() {
  return createPortal(
    <div className="spinner">
      <span>در حال بارگذاری...</span>
    </div>,
    document.body
  );
}

export default Spinner;
