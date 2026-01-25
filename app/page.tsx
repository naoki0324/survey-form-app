'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { SurveyConfig, SurveyField } from '@/types/survey'

export default function SurveyForm() {
  const [config, setConfig] = useState<SurveyConfig | null>(null)
  const [formData, setFormData] = useState<Record<string, string | string[]>>({})
  const [status, setStatus] = useState<'loading' | 'idle' | 'submitting' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config')
      const data: SurveyConfig = await response.json()
      setConfig(data)

      // フォームデータの初期化
      const initialData: Record<string, string | string[]> = {}
      data.fields.forEach(field => {
        initialData[field.id] = field.type === 'checkbox' ? [] : ''
      })
      setFormData(initialData)
      setStatus('idle')
    } catch (error) {
      setErrorMessage('フォームの読み込みに失敗しました')
      setStatus('error')
    }
  }

  const handleChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, fieldLabel: string) => {
    const target = e.target
    if (target.validity.valueMissing) {
      target.setCustomValidity(`${fieldLabel}を入力してください`)
    } else if (target.validity.typeMismatch && target.type === 'email') {
      target.setCustomValidity('有効なメールアドレスを入力してください')
    } else {
      target.setCustomValidity('')
    }
  }

  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.setCustomValidity('')
  }

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    setFormData(prev => {
      const current = prev[fieldId] as string[]
      return {
        ...prev,
        [fieldId]: current.includes(option)
          ? current.filter(v => v !== option)
          : [...current, option]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
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
    if (!config) return

    const initialData: Record<string, string | string[]> = {}
    config.fields.forEach(field => {
      initialData[field.id] = field.type === 'checkbox' ? [] : ''
    })
    setFormData(initialData)
    setStatus('idle')
    setErrorMessage('')
  }

  const renderField = (field: SurveyField) => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            id={field.id}
            name={field.id}
            value={formData[field.id] as string || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            onInvalid={e => handleInvalid(e as React.InvalidEvent<HTMLInputElement>, field.label)}
            onInput={handleInput}
            required={field.required}
            placeholder={field.placeholder}
          />
        )

      case 'textarea':
        return (
          <textarea
            id={field.id}
            name={field.id}
            value={formData[field.id] as string || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            onInvalid={e => handleInvalid(e as React.InvalidEvent<HTMLTextAreaElement>, field.label)}
            onInput={handleInput}
            required={field.required}
            placeholder={field.placeholder}
          />
        )

      case 'select':
        return (
          <select
            id={field.id}
            name={field.id}
            value={formData[field.id] as string || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            onInvalid={e => handleInvalid(e as React.InvalidEvent<HTMLSelectElement>, field.label)}
            onInput={handleInput}
            required={field.required}
          >
            <option value="">選択してください</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map((option, index) => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={e => handleChange(field.id, e.target.value)}
                  onInvalid={e => {
                    const target = e.target as HTMLInputElement
                    target.setCustomValidity(`${field.label}を選択してください`)
                  }}
                  onInput={e => {
                    const target = e.target as HTMLInputElement
                    target.setCustomValidity('')
                  }}
                  required={field.required && index === 0}
                />
                {option}
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="checkbox-group">
            {field.options?.map(option => (
              <label
                key={option}
                className={`checkbox-option ${(formData[field.id] as string[])?.includes(option) ? 'checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={(formData[field.id] as string[])?.includes(option) || false}
                  onChange={() => handleCheckboxToggle(field.id, option)}
                />
                {option}
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (status === 'loading') {
    return (
      <div className="container">
        <p style={{ textAlign: 'center', color: '#8C8C8C' }}>読み込み中...</p>
      </div>
    )
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

  if (!config) {
    return (
      <div className="container">
        <p style={{ textAlign: 'center', color: '#8B4545' }}>フォームを読み込めませんでした</p>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
        <Link
          href="/admin"
          style={{
            color: '#8C8C8C',
            textDecoration: 'none',
            fontSize: '0.8rem',
            padding: '0.4rem 0.75rem',
            border: '1px solid #E8E4DF',
            borderRadius: '6px',
            transition: 'all 0.2s',
          }}
        >
          管理
        </Link>
      </div>

      <h1>{config.title}</h1>
      <p className="subtitle">{config.subtitle}</p>

      {status === 'error' && (
        <div className="message error">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        {config.fields.map(field => (
          <div key={field.id} className="form-group">
            <label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}

        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? '送信中...' : '送信する'}
        </button>
      </form>
    </div>
  )
}
