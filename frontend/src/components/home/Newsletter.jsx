import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { newsletterService } from '../../services/newsletterService';
import { siteConfig } from '../../config/siteConfig';
import Button from '../common/Button';

/**
 * Section 8: Newsletter Subscription
 * Alternates to Soft Ivory background.
 * Validates email, communicates through newsletterService, accurately handles loading, error, and backend unavailable states.
 */
export const Newsletter = () => {
  const { newsletter } = siteConfig;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error' | 'notice'
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      setFeedbackMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(email.trim())) {
      setStatus('error');
      setFeedbackMessage('Please provide a valid email format (e.g. name@domain.com).');
      return;
    }

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const response = await newsletterService.subscribe(email.trim());

      if (response.success) {
        setStatus('success');
        setFeedbackMessage(response.message || 'Thank you for subscribing.');
        setEmail('');
      } else {
        // Transparent handling: do not display a false success message
        setStatus('notice');
        setFeedbackMessage(response.message || 'Subscription endpoint awaiting backend connection.');
      }
    } catch {
      setStatus('error');
      setFeedbackMessage('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <section
      aria-label="Newsletter Subscription"
      className="py-16 md:py-24 bg-luxury-ivory-light border-b border-luxury-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center bg-luxury-white border border-luxury-border p-8 sm:p-12 shadow-subtle relative">
          {/* Subtle inner decorative frame */}
          <div className="absolute inset-2 sm:inset-3 border border-luxury-border/40 pointer-events-none" />

          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-luxury-ivory flex items-center justify-center text-luxury-text-primary mx-auto mb-4">
              <Mail className="w-4 h-4 stroke-[1.5]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-luxury-text-primary mb-3">
              {newsletter.heading}
            </h2>

            <p className="text-xs sm:text-sm text-luxury-text-secondary leading-relaxed mb-8 max-w-md mx-auto font-sans">
              {newsletter.subheading}
            </p>

            <form onSubmit={handleSubmit} noValidate className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status !== 'idle') setStatus('idle');
                    }}
                    placeholder={newsletter.placeholder}
                    disabled={status === 'loading'}
                    className={`
                      w-full px-4 py-3.5 text-xs sm:text-sm font-sans
                      bg-luxury-ivory-light border text-luxury-text-primary
                      placeholder-luxury-text-secondary/70 focus:outline-none transition-colors
                      ${
                        status === 'error'
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-luxury-border focus:border-luxury-text-primary'
                      }
                    `}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={status === 'loading'}
                  loading={status === 'loading'}
                  className="whitespace-nowrap"
                >
                  {newsletter.buttonText}
                </Button>
              </div>

              {/* Status and Feedback Messages */}
              {status === 'error' && (
                <div className="mt-4 flex items-center justify-center text-xs text-red-600 font-sans">
                  <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              {status === 'success' && (
                <div className="mt-4 flex items-center justify-center text-xs text-emerald-700 font-sans">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              {status === 'notice' && (
                <div className="mt-4 flex items-center justify-center text-xs text-luxury-text-secondary font-sans bg-luxury-ivory/60 p-2.5 border border-luxury-border">
                  <AlertCircle className="w-4 h-4 mr-1.5 text-luxury-text-primary flex-shrink-0" />
                  <span>{feedbackMessage}</span>
                </div>
              )}
            </form>

            <p className="mt-6 text-[10px] uppercase tracking-widest text-luxury-text-secondary/80">
              Privacy respected. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
