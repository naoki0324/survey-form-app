'use client'

import { useState, useEffect } from 'react'
import type { SurveyConfig, SurveyField, FieldType } from '@/types/survey'
import Link from 'next/link'

const fieldTypeLabels: Record<FieldType, string> = {
  text: 'テキスト入力',
  email: 'メールアドレス',
  select: 'ドロップダウン',
  radio: 'ラジオボタン',
  checkbox: 'チェックボックス',
  textarea: 'テキストエリア',
}

const createEmptyField = (): SurveyField => ({
  id: `field_${Date.now()}`,
  type: 'text',
  label: '',
  required: false,
  placeholder: '',
  options: [],
})

export default function AdminPage() {
  const [config, setConfig] = useState<SurveyConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingField, setEditingField] = useState<SurveyField | null>(null)
  const [isNewField, setIsNewField] = useState(false)
  const [popup, setPopup] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showPopup = (type: 'success' | 'error', message: string) => {
    setPopup({ type, message })
    setTimeout(() => setPopup(null), 3000)
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      setMessage({ type: 'error', text: '設定の読み込みに失敗しました' })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) throw new Error('保存に失敗しました')

      showPopup('success', '設定を更新しました')
    } catch (error) {
      showPopup('error', '設定が更新できませんでした\n再度更新してください')
    } finally {
      setSaving(false)
    }
  }

  const handleAddField = () => {
    setEditingField(createEmptyField())
    setIsNewField(true)
  }

  const handleEditField = (field: SurveyField) => {
    setEditingField({ ...field, options: field.options ? [...field.options] : [] })
    setIsNewField(false)
  }

  const handleDeleteField = (fieldId: string) => {
    if (!config || !confirm('この項目を削除しますか？')) return

    setConfig({
      ...config,
      fields: config.fields.filter(f => f.id !== fieldId),
    })
  }

  const handleSaveField = () => {
    if (!config || !editingField || !editingField.label) {
      setMessage({ type: 'error', text: 'ラベルを入力してください' })
      return
    }

    const needsOptions = ['select', 'radio', 'checkbox'].includes(editingField.type)
    if (needsOptions && (!editingField.options || editingField.options.length === 0)) {
      setMessage({ type: 'error', text: '選択肢を追加してください' })
      return
    }

    if (isNewField) {
      setConfig({
        ...config,
        fields: [...config.fields, editingField],
      })
    } else {
      setConfig({
        ...config,
        fields: config.fields.map(f => f.id === editingField.id ? editingField : f),
      })
    }

    setEditingField(null)
    setIsNewField(false)
  }

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (!config) return

    const newFields = [...config.fields]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newFields.length) return

    ;[newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]]
    setConfig({ ...config, fields: newFields })
  }

  const handleAddOption = () => {
    if (!editingField) return
    setEditingField({
      ...editingField,
      options: [...(editingField.options || []), ''],
    })
  }

  const handleUpdateOption = (index: number, value: string) => {
    if (!editingField || !editingField.options) return
    const newOptions = [...editingField.options]
    newOptions[index] = value
    setEditingField({ ...editingField, options: newOptions })
  }

  const handleDeleteOption = (index: number) => {
    if (!editingField || !editingField.options) return
    setEditingField({
      ...editingField,
      options: editingField.options.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="admin-container">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="admin-container">
        <p>設定を読み込めませんでした</p>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>管理者メニュー</h1>
        <Link href="/" className="preview-link">フォームを確認</Link>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <section className="admin-section">
        <h2>基本設定</h2>
        <div className="form-row">
          <label>フォームタイトル</label>
          <input
            type="text"
            value={config.title}
            onChange={e => setConfig({ ...config, title: e.target.value })}
          />
        </div>
        <div className="form-row">
          <label>サブタイトル</label>
          <input
            type="text"
            value={config.subtitle}
            onChange={e => setConfig({ ...config, subtitle: e.target.value })}
          />
        </div>
      </section>

      <section className="admin-section">
        <div className="section-header">
          <h2>フォーム項目</h2>
          <button className="btn-add" onClick={handleAddField}>+ 項目を追加</button>
        </div>

        <div className="field-list">
          {config.fields.map((field, index) => (
            <div key={field.id} className="field-item">
              <div className="field-info">
                <span className="field-label">
                  {field.label || '(ラベル未設定)'}
                  {field.required && <span className="required-badge">必須</span>}
                </span>
                <span className="field-type">{fieldTypeLabels[field.type]}</span>
              </div>
              <div className="field-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleMoveField(index, 'up')}
                  disabled={index === 0}
                  title="上へ移動"
                >
                  ↑
                </button>
                <button
                  className="btn-icon"
                  onClick={() => handleMoveField(index, 'down')}
                  disabled={index === config.fields.length - 1}
                  title="下へ移動"
                >
                  ↓
                </button>
                <button
                  className="btn-edit"
                  onClick={() => handleEditField(field)}
                >
                  編集
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteField(field.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="admin-footer">
        <button
          className="btn-save"
          onClick={saveConfig}
          disabled={saving}
        >
          {saving ? '保存中...' : '設定を保存'}
        </button>
      </div>

      {editingField && (
        <div className="modal-overlay" onClick={() => setEditingField(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{isNewField ? '項目を追加' : '項目を編集'}</h3>

            <div className="form-row">
              <label>ラベル <span className="required">*</span></label>
              <input
                type="text"
                value={editingField.label}
                onChange={e => setEditingField({ ...editingField, label: e.target.value })}
                placeholder="例: お名前"
              />
            </div>

            <div className="form-row">
              <label>項目タイプ</label>
              <select
                value={editingField.type}
                onChange={e => setEditingField({
                  ...editingField,
                  type: e.target.value as FieldType,
                  options: ['select', 'radio', 'checkbox'].includes(e.target.value)
                    ? (editingField.options?.length ? editingField.options : [''])
                    : undefined,
                })}
              >
                {Object.entries(fieldTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="form-row checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={editingField.required}
                  onChange={e => setEditingField({ ...editingField, required: e.target.checked })}
                />
                必須項目にする
              </label>
            </div>

            {['text', 'email', 'textarea'].includes(editingField.type) && (
              <div className="form-row">
                <label>プレースホルダー</label>
                <input
                  type="text"
                  value={editingField.placeholder || ''}
                  onChange={e => setEditingField({ ...editingField, placeholder: e.target.value })}
                  placeholder="例: 山田 太郎"
                />
              </div>
            )}

            {['select', 'radio', 'checkbox'].includes(editingField.type) && (
              <div className="form-row">
                <label>選択肢</label>
                <div className="options-list">
                  {editingField.options?.map((option, index) => (
                    <div key={index} className="option-row">
                      <input
                        type="text"
                        value={option}
                        onChange={e => handleUpdateOption(index, e.target.value)}
                        placeholder={`選択肢 ${index + 1}`}
                      />
                      <button
                        className="btn-remove-option"
                        onClick={() => handleDeleteOption(index)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn-add-option"
                    onClick={handleAddOption}
                    type="button"
                  >
                    + 選択肢を追加
                  </button>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditingField(null)}>
                キャンセル
              </button>
              <button className="btn-confirm" onClick={handleSaveField}>
                {isNewField ? '追加' : '更新'}
              </button>
            </div>
          </div>
        </div>
      )}

      {popup && (
        <div className={`popup ${popup.type}`}>
          <div className="popup-content">
            {popup.message.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <button className="popup-close" onClick={() => setPopup(null)}>×</button>
        </div>
      )}
    </div>
  )
}
