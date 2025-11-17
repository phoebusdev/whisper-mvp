import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const createProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to create profile')
      }

      const data = await response.json()

      // Store claim token in localStorage for future claiming
      localStorage.setItem(`claim_token_${data.profileId}`, data.claimToken)

      // Navigate to create review page with the new profile
      navigate('/create', { state: { profile: data } })
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Failed to create profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Get Honest, Anonymous Feedback
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Create your anonymous feedback profile and share it with partners, colleagues, or friends
        </p>
        <button
          onClick={createProfile}
          disabled={loading}
          className="btn-primary text-lg px-8 py-4"
        >
          {loading ? 'Creating...' : 'Create Your Feedback Profile'}
        </button>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Completely Anonymous</h3>
          <p className="text-gray-600">
            No email, no phone number. Just honest feedback from people who matter.
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">Aggregated Insights</h3>
          <p className="text-gray-600">
            See your averaged ratings and all feedback in one place.
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
          <p className="text-gray-600">
            Get a shareable link optimized for SMS and social media.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card">
        <h3 className="text-2xl font-bold mb-6 text-center">How It Works</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold mb-1">Create Your Profile</h4>
              <p className="text-gray-600">Click the button above to generate your unique anonymous profile.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold mb-1">Share Your Link</h4>
              <p className="text-gray-600">Send your unique review link via text, email, or any platform.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold mb-1">Receive Anonymous Feedback</h4>
              <p className="text-gray-600">People rate you on key categories and leave optional comments.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold mb-1">View Your Results</h4>
              <p className="text-gray-600">See aggregated scores and all feedback in your profile.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <p className="text-sm text-gray-700 text-center">
          <strong>Privacy First:</strong> We don't collect email addresses, phone numbers, or any personal information.
          Your profile is identified only by a unique ID. Save your claim token to access your profile later.
        </p>
      </div>
    </div>
  )
}
