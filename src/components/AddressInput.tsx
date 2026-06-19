import { useState } from "react";

function AddressInput() {
  const [query, setQuery] = useState("");
  const suggestions = [
    "12 Smith Street Sydney",
    "12 Smith Avenue Melbourne",
    "12 Smith Road Brisbane",
  ];
  return (
    <>
      <div className="relative w-full">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Address"
          className="w-full rounded-lg border px-4 py-3"
        />

        {query.length > 0 && (
          <div
            className="
              absolute bottom-full mb-2 w-full rounded-lg border bg-white shadow-lg" >
            {suggestions.map((address) => (
              <button key={address} className="w-full px-4 py-3 text-left hover:bg-blue-500">{address}</button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default AddressInput;