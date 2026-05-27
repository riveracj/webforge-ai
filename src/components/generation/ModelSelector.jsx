import { MODELS } from '../../utils/constants'
import { useAuthStore } from '../../store/authStore'
import { Sparkles, Zap, Crown, ChevronDown } from 'lucide-react'

const MODEL_ICONS = {
  'gemini-2.5-flash-lite': Zap,
  'gemini-2.5-flash': Sparkles,
  'gemini-2.0-pro': Crown,
}

const MODEL_COLORS = {
  'gemini-2.5-flash-lite': 'text-emerald-500',
  'gemini-2.5-flash': 'text-indigo-500',
  'gemini-2.0-pro': 'text-amber-500',
}

export default function ModelSelector({ selected, onSelect, disabled }) {
  const { canAffordGeneration, getCreditBalance, getPlan } = useAuthStore()
  const balance = getCreditBalance()
  const plan = getPlan()

  const getCreditsLabel = (credits) => {
    return `${credits} credit${credits > 1 ? 's' : ''}`
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <button
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-gray-300 transition-all disabled:opacity-50"
        >
          {(() => {
            const model = MODELS.find(m => m.id === selected) || MODELS[0]
            const Icon = MODEL_ICONS[model.id] || Sparkles
            const color = MODEL_COLORS[model.id] || 'text-gray-500'
            return (
              <>
                <Icon size={12} className={color} />
                {model.label}
                <ChevronDown size={10} className="text-gray-400" />
              </>
            )
          })()}
        </button>
        <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
          <div className="p-1">
            {MODELS.map((model) => {
              const Icon = MODEL_ICONS[model.id] || Sparkles
              const color = MODEL_COLORS[model.id] || 'text-gray-500'
              const canAfford = canAffordGeneration(model.credits)
              const isSelected = model.id === selected
              return (
                <button
                  key={model.id}
                  onClick={() => canAfford && onSelect(model.id)}
                  disabled={!canAfford || disabled}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                    isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-gray-50'
                  } ${!canAfford ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Icon size={16} className={`${color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {model.label}
                    </div>
                    <div className="text-xs text-gray-400">{model.provider}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                    canAfford ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500'
                  }`}>
                    {getCreditsLabel(model.credits)}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="px-3 py-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Balance: {balance.total} credits</span>
              {plan !== 'free' && <span className="text-indigo-500">{plan}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
