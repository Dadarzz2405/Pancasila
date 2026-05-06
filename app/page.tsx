import Image from "next/image";
import { GiGoldMedal } from "react-icons/gi";
import { RiHeartLine, RiShieldCheckLine, RiSendPlaneLine } from "react-icons/ri";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      {/* Left Column: Navigation Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 flex flex-col">
        {/* Pancasila Hub Logo */}
        <div className="flex items-center gap-3 mb-6">
          <GiGoldMedal className="h-8 w-8 text-red-600" />
          <h1 className="text-xl font-bold text-red-600">Pancasila Hub</h1>
        </div>
        
        {/* Unit Menu */}
        <nav className="flex-1 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Units</h2>
          <ul className="space-y-2">
            <li><a href="#" className="block py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700 dark:text-gray-300">Toleransi & Keberagaman</a></li>
            <li><a href="#" className="block py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700 dark:text-gray-300">Kerjasama Sama</a></li>
            <li><a href="#" className="block py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700 dark:text-gray-300">Keadilan Sosial</a></li>
            <li><a href="#" className="block py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700 dark:text-gray-300">Demokrasi Terpimpin</a></li>
            <li><a href="#" className="block py-2 px-3 rounded hover:bg-red-50 hover:text-red-600 transition-colors text-gray-700 dark:text-gray-300">Ketuhanan Yang Maha Esa</a></li>
          </ul>
        </nav>
        
        {/* Auth Status */}
        <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Connected</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Guest Mode</span>
          </div>
        </div>
      </aside>
      
      {/* Middle Column: Reflection Wall */}
      <main className="flex-1 border-r border-zinc-200 dark:border-zinc-700 p-6 overflow-y-auto">
        {/* Input Card */}
        <div className="mb-6 p-5 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Share Your Reflection</h3>
          </div>
          
          <form className="flex flex-col gap-3">
            <textarea
              rows={4}
              placeholder="What does Pancasila mean to you in the digital age?"
              className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded" />
                Post anonymously
              </label>
              
              <button type="submit" className="ml-auto px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Kirim
              </button>
            </div>
          </form>
        </div>
        
        {/* List Cards: Display of AI-verified reflections */}
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border-l-4 border-gold-400">
            <div className="flex items-start gap-3 mb-2">
              <RiShieldCheckLine className="mt-1 h-5 w-5 text-gold-400" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Anonymous</p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Pancasila teaches us to respect differences while maintaining unity. In the digital world, this means avoiding spreading hoaxes and respecting others' opinions online.</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>•</span>
                  <span>Today 10:30</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border-l-4 border-gold-400">
            <div className="flex items-start gap-3 mb-2">
              <RiShieldCheckLine className="mt-1 h-5 w-5 text-gold-400" />
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Anonymous</p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Being ethical online means not engaging in cyberbullying, even when we disagree. This reflects the Pancasila value of civilized humanity.</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>•</span>
                  <span>Today 09:15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Right Column: Discussion/Chat */}
      <aside className="w-80 border-l border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 flex flex-col">
        {/* Pinned Box: Static Hook Question */}
        <div className="mb-5 p-4 bg-red-50 dark:bg-zinc-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">Discussion Starter</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            How can we apply Pancasila values to combat misinformation on social media?
          </p>
        </div>
        
        {/* Discussion List */}
        <div className="flex-1 mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Discussions</h3>
          <div className="space-y-2">
            <a href="#" className="p-3 bg-gray-50 dark:bg-zinc-700 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">Digital Ethics & Pancasila</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">Exploring how traditional values apply to online behavior...</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">3 posts</span>
              </div>
            </a>
            
            <a href="#" className="p-3 bg-gray-50 dark:bg-zinc-700 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">Youth Participation in Digital Era</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">How can young people contribute positively online?</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">5 posts</span>
              </div>
            </a>
          </div>
        </div>
        
        {/* Chat Interface */}
        <div className="mt-auto">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Live Chat</h3>
          <div className="h-64 border border-zinc-300 dark:border-zinc-600 rounded-lg p-3 overflow-y-auto mb-3 bg-gray-50 dark:bg-zinc-800">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">User1</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">I think fact-checking before sharing is crucial...</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 justify-end">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">User2</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Absolutely! It's part of being a good digital citizen...</p>
                </div>
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              Send
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}