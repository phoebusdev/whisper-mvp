import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function SubmitReview() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [ratings, setRatings] = useState({})
  const [feedbackText, setFeedbackText] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')

      const data = await response.json()
      setCategories(data)

      // Initialize ratings with null values
      const initialRatings = {}
      data.forEach(cat => {
        initialRatings[cat.name] = 0
      })
      setRatings(initialRatings)
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('Failed to load rating categories')
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all categories are rated
    const unratedCategories = Object.entries(ratings).filter(([_, value]) => value === 0)
    if (unratedCategories.length > 0) {
      alert('Please rate all categories before submitting')
      return
    }

    if (!consentGiven) {
      alert('Please acknowledge the consent statement to submit your review')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileId,
          ratings,
          feedbackText: feedbackText.trim() || null,
          consentGiven
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(error.message || 'Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <p>Loading review form...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Your anonymous feedback has been submitted successfully.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Your review is completely anonymous. No personally identifiable information was collected.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Create Your Own Profile
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Share Your Anonymous Feedback
          </h2>
          <p className="text-gray-600">
            Your responses are completely anonymous and will help provide valuable insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating Categories */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Rate the Following Categories</h3>
            <div className="space-y-6">
              {categories.map(category => (
                <div key={category.id} className="border-b border-gray-200 pb-4">
                  <label className="block font-medium text-gray-700 mb-3">
                    {category.name}
                  </label>
                  <div className="flex items-center justify-between gap-2">
                    {[1, 2, 3, 4, 5].map(value => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRatingChange(category.name, value)}
                        className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all ${
                          ratings[category.name] === value
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 hover:border-primary-400 bg-white'
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          {value === 1 ? '😞' : value === 2 ? '😕' : value === 3 ? '😐' : value === 4 ? '😊' : '😄'}
                        </div>
                        <div className="text-xs font-semibold">{value}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Feedback Text */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Additional Feedback (Optional)
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Share any additional thoughts, suggestions, or comments..."
            />
            <p className="text-sm text-gray-500 mt-1">
              This will be shared anonymously. Be constructive and respectful.
            </p>
          </div>

          {/* Consent Checkbox */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 mr-3 h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                required
              />
              <span className="text-sm text-gray-700">
                <strong>I understand and agree:</strong> This review is anonymous and cannot be edited or deleted after submission.
                I confirm that my feedback is honest, constructive, and based on my genuine experience.
                No personally identifiable information will be collected.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={submitting || !consentGiven}
              className="btn-primary flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Anonymous Review'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <p className="text-sm text-gray-700 text-center">
          <strong>🔒 Your Privacy:</strong> This platform does not collect IP addresses, email addresses,
          or any personally identifiable information. Your review is completely anonymous.
        </p>
      </div>
    </div>
  )
}
