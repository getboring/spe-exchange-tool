import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// Rate limiting: track requests per IP (in-memory, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  entry.count++
  return false
}

// Allowed origins for CORS (production domains)
const ALLOWED_ORIGINS = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.ALLOWED_ORIGIN,
  'http://localhost:5173', // Local dev
  'http://localhost:4173', // Local preview
].filter(Boolean) as string[]

function getCorsOrigin(requestOrigin: string | undefined): string | null {
  if (!requestOrigin) return null

  // Check exact match
  if (ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin
  }

  // Allow any *.vercel.app subdomain for preview deployments
  if (requestOrigin.match(/^https:\/\/[a-z0-9-]+\.vercel\.app$/)) {
    return requestOrigin
  }

  return null
}

// Platforms and weights for the prompt (must match src/lib/constants.ts)
const PLATFORMS = [
  'NES', 'SNES', 'N64', 'GameCube', 'Wii', 'Wii U', 'Switch',
  'GB', 'GBC', 'GBA', 'DS', '3DS', 'Virtual Boy',
  'PS1', 'PS2', 'PS3', 'PS4', 'PS5', 'PSP', 'Vita',
  'Xbox', 'Xbox 360', 'Xbox One', 'Xbox Series',
  'Master System', 'Genesis', 'Sega CD', '32X', 'Saturn', 'Dreamcast', 'Game Gear',
  'Atari 2600', 'Atari 5200', 'Atari 7800', 'Jaguar', 'Lynx',
  'TurboGrafx-16', 'Neo Geo', '3DO', 'CD-i',
  'Other'
]

const WEIGHTS = ['4oz', '8oz', '12oz', '16oz', '24oz', '32oz', '48oz']

const SCAN_PROMPT = `Identify ALL video games, consoles, and accessories in this image. Return ONLY a JSON array, no other text.

Example format:
[{"id":"1","name":"Super Mario 64","platform":"N64","type":"game","condition_guess":"loose","variant":"Standard","loose_price":35,"cib_price":80,"new_price":400,"weight":"4oz","confidence":"high","notes":""}]

Valid platforms: ${PLATFORMS.join(', ')}
Valid weights: ${WEIGHTS.join(', ')}
Valid types: game, console, accessory
Valid conditions: loose, cib, sealed

Price guidelines (2025 market):
- Common: $5-15
- Popular: $15-40
- Uncommon: $40-80
- Rare: $80-200
- Grails: $200+

If you cannot identify any games, return exactly: []

IMPORTANT: Return ONLY the JSON array. No markdown, no explanation, no code blocks.`

// Valid media types for images
const VALID_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Handle CORS with origin validation
  const origin = req.headers.origin as string | undefined
  const allowedOrigin = getCorsOrigin(origin)

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limiting
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown'

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a minute before scanning again.'
    })
  }

  // Authentication: Verify Supabase JWT
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = authHeader.replace('Bearer ', '')

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  // Check for API key
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const { image, mediaType } = req.body

    // Validate input
    if (!image) {
      return res.status(400).json({ error: 'No image provided' })
    }

    if (!mediaType || !VALID_MEDIA_TYPES.includes(mediaType)) {
      return res.status(400).json({ error: 'Invalid or missing media type' })
    }

    // Basic base64 validation
    if (typeof image !== 'string' || image.length < 100) {
      return res.status(400).json({ error: 'Invalid image data' })
    }

    // Call Claude Vision API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: image,
                },
              },
              {
                type: 'text',
                text: SCAN_PROMPT,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', response.status, errorText)

      if (response.status === 429) {
        return res.status(429).json({ error: 'Too many requests. Please wait a moment.' })
      }

      return res.status(500).json({ error: 'AI service error' })
    }

    const result = await response.json()

    // Extract text from Claude response
    const textContent = result.content?.find((c: { type: string }) => c.type === 'text')
    if (!textContent?.text) {
      return res.status(500).json({ error: 'Invalid response from AI' })
    }

    // Parse JSON from response
    let items = []
    try {
      // Try direct parse first
      items = JSON.parse(textContent.text)
    } catch {
      // Try to extract JSON from markdown code block
      const jsonMatch = textContent.text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        try {
          items = JSON.parse(jsonMatch[1])
        } catch {
          console.error('Failed to parse JSON from code block')
        }
      }

      // Try to find array in text if items is still empty
      if (!Array.isArray(items) || items.length === 0) {
        const arrayMatch = textContent.text.match(/\[[\s\S]*\]/)
        if (arrayMatch) {
          try {
            items = JSON.parse(arrayMatch[0])
          } catch {
            console.error('Failed to parse JSON from array match')
          }
        }
      }
    }

    // Ensure items is an array
    if (!Array.isArray(items)) {
      items = []
    }

    // Return response
    return res.status(200).json({
      items,
      provider: 'claude',
    })
  } catch (error) {
    console.error('Scan error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
