import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ViewProfile() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [profileId])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Profile not found')
        }
        throw new Error('Failed to load profile')
      }

      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = async () => {
    const url = `${window.location.origin}/review/${profileId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-blue-600'
    if (rating >= 2.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStarRating = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <span className="flex items-center">
        {'⭐'.repeat(fullStars)}
        {hasHalfStar && '⭐'}
        {'☆'.repeat(emptyStars)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="text-center">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error}
          </h2>
          <p className="text-gray-600 mb-6">
            The profile you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Anonymous Feedback Profile
          </h2>

          {/* Overall Stats */}
          {profile.reviewCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary-600">
                  {profile.overallAverage.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Overall Rating</div>
                <div className="mt-1">{getStarRating(profile.overallAverage)}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-gray-900">
                  {profile.reviewCount}
                </div>
                <div className="text-sm text-gray-600">
                  {profile.reviewCount === 1 ? 'Review' : 'Reviews'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-gray-900">
                  {profile.viewCount}
                </div>
                <div className="text-sm text-gray-600">
                  Profile Views
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4">
                No reviews yet. Share your link to start collecting feedback!
              </p>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={copyShareLink}
            className="btn-primary"
          >
            {copied ? '✓ Link Copied!' : '📤 Share Review Link'}
          </button>
        </div>
      </div>

      {/* Category Averages */}
      {profile.reviewCount > 0 && Object.keys(profile.categoryAverages).length > 0 && (
        <div className="card mb-6">
          <h3 className="text-xl font-bold mb-4">Category Ratings</h3>
          <div className="space-y-4">
            {Object.entries(profile.categoryAverages).map(([category, average]) => (
              <div key={category} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className={`text-2xl font-bold ${getRatingColor(average)}`}>
                    {average.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      average >= 4.5 ? 'bg-green-600' :
                      average >= 3.5 ? 'bg-blue-600' :
                      average >= 2.5 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${(average / 5) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      {profile.reviews && profile.reviews.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">
            Individual Reviews ({profile.reviews.length})
          </h3>
          <div className="space-y-6">
            {profile.reviews.map((review, index) => (
              <div
                key={review.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">
                    Review #{profile.reviews.length - index}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.submitted_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Review Ratings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {Object.entries(review.ratings).map(([category, rating]) => (
                    <div key={category} className="flex items-center justify-between bg-white rounded px-3 py-2">
                      <span className="text-sm text-gray-700">{category}</span>
                      <span className="font-semibold text-primary-600">
                        {rating}/5
                      </span>
                    </div>
                  ))}
                </div>

                {/* Feedback Text */}
                {review.feedback_text && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-700 italic">
                      "{review.feedback_text}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          Create Your Own Profile
        </button>
      </div>
    </div>
  )
}
