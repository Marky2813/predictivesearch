import { useState, type ReactNode } from 'react'
import axios from 'axios';
import AddressInput from './AddressInput';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string | ReactNode;
}

type InputMode = 'chat' | 'address';

type AddressSuggestion = {
  id: string;
  label: string;
}

type AddressMetadata = {
  full_address?: string;
  address_line_1?: string;
  address_line_2?: string;
  locality_name?: string;
  state_territory?: string;
  postcode?: string;
  latitude?: string;
  longitude?: string;
  gnaf_id?: string;
  dpid?: string;
}

function AddressDetailsCard({ address }: { address: AddressMetadata }) {
  return (
    <div className="min-w-[260px] max-w-sm">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-400">Verified address</p>
        <p className="mt-1 text-base font-semibold text-slate-800">{address.full_address}</p>
      </div>
      <div className="grid gap-2 text-sm">
        <div className="rounded-2xl bg-slate-50 px-3 py-2">
          <span className="text-slate-400">Suburb</span>
          <p className="font-medium text-slate-700">{address.locality_name || "Not available"}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <span className="text-slate-400">State</span>
            <p className="font-medium text-slate-700">{address.state_territory || "N/A"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <span className="text-slate-400">Postcode</span>
            <p className="font-medium text-slate-700">{address.postcode || "N/A"}</p>
          </div>
        </div>
        {(address.latitude || address.longitude) && (
          <div className="rounded-2xl bg-indigo-50 px-3 py-2 text-indigo-700">
            <span className="text-indigo-400">Coordinates</span>
            <p className="font-medium">{address.latitude}, {address.longitude}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Chat() {
  const [input, setInput] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>("chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! How can I help you?"
    }
  ]);
  function sendMessage() {
    //the message needs to be appended in a messages array. 
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: input
      }
    ])
    setInput('');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Please enter your address."
        }
      ]);
      setInputMode('address')
    }, 2000);
  }

  async function selectAddress(address: AddressSuggestion) {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: address.label
      }
    ])
    setInputMode('chat')

    try {
      const res = await axios.get("http://localhost:3000/api/address/metadata", {
        params: { id: address.id }
      });
      const metadata = res.data.address;
      const displayedFields = ["full_address", "locality_name", "state_territory", "postcode", "latitude", "longitude"];
      const hiddenFields = Object.fromEntries(
        Object.entries(metadata).filter(([key]) => !displayedFields.includes(key))
      );

      console.log("Address metadata response:", metadata);
      console.log("Address metadata fields not displayed:", hiddenFields);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: <AddressDetailsCard address={metadata} />
        }
      ])
    } catch (error) {
      console.error("Unable to fetch address metadata:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: "I found the address, but couldn't load the extra details."
        }
      ])
    }
  }

  return (
    <>
      <div className="chat flex w-full max-w-3xl flex-col items-center">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 h-16 w-16 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff_0,#dbeafe_28%,#a5b4fc_58%,#818cf8_100%)] shadow-[0_0_42px_rgba(129,140,248,0.35)]" />
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900">
            Good Morning
            <br />
            How Can I <span className="text-indigo-500">Assist You Today?</span>
          </h1>
        </div>

        <div className="flex h-[520px] w-full flex-col rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_24px_80px_rgba(148,163,184,0.20)] backdrop-blur">
          <div className="chat-box message-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl bg-gradient-to-br from-white via-white to-indigo-50/30">
            <div className='space-y-4 p-5'>
              {messages.map((message) => {
                return (
                  <div
                    key={message.id}
                    className={`
                flex  ${message.role === "user" ? "justify-end" : "justify-start"}`} >
                    <div className={`
                      max-w-[72%]
                      my-2
                      px-4
                      py-3
                      text-sm
                      leading-relaxed
                      shadow-sm
                      ${message.role === "user" ? "rounded-[1.35rem] rounded-br-md bg-indigo-500 text-white shadow-indigo-200/80" : "rounded-[1.35rem] rounded-bl-md border border-slate-100 bg-white text-slate-600 shadow-slate-200/70"}
                    `}>{message.content}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            {inputMode === 'chat' ?
              <div  className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  className="chat-input min-h-11 flex-1 rounded-2xl border border-transparent bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  placeholder="Initiate a query or send a command to the AI..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100" onClick={() => sendMessage()}>Send</button>
              </div> :
              <AddressInput onSelectAddress={selectAddress} />
            }

          </div>
        </div>
      </div>
    </>
  )
}

export default Chat;