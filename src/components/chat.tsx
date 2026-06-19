import { useState } from 'react'
import AddressInput from './AddressInput';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type InputMode = 'chat' | 'address';

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
              <AddressInput />
            }

          </div>
        </div>
      </div>
    </>
  )
}

export default Chat;