import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Coins, Plus, Loader2, AlertTriangle } from 'lucide-react'
import BuyCreditsModal from './BuyCreditsModal'

export default function CreditBalance() {
  const { getCreditBalance } = useAuthStore()
  const [balance, setBalance] = useState({ free: 0, purchased: 0, total: 0 })
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setBalance(getCreditBalance())
    setLoading(false)
  }, [getCreditBalance])

  useEffect(() => { refresh() }, [refresh])

  return (
    <>
      <button
        onClick={() => setShowBuyModal(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-medium text-indigo-700 transition-all"
        title={`${balance.total} credits remaining`}
      >
        <Coins size={14} className="text-indigo-500" />
        <span>{loading ? <Loader2 size={10} className="animate-spin" /> : balance.total}</span>
        <Plus size={12} className="text-indigo-400" />
      </button>
      <BuyCreditsModal isOpen={showBuyModal} onClose={() => { setShowBuyModal(false); refresh() }} />
    </>
  )
}
