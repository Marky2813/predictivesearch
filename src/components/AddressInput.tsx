import { useEffect, useState } from "react";
import axios from "axios";

type AddressSuggestion = {
  id: string;
  label: string;
}

type AddressInputProps = {
  onSelectAddress: (address: AddressSuggestion) => void;
}

function AddressInput({onSelectAddress}: AddressInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  useEffect(() => {
    if(query.trim().length == 0) {
      setSuggestions([]);
      console.log("exit")
      return
    }
    const timeout = setTimeout(async () => {
      console.log("sending")
      const res = await axios.get("http://localhost:3000/api/address/search", {params: { query }});
      setSuggestions(res.data.suggestions)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])
  // const suggestions = [
  //   "12 Smith Street Sydney",
  //   "12 Smith Avenue Melbourne",
  //   "12 Smith Road Brisbane",
  // ];
  return (
    <>
      <div className="relative mt-3 w-full">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Start typing your address..."
          className="min-h-11 w-full rounded-2xl border border-transparent bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50"
        />

        {query.length > 0 && (
          <div
            className="
              absolute bottom-full mb-3 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/80" >
            <div className="border-b border-slate-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              Suggested addresses
            </div>
            <div className="message-scroll max-h-[132px] overflow-y-auto overscroll-contain">
              {suggestions.map((address) => (
                <button key={address.id} className="block w-full px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 focus:bg-indigo-50 focus:text-indigo-600 focus:outline-none"
                onClick={() => onSelectAddress(address)}>{address.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AddressInput;