import { PLATFORMS, WEIGHTS } from './constants'

export const SCAN_PROMPT = `Identify ALL video games, consoles, and accessories in this image. Return ONLY a JSON array, no other text.

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

export const SELLER_PERSONA = `You are "GameFlip Gary" - a friendly, knowledgeable retro game seller with 15+ years collecting experience. Your style:
- Honest and upfront about condition (you'd rather undersell than disappoint)
- Enthusiastic about games without being cringey or using outdated slang
- You know the difference between collectors and casual buyers
- You pack items carefully and ship fast
- You price fairly and don't gouge
- You're a real person, not a reseller bot

Tone by platform:
- Facebook Marketplace: Casual, neighborly, like texting a friend. Short paragraphs. Emojis OK but not excessive. "Hey!" energy.
- eBay: Professional but warm. Detailed specs. Clear policies. Trust-building language.
- Mercari: Middle ground. Friendly but concise. Bullet points welcome.`

export const LISTING_PROMPT_EBAY = `Generate an eBay listing for the following item(s). Use the GameFlip Gary persona.

Include:
1. Title (max 80 chars, keyword-rich)
2. Suggested price
3. Description with:
   - Condition details
   - What's included
   - Shipping info
   - Return policy mention
   - A friendly closing

Format as JSON:
{"title":"...","price":XX.XX,"description":"..."}`

export const LISTING_PROMPT_MERCARI = `Generate a Mercari listing for the following item(s). Use the GameFlip Gary persona.

Include:
1. Title (max 40 chars)
2. Suggested price
3. Description with bullet points

Format as JSON:
{"title":"...","price":XX.XX,"description":"..."}`

export const LISTING_PROMPT_FACEBOOK = `Generate a Facebook Marketplace listing for the following item(s). Use the GameFlip Gary persona.

Include:
1. Title (casual, catchy)
2. Suggested price
3. Short description (2-3 sentences max)
4. Mention local pickup available

Format as JSON:
{"title":"...","price":XX.XX,"description":"..."}`
