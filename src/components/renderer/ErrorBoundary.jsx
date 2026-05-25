import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Section render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center border-2 border-red-200 rounded-lg m-4 bg-red-50">
          <AlertTriangle size={24} className="text-red-400 mx-auto mb-2" />
          <p className="text-sm text-red-600 font-medium">Section render error</p>
          <p className="text-xs text-red-400 mt-1">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 text-xs text-red-500 underline hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
