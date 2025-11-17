import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CreateReview from './pages/CreateReview'
import ViewProfile from './pages/ViewProfile'
import SubmitReview from './pages/SubmitReview'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center space-x-2">
                <span className="text-2xl">💬</span>
                <h1 className="text-2xl font-bold text-primary-600">Whisper</h1>
              </a>
              <p className="text-sm text-gray-500 hidden sm:block">Anonymous Feedback Platform</p>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateReview />} />
            <Route path="/profile/:profileId" element={<ViewProfile />} />
            <Route path="/review/:profileId" element={<SubmitReview />} />
          </Routes>
        </main>

        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              🔒 Your privacy is protected. All feedback is anonymous and secure.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
