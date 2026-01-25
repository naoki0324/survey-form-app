import { NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { SurveyConfig } from '@/types/survey'

const configPath = path.join(process.cwd(), 'data', 'survey-config.json')

export async function GET() {
  try {
    const data = await readFile(configPath, 'utf-8')
    const config: SurveyConfig = JSON.parse(data)
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error reading config:', error)
    return NextResponse.json(
      { error: '設定の読み込みに失敗しました' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const config: SurveyConfig = await request.json()

    // バリデーション
    if (!config.title || !config.fields || !Array.isArray(config.fields)) {
      return NextResponse.json(
        { error: '無効な設定データです' },
        { status: 400 }
      )
    }

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: '設定の保存に失敗しました' },
      { status: 500 }
    )
  }
}
