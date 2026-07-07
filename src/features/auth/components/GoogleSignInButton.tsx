/**
 * GoogleSignInButton — renders Google's own Sign-In widget via Google
 * Identity Services (GIS) and completes sign-in through
 * `supabase.auth.signInWithIdToken`.
 *
 * Runs entirely client-side (script tag + ID token exchanged directly with
 * Google), so no redirect ever touches Supabase's hosted `*.supabase.co`
 * domain — see docs/FEATURES.md §1.
 */

import { useEffect, useRef, useState } from 'react'
import type { CredentialResponse } from 'google-one-tap'
import { toast } from 'sonner'

import { signInWithGoogleIdToken } from '@/features/auth/authService'
import { t } from '@/lib/constants/strings'

declare const google: { accounts: { id: typeof import('google-one-tap').accounts.id } }

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

let gisScriptPromise: Promise<void> | null = null

function loadGisScript(): Promise<void> {
  if (gisScriptPromise) return gisScriptPromise

  gisScriptPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = GIS_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })

  return gisScriptPromise
}

/** Raw + SHA-256-hashed nonce, per Supabase's documented signInWithIdToken flow. */
async function generateNonce(): Promise<[raw: string, hashed: string]> {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  const hashed = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return [raw, hashed]
}

export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null)
  const signingInRef = useRef(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function handleCredentialResponse(response: CredentialResponse, nonce: string) {
      if (signingInRef.current) return
      signingInRef.current = true
      setLoading(true)
      try {
        const { error } = await signInWithGoogleIdToken(response.credential, nonce)
        if (error) toast.error(t.auth.googleSignInError)
        // On success, onAuthStateChange updates the session and LoginPage's
        // effect navigates to /home — no further action needed here.
      } catch {
        toast.error(t.auth.genericError)
      } finally {
        signingInRef.current = false
        setLoading(false)
      }
    }

    async function init() {
      const [nonce, hashedNonce] = await generateNonce()
      await loadGisScript()
      if (cancelled || !containerRef.current) return

      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => handleCredentialResponse(response, nonce),
        nonce: hashedNonce,
        use_fedcm_for_prompt: true,
      })

      google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: Math.min(containerRef.current.clientWidth, 400),
      })
    }

    init()

    return () => {
      cancelled = true
      // Release GIS's reference to this instance's callback (which closes
      // over a nonce scoped to this mount) so a late/stale prompt can't fire
      // signInWithGoogleIdToken again after unmount.
      if (typeof google !== 'undefined') {
        google.accounts.id.cancel()
      }
    }
  }, [])

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div ref={containerRef} className="flex w-full justify-center" aria-label={t.auth.continueWithGoogle} />
      {loading && <span className="text-muted-foreground text-xs">{t.common.loading}</span>}
    </div>
  )
}
