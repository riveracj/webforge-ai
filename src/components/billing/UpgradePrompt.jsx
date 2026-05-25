import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { PLANS } from '../../utils/constants'
import { api } from '../../api/api'
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react'

const PLAN_STRIPE_IDS = {
  pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || '',
  business: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID || '',
}

export default function UpgradePrompt({ onClose, feature = '' }) {
  const [loading, setLoading] = useState(null)

  const handleUpgrade = async (plan) => {
    const priceId = PLAN_STRIPE_IDS[plan]
    if (!priceId) {
      alert('Stripe not configured yet. Contact us to upgrade.')
      return
    }

    setLoading(plan)
    try {
      const result = await api.billing.createCheckoutSession({
        priceId,
        successUrl: window.location.origin + '/dashboard?upgrade=success',
        cancelUrl: window.location.origin + '/dashboard?upgrade=cancelled',
      })
      if (result.data?.url) {
        window.location.href = result.data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Payment system is being set up. Please try again later.')
    }
    setLoading(null)
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Upgrade Your Plan" size="md">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} className="text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {feature ? `Unlock ${feature}` : 'Unlock More Features'}
        </h3>
        <p className="text-sm text-gray-500">
          Upgrade to Pro or Business plan to increase your limits
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {(['pro', 'business']).map((key) => {
          const plan = PLANS[key]
          return (
            <div key={key} className={`rounded-xl p-5 border-2 ${key === 'pro' ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
              <h4 className="font-semibold text-gray-900 mb-1">{plan.name}</h4>
              <div className="mb-3">
                <span className="text-2xl font-bold">${plan.price}</span>
                <span className="text-gray-400 text-sm">/month</span>
              </div>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" />
                  {plan.projects} Projects
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" />
                  {plan.aiGenerations} AI generations
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-500 flex-shrink-0" />
                  {plan.customDomain ? 'Custom domains' : 'No custom domain'}
                </li>
              </ul>
              <Button
                size="sm"
                className="w-full"
                variant={key === 'pro' ? 'primary' : 'outline'}
                onClick={() => handleUpgrade(key)}
                disabled={loading === key}
              >
                {loading === key ? (
                  <><Loader2 size={14} className="mr-1 animate-spin" /> Processing...</>
                ) : (
                  <><ArrowRight size={14} className="mr-1" /> Upgrade</>
                )}
              </Button>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>
          Maybe Later
        </Button>
      </div>
    </Modal>
  )
}
