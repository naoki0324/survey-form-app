import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import type { SurveyConfig } from '@/types/survey'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const formData: Record<string, string | string[]> = await request.json()

    // 設定を読み込み
    const configPath = path.join(process.cwd(), 'data', 'survey-config.json')
    const configData = await readFile(configPath, 'utf-8')
    const config: SurveyConfig = JSON.parse(configData)

    // 必須項目のバリデーション
    for (const field of config.fields) {
      if (field.required) {
        const value = formData[field.id]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return NextResponse.json(
            { error: `${field.label}は必須項目です` },
            { status: 400 }
          )
        }
      }
    }

    // メール本文を作成
    const textLines: string[] = [
      'アンケート回答を受信しました',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '回答内容',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
    ]

    const htmlRows: string[] = []

    for (const field of config.fields) {
      const value = formData[field.id]
      let displayValue: string

      if (Array.isArray(value)) {
        displayValue = value.length > 0 ? value.join(', ') : '未選択'
      } else {
        displayValue = value || '未回答'
      }

      textLines.push(`${field.label}: ${displayValue}`)
      textLines.push('')

      htmlRows.push(`
        <div class="item">
          <span class="label">${field.label}:</span>
          ${Array.isArray(value) && value.length > 0
            ? `<div class="features" style="margin-top: 8px;">${value.map(v => `<span class="feature">${v}</span>`).join('')}</div>`
            : field.type === 'textarea'
              ? `<div class="improvement">${displayValue}</div>`
              : `<span>${displayValue}</span>`
          }
        </div>
      `)
    }

    textLines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    textLines.push(`送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}`)
    textLines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const emailBody = textLines.join('\n')

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1A1A1A; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #FAFAF8; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #F0EDE8; border-top: none; }
    .item { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #F0EDE8; }
    .item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-weight: 600; color: #3D3D3D; display: block; margin-bottom: 4px; }
    .features { display: flex; flex-wrap: wrap; gap: 8px; }
    .feature { background: #F5F0E8; color: #5C4A32; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
    .improvement { background: white; padding: 12px; border-radius: 8px; border-left: 3px solid #C9A87C; margin-top: 8px; }
    .footer { text-align: center; color: #8C8C8C; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 18px;">${config.title}</h1>
      <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">新しい回答が届きました</p>
    </div>
    <div class="content">
      ${htmlRows.join('')}
      <div class="footer">
        送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
      </div>
    </div>
  </div>
</body>
</html>
`

    // 送信先メールアドレス（環境変数から取得）
    const toEmail = process.env.TO_EMAIL || 'your-email@example.com'

    // 回答者のメールアドレスを取得（あれば）
    const emailField = config.fields.find(f => f.type === 'email')
    const replyToEmail = emailField ? formData[emailField.id] as string : undefined

    // 回答者の名前を取得（あれば）
    const nameField = config.fields.find(f => f.id === 'name' || f.label.includes('名前'))
    const responderName = nameField ? formData[nameField.id] as string : '回答者'

    const { error } = await resend.emails.send({
      from: `${config.title} <onboarding@resend.dev>`,
      to: [toEmail],
      subject: `【${config.title}】${responderName}様より回答`,
      text: emailBody,
      html: emailHtml,
      reply_to: replyToEmail,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'メール送信に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
