import Header from './components/header'
import Chat from './components/chat'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Header />
      <div className = "chat-container flex min-h-screen flex-col items-center px-4 pt-20">
        <Chat />
      </div>
    </div>
  )
}

export default App
