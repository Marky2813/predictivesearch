import { useEffect, useState, type ReactNode } from 'react'
import Anthropic from "@anthropic-ai/sdk";
import axios from 'axios';
import AddressInput from './AddressInput';

type Message = {
  role: 'user' | 'assistant';
  content: string | Anthropic.ToolResultBlockParam[];
}

type ClaudeMessage = {
  text: string, 
  type: "text" | "tool"
}

type InputMode = 'chat' | 'address';

type AddressSuggestion = {
  id: string;
  label: string;
}

type Conversation = {
  id:string,
  messages:Message[] 
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

function Chat() {
  const [input, setInput] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>("chat");
  const [currentToolId, setCurrentToolId] = useState("")
  const [conversation, setConversation] = useState<Conversation>({
        id:crypto.randomUUID(), 
        messages:[
    {
      role: "assistant",
      content: "Hi! How can I help you?"
    }
  ]
    });

  async function messageClaude(conversationarr:Conversation) {
  let response = await axios.post("http://localhost:3000/api/chat", conversationarr)
    console.log(response.data)
  //   if(response.data.message.stop_reason == "tool_use") {
  //     // setInputMode('address');
  //     const tool_use = response.data.message.content.find((block: ContentBlock):block is Anthropic.ToolUseBlock => block.type === "tool_use")
  //     console.log(tool_use)
  // }
    response.data.messages.map((message:ClaudeMessage) => {
      //add this message with a role of assistant in the conversation array 
      conversationarr = {...conversationarr, messages:[...conversationarr.messages, {
        role:"assistant", 
        content:message.text
      }]}
    })
    if(response.data.tools) {
      if(response.data.tools.name === "get_customer_address") {
        setCurrentToolId(response.data.tools.id)
        console.log(response.data.tools.content)
        conversationarr = {...conversationarr, messages:[...conversationarr.messages, {
          role:'assistant', 
          content:[response.data.tools.content]
        }]}
        setInputMode("address");
      }
    }
    setConversation(conversationarr)
}


  async function sendMessage() {
    //the message needs to be appended in a messages array. 
    const newMessage:Message = {
      role:"user", 
      content:input
    }

    const currentConversation = {...conversation, messages:[...conversation.messages, newMessage]}
    setConversation(currentConversation)
    //instead of the manual reply, we need to send it to anthropic, add the response and send it back to the frontend 
    setInput('');
    messageClaude(currentConversation)
    // setTimeout(() => {
    //   setConversation((prev) => (
    //   {
    //     ...prev, messages: [...prev.messages, {
    //       role: "assistant",
    //       content: "Please enter your address."
    //     }]
    //   }
    // ))
    //   setInputMode('address')
    // }, 2000);
  }

  async function selectAddress(address: AddressSuggestion) {
    const newMessage:Message = {
      role:"user", 
      content: address.label
    }
    console.log(newMessage)
    const newMessage2:Message = {
      role:"user", 
      content: [{
        type:"tool_result", 
        tool_use_id: currentToolId, 
        content:address.label
      }]
    }
    console.log(newMessage2)
    let currentConversation = {
      ...conversation, messages:[...conversation.messages, newMessage2, newMessage]
    }
    console.log(currentConversation)
    setConversation(currentConversation)
    setInputMode('chat')
    messageClaude(currentConversation)

    try {
      const res = await axios.get("http://localhost:3000/api/address/metadata", {
        params: { id: address.id }
      });
      const metadata = res.data.address;
      const displayedFields = ["full_address", "locality_name", "state_territory", "postcode", "latitude", "longitude"];
      const hiddenFields = Object.fromEntries(
        Object.entries(metadata).filter(([key]) => !displayedFields.includes(key))
      );

      // console.log("Address metadata response:", metadata);
      // console.log("Address metadata fields not displayed:", hiddenFields);
    } catch (error) {
      console.error("Unable to fetch address metadata:", error);
      setConversation((prev) => (
      {
        ...prev, messages: [...prev.messages, {
          role: 'assistant',
          content: "I found the address, but couldn't load the extra details."
        }]
      }
    ))
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
              {conversation.messages.map((message) => {
                if(typeof message.content !== "string") {
                  return null; 
                }
                return (
                  <div
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