import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SurveyData {
  name: string
  email: string
  age: string
  satisfaction: string
  features: string[]
  improvement: string
  recommend: string
}

export async function POST(request: Request) {
  try {
    const data: SurveyData = await request.json()

    // バリデーション
    if (!data.name || !data.email || !data.satisfaction || !data.recommend) {
      return NextResponse.json(
        { error: '必須項目を入力してください' },
        { status: 400 }
      )
    }

    // メール本文を作成
    const emailBody = `
アンケート回答を受信しました

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
回答者情報
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

お名前: ${data.name}
メールアドレス: ${data.email}
年齢層: ${data.age || '未回答'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
アンケート回答
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

総合満足度: ${data.satisfaction}

良かった点: ${data.features.length > 0 ? data.features.join(', ') : '未選択'}

改善してほしい点:
${data.improvement || '未記入'}

友人・知人への推薦: ${data.recommend}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

    // HTML形式のメール
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; color: #667eea; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
    .item { margin-bottom: 8px; }
    .label { font-weight: bold; color: #555; }
    .features { display: flex; flex-wrap: wrap; gap: 8px; }
    .feature { background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
    .improvement { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
    .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">アンケート回答</h1>
      <p style="margin: 5px 0 0;">新しい回答が届きました</p>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">回答者情報</div>
        <div class="item"><span class="label">お名前:</span> ${data.name}</div>
        <div class="item"><span class="label">メールアドレス:</span> ${data.email}</div>
        <div class="item"><span class="label">年齢層:</span> ${data.age || '未回答'}</div>
      </div>

      <div class="section">
        <div class="section-title">アンケート回答</div>
        <div class="item"><span class="label">総合満足度:</span> ${data.satisfaction}</div>
        <div class="item">
          <span class="label">良かった点:</span>
          ${data.features.length > 0
            ? `<div class="features" style="margin-top: 8px;">${data.features.map(f => `<span class="feature">${f}</span>`).join('')}</div>`
            : '未選択'}
        </div>
        <div class="item">
          <span class="label">改善してほしい点:</span>
          <div class="improvement">${data.improvement || '未記入'}</div>
        </div>
        <div class="item"><span class="label">友人・知人への推薦:</span> ${data.recommend}</div>
      </div>

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

    const { error } = await resend.emails.send({
      from: 'アンケートフォーム <onboarding@resend.dev>',
      to: [toEmail],
      subject: `【アンケート回答】${data.name}様より`,
      text: emailBody,
      html: emailHtml,
      replyTo: data.email,
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
