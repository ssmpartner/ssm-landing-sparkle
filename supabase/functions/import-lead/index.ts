import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const QUELLE_LABEL: Record<string, string> = {
  meta: 'Meta (Facebook / Instagram)',
  tiktok: 'TikTok Ads',
}

// Try many common field names Zapier might send
function pick(body: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    for (const bk of Object.keys(body)) {
      if (bk.toLowerCase().replace(/[\s_-]/g, '') === k.toLowerCase().replace(/[\s_-]/g, '')) {
        const v = body[bk]
        if (v !== null && v !== undefined && String(v).trim() !== '') return String(v).trim()
      }
    }
  }
  return ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const provider = (url.searchParams.get('provider') || '').toLowerCase()
    const token = url.searchParams.get('token') || ''

    if (!provider || !QUELLE_LABEL[provider]) {
      return new Response(JSON.stringify({ error: 'Invalid or missing provider' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { data: integration, error: intErr } = await supabase
      .from('integrations')
      .select('id, webhook_token, connected')
      .eq('provider', provider)
      .maybeSingle()

    if (intErr || !integration || integration.webhook_token !== token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let body: Record<string, unknown> = {}
    try {
      body = await req.json()
    } catch {
      body = {}
    }

    // Support Zapier "test" pings
    const isTest = body?.test === true || url.searchParams.get('test') === '1'

    const vorname = pick(body, ['vorname', 'firstname', 'first_name', 'given_name'])
    const nachname = pick(body, ['nachname', 'lastname', 'last_name', 'family_name', 'surname'])
    const fullName = pick(body, ['name', 'fullname', 'full_name'])
    const email = pick(body, ['email', 'emailadresse', 'e_mail', 'mail'])
    const telefon = pick(body, ['telefon', 'phone', 'phonenumber', 'phone_number', 'mobile', 'handy'])
    const plz = pick(body, ['plz', 'zip', 'zipcode', 'postal_code', 'postleitzahl'])
    const ort = pick(body, ['ort', 'city', 'stadt', 'town'])

    let vn = vorname
    let nn = nachname
    if (!vn && !nn && fullName) {
      const parts = fullName.split(/\s+/)
      vn = parts.shift() || ''
      nn = parts.join(' ')
    }

    if (isTest) {
      return new Response(
        JSON.stringify({ ok: true, message: 'Test empfangen', provider, connected: integration.connected }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { data: lead, error: insErr } = await supabase
      .from('leads')
      .insert({
        vorname: vn,
        nachname: nn,
        email,
        telefon,
        plz,
        ort,
        quelle: QUELLE_LABEL[provider],
        status: 'neu',
      })
      .select('id')
      .single()

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase.from('lead_activities').insert({
      lead_id: lead.id,
      type: 'import',
      description: `Lead automatisch importiert via ${QUELLE_LABEL[provider]} (Zapier)`,
      actor: 'Zapier',
    })

    return new Response(JSON.stringify({ ok: true, lead_id: lead.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
