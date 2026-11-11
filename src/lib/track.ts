import { track as vercelTrack } from '@vercel/analytics';

/**
 * Product analytics events (Vercel Web Analytics). The funnel:
 * home_viewed → onboarding_done → tour_started → tour_completed → arch_opened / basics_opened → contact_clicked.
 * Never throws: analytics must not break the app.
 */
export type EventName =
  | 'home_viewed'
  | 'home_cta'
  | 'onboarding_done'
  | 'tour_started'
  | 'tour_completed'
  | 'arch_opened'
  | 'basics_opened'
  | 'contact_clicked'
  | 'focus_toggled'
  | 'break_it_failed'
  | 'predict_answered'
  | 'daily_done'
  | 'certificate_downloaded'
  | 'tutor_asked'
  | 'shared'
  | 'agentdecode_clicked';

export function track(name: EventName, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(name, props);
  } catch {
    /* ignore */
  }
}
