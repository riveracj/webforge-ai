import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { CREDIT_PACKS } from '../../utils/constants'
import { api } from '../../api/api'
import { Coins, Loader2, Check, Sparkles } from 'lucide-react'

export default function BuyCreditsModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(null)

  const handlePurchase = async (pack) => {
    setLoading(pack.id)
    try {
      const priceId = pack.stripePriceId
      if (!priceId) {
        alert('Credit packs are not configured yet. Set up Stripe prices and add their IDs to your .env file.')
        return
      }
      const result = await api.billing.createCheckoutSession({
        type: 'credits',
        packId: pack.id,
        priceId,
        successUrl: window.location.origin + '/dashboard?credits=purchased',
        cancelUrl: window.location.origin + '/dashboard?credits=cancelled',
      })
      if (result.data?.url) {
        window.location.href = result.data.url
      } else {
        alert('Checkout could not be created. Please try again.')
      }
    } catch (err) {
      console.error('Credit purchase error:', err)
      alert(err.message || 'Purchase failed. Please try again.')
    }
    setLoading(null)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buy Credits" size="md">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Coins size={28} className="text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Get More Credits</h3>
        <p className="text-sm text-gray-500">Credits never expire. Use them on any AI model.</p>
      </div>

      <div className="space-y-3 mb-6">
        {CREDIT_PACKS.map((pack) => (
          <div key={pack.id} className={`rounded-xl border-2 p-4 transition-all ${
            pack.id === 'popular' ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-gray-900">{pack.label}</span>
                {pack.id === 'popular' && (
                  <span className="ml-2 text-xs bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Best value</span>
                )}
              </div>
              <span className="text-lg font-bold text-gray-900">${pack.price}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">{pack.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                <strong>{pack.credits}</strong> credits ({pack.description})
              </span>
              <Button
                size="sm"
                variant={pack.id === 'popular' ? 'primary' : 'outline'}
                onClick={() => handlePurchase(pack)}
                disabled={loading === pack.id}
              >
                {loading === pack.id ? (
                  <><Loader2 size={14} className="mr-1 animate-spin" /> Processing...</>
                ) : (
                  <><Coins size={14} className="mr-1" /> Buy</>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Sparkles size={14} className="text-indigo-500" />
          <span className="font-medium">How credits work</span>
        </div>
        <ul className="space-y-1 text-xs text-gray-500">
          <li className="flex items-start gap-2"><Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" /> 1 credit = 1 generation on Fast model</li>
          <li className="flex items-start gap-2"><Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" /> Premium models cost more credits</li>
          <li className="flex items-start gap-2"><Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" /> Free credits used first, purchased credits last</li>
          <li className="flex items-start gap-2"><Check size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" /> Credits never expire</li>
        </ul>
      </div>
    </Modal>
  )
}
