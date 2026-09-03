export function Loaders() {
  return (
    <div className="w-12 text-primary">
      <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="5" cy="12" r="3">
          <animate
            id="spinner_mSZa"
            begin="0;spinner_YJOP.end-0.25s"
            attributeName="cy"
            dur="0.75s"
            values="12;8;12"
          ></animate>
        </circle>
        <circle cx="12" cy="12" r="3">
          <animate
            begin="spinner_mSZa.end-0.375s"
            attributeName="cy"
            dur="0.75s"
            values="12;8;12"
          ></animate>
        </circle>
        <circle cx="19" cy="12" r="3">
          <animate
            id="spinner_YJOP"
            begin="spinner_mSZa.end-0.5s"
            attributeName="cy"
            dur="0.75s"
            values="12;8;12"
          ></animate>
        </circle>
      </svg>
    </div>
  );
}
