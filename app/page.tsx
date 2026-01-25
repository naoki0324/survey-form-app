'use client'

import { useState } from 'react'

interface FormData {
  name: string
  email: string
  age: string
  satisfaction: string
  features: string[]
  improvement: string
  recommend: string
}

const initialFormData: FormData = {
  name: '',
  email: '',
  age: '',
  satisfaction: '',
  features: [],
  improvement: '',
  recommend: '',
}

export default function SurveyForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '送信に失敗しました')
      }

      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : '送信に失敗しました')
    }
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setStatus('idle')
    setErrorMessage('')
  }

  if (status === 'success') {
    return (
      <div className="container">
        <div className="success-container">
          <div className="success-icon">&#10003;</div>
          <h2>送信完了</h2>
          <p>アンケートにご協力いただきありがとうございました。</p>
          <button className="reset-button" onClick={handleReset}>
            新しいアンケートに回答する
          </button>
        </div>
      </div>
    )
  }

  const featureOptions = [
    'デザイン',
    '使いやすさ',
    '機能性',
    '価格',
    'サポート',
    '品質',
  ]

  return (
    <div className="container">
      <h1>アンケートフォーム</h1>
      <p className="subtitle">サービス改善のため、ご意見をお聞かせください</p>

      {status === 'error' && (
        <div className="message error">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">
            お名前<span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="山田 太郎"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            メールアドレス<span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="example@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">年齢層</label>
          <select
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
          >
            <option value="">選択してください</option>
            <option value="10代">10代</option>
            <option value="20代">20代</option>
            <option value="30代">30代</option>
            <option value="40代">40代</option>
            <option value="50代">50代</option>
            <option value="60代以上">60代以上</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            総合満足度<span className="required">*</span>
          </label>
          <div className="radio-group">
            {['とても満足', '満足', '普通', '不満', 'とても不満'].map(option => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name="satisfaction"
                  value={option}
                  checked={formData.satisfaction === option}
                  onChange={handleChange}
                  required
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>良かった点（複数選択可）</label>
          <div className="checkbox-group">
            {featureOptions.map(feature => (
              <label
                key={feature}
                className={`checkbox-option ${formData.features.includes(feature) ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                />
                {feature}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="improvement">改善してほしい点</label>
          <textarea
            id="improvement"
            name="improvement"
            value={formData.improvement}
            onChange={handleChange}
            placeholder="ご意見・ご要望をお聞かせください"
          />
        </div>

        <div className="form-group">
          <label>
            友人・知人に勧めたいですか？<span className="required">*</span>
          </label>
          <div className="radio-group">
            {['ぜひ勧めたい', '勧めたい', 'どちらでもない', '勧めない'].map(option => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name="recommend"
                  value={option}
                  checked={formData.recommend === option}
                  onChange={handleChange}
                  required
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? '送信中...' : '送信する'}
        </button>
      </form>
    </div>
  )
}
