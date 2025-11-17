import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function CreateReview() {
  const location = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedView, setCopiedView] = useState(false)

  useEffect(() => {
    if (location.state?.profile) {
      setProfile(location.state.profile)
    } else {
      // If no profile in state, redirect to home
      navigate('/')
    }
  }, [location, navigate])

  const copyToClipboard = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedState(true)
      setTimeout(() => setCopiedState(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const getFullUrl = (path) => {
    return `${window.location.origin}${path}`
  }

  const getSMSText = () => {
    const url = getFullUrl(profile.reviewLink)
    return `Hi! I'd appreciate your honest feedback. Please take a moment to review me anonymously: ${url}`
  }

  const copySMSLink = () => {
    copyToClipboard(getSMSText(), setCopied)
  }

  const copyReviewLink = () => {
    copyToClipboard(getFullUrl(profile.reviewLink), setCopied)
  }

  const copyViewLink = () => {
    copyToClipboard(getFullUrl(profile.viewLink), setCopiedView)
  }

  if (!profile) {
    return (
      <div className="text-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Profile is Ready!
          </h2>
          <p className="text-gray-600">
            Share your review link to start collecting anonymous feedback
          </p>
        </div>

        {/* Review Link Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">📤 Share Your Review Link</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-3">
            <p className="text-sm text-gray-600 mb-2 break-all">
              {getFullUrl(profile.reviewLink)}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={copyReviewLink}
                className="btn-primary flex-1"
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={copySMSLink}
                className="btn-secondary flex-1"
              >
                {copied ? '✓ Copied!' : 'Copy SMS Message'}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Share this link with anyone you want feedback from. They can submit reviews anonymously.
          </p>
        </div>

        {/* View Profile Link */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">👀 Your Profile View Link</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-3">
            <p className="text-sm text-gray-600 mb-2 break-all">
              {getFullUrl(profile.viewLink)}
            </p>
            <button
              onClick={copyViewLink}
              className="btn-primary w-full"
            >
              {copiedView ? '✓ Copied!' : 'Copy View Link'}
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Use this link to view all your feedback and ratings.
          </p>
        </div>

        {/* Claim Token */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <span className="mr-2">🔑</span>
            Important: Save Your Claim Token
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Your claim token allows you to prove ownership of this profile in the future.
            Keep it safe - it's stored in your browser, but we recommend saving it elsewhere too.
          </p>
          <div className="bg-white p-3 rounded border border-yellow-300 font-mono text-sm break-all">
            {profile.claimToken}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Profile ID: <span className="font-mono">{profile.profileId}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(profile.viewLink)}
            className="btn-primary flex-1"
          >
            View My Profile
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex-1"
          >
            Create Another Profile
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 card bg-primary-50 border border-primary-200">
        <h3 className="font-semibold mb-3">💡 Tips for Getting Great Feedback</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Share your link with people who know your work well</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Ask for honest feedback - anonymity encourages truthfulness</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>The more reviews you collect, the more accurate your aggregated scores</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Bookmark your view link to check back for new feedback</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
