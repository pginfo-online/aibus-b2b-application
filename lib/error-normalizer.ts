// ---------------------------------------------------------------------------
// AiBus B2B Agent Portal — Centralized Error Normalizer
// Source of truth: ERROR_TAXONOMY.md
// Translates raw network/HTTP errors into typed, safe, actionable domain errors.
// ---------------------------------------------------------------------------

export type DomainErrorCategory =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'BUSINESS_RULE'
  | 'PAYMENT'
  | 'RATE_LIMIT'
  | 'PROVIDER'
  | 'SERVER';

export interface LocalizedMessage {
  en: string;
  hi: string;
  mr: string;
}

export class NormalizedApiError extends Error {
  public category: DomainErrorCategory;
  public status: number;
  public code: string;
  public localizedMessage: LocalizedMessage;
  public safeToRetry: boolean;
  public details?: unknown;

  constructor(params: {
    message: string;
    category: DomainErrorCategory;
    status: number;
    code: string;
    localizedMessage: LocalizedMessage;
    safeToRetry: boolean;
    details?: unknown;
  }) {
    super(params.message);
    this.name = 'NormalizedApiError';
    this.category = params.category;
    this.status = params.status;
    this.code = params.code;
    this.localizedMessage = params.localizedMessage;
    this.safeToRetry = params.safeToRetry;
    this.details = params.details;
  }
}

export function normalizeError(error: unknown, _language: 'en' | 'hi' | 'mr' = 'en'): NormalizedApiError {
  if (error instanceof NormalizedApiError) {
    return error;
  }

  // Handle Fetch/AbortError/Timeout
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new NormalizedApiError({
      message: 'Request timed out or was cancelled',
      category: 'TIMEOUT',
      status: 408,
      code: 'TIMEOUT',
      localizedMessage: {
        en: 'The request took too long. Please try again.',
        hi: 'अनुरोध में बहुत समय लग रहा है। कृपया पुनः प्रयास करें।',
        mr: 'विनंतीला खूप वेळ लागला. कृपया पुन्हा प्रयत्न करा.',
      },
      safeToRetry: true,
    });
  }

  // Handle offline / network drop
  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return new NormalizedApiError({
      message: 'No internet connection',
      category: 'NETWORK',
      status: 0,
      code: 'NETWORK_DISCONNECTED',
      localizedMessage: {
        en: 'No internet connection. Please check your network and try again.',
        hi: 'इंटरनेट कनेक्शन नहीं है। कृपया अपना नेटवर्क जांचें और पुनः प्रयास करें।',
        mr: 'इंटरनेट कनेक्शन नाही. कृपया तुमचे नेटवर्क तपासा आणि पुन्हा प्रयत्न करा.',
      },
      safeToRetry: true,
    });
  }

  // Handle standard HTTP / API Error shapes
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    const status = typeof err.status === 'number' ? err.status : 500;
    const errObj = (err.error && typeof err.error === 'object' ? err.error : {}) as Record<string, unknown>;
    const code = (typeof err.code === 'string' ? err.code : typeof errObj.code === 'string' ? errObj.code : 'ERROR');
    const serverMessage = (typeof err.message === 'string' ? err.message : typeof errObj.message === 'string' ? errObj.message : '');

    // Error taxonomy matching
    switch (code) {
      case 'AUTH_INVALID':
      case 'AUTHENTICATION_ERROR':
        return new NormalizedApiError({
          message: serverMessage || 'Incorrect email or password',
          category: 'AUTHENTICATION',
          status: 401,
          code: 'AUTH_INVALID',
          localizedMessage: {
            en: serverMessage || 'Incorrect email or password. Please check your credentials.',
            hi: 'गलत ईमेल या पासवर्ड। कृपया अपना विवरण जांचें।',
            mr: 'चुकीचा ईमेल किंवा पासवर्ड. कृपया तुमचे तपशील तपासा.',
          },
          safeToRetry: false,
          details: err.details,
        });

      case 'AUTH_EXPIRED':
      case 'TOKEN_EXPIRED':
        return new NormalizedApiError({
          message: 'Session expired',
          category: 'AUTHENTICATION',
          status: 401,
          code: 'AUTH_EXPIRED',
          localizedMessage: {
            en: 'Your session has expired. Please log in again.',
            hi: 'आपका सत्र समाप्त हो गया है। कृपया पुनः लॉग इन करें।',
            mr: 'तुमचे सत्र कालबाह्य झाले आहे. कृपया पुन्हा लॉगिन करा.',
          },
          safeToRetry: false,
        });

      case 'AUTH_FORBIDDEN':
      case 'AUTHORIZATION_ERROR':
        return new NormalizedApiError({
          message: serverMessage || 'Access denied',
          category: 'AUTHORIZATION',
          status: 403,
          code: 'AUTH_FORBIDDEN',
          localizedMessage: {
            en: serverMessage || 'You do not have permission to perform this action.',
            hi: 'आपके पास यह कार्रवाई करने की अनुमति नहीं है।',
            mr: 'तुम्हाला ही क्रिया करण्याची परवानगी नाही.',
          },
          safeToRetry: false,
          details: err.details,
        });

      case 'SEAT_NOT_AVAILABLE':
      case 'SEAT_CONFLICT':
        return new NormalizedApiError({
          message: serverMessage || 'Selected seats are no longer available',
          category: 'CONFLICT',
          status: 409,
          code: 'SEAT_NOT_AVAILABLE',
          localizedMessage: {
            en: 'One or more selected seats were just taken. Please choose other seats.',
            hi: 'चयनित सीटों में से कुछ सीटें बुक हो चुकी हैं। कृपया दूसरी सीटें चुनें।',
            mr: 'निवडलेल्या जागांपैकी काही जागा बुक झाल्या आहेत. कृपया इतर जागा निवडा.',
          },
          safeToRetry: false,
          details: err.details,
        });

      case 'SEAT_HOLD_EXPIRED':
        return new NormalizedApiError({
          message: 'Seat hold has expired',
          category: 'CONFLICT',
          status: 410,
          code: 'SEAT_HOLD_EXPIRED',
          localizedMessage: {
            en: 'Your seat hold time has expired (10-minute limit). Please select your seats again.',
            hi: 'सीट होल्ड का समय समाप्त हो गया है। कृपया पुनः सीटें चुनें।',
            mr: 'जागा धरून ठेवण्याची मुदत संपली आहे. कृपया पुन्हा जागा निवडा.',
          },
          safeToRetry: false,
        });

      case 'RATE_LIMITED':
        return new NormalizedApiError({
          message: 'Too many requests',
          category: 'RATE_LIMIT',
          status: 429,
          code: 'RATE_LIMITED',
          localizedMessage: {
            en: 'Too many requests. Please wait a moment before trying again.',
            hi: 'बहुत सारे अनुरोध। कृपया कुछ समय बाद पुनः प्रयास करें।',
            mr: 'खूप साऱ्या विनंत्या. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.',
          },
          safeToRetry: true,
        });

      default:
        if (status === 400 || status === 422) {
          return new NormalizedApiError({
            message: serverMessage || 'Please verify the information entered',
            category: 'VALIDATION',
            status,
            code: 'VALIDATION_ERROR',
            localizedMessage: {
              en: serverMessage || 'Please verify the information entered.',
              hi: serverMessage || 'कृपया दर्ज की गई जानकारी सत्यापित करें।',
              mr: serverMessage || 'कृपया प्रविष्ट केलेली माहिती तपासा.',
            },
            safeToRetry: false,
            details: err.details,
          });
        }

        if (status === 504 || status === 502) {
          return new NormalizedApiError({
            message: 'Provider service slow or unavailable',
            category: 'PROVIDER',
            status,
            code: 'PROVIDER_TIMEOUT',
            localizedMessage: {
              en: 'The bus operator service is currently responding slowly. Please try again.',
              hi: 'बस ऑपरेटर की सेवा वर्तमान में धीमी है। कृपया पुनः प्रयास करें।',
              mr: 'बस ऑपरेटरची सेवा सध्या संथ आहे. कृपया पुन्हा प्रयत्न करा.',
            },
            safeToRetry: false,
          });
        }
    }
  }

  // Generic fallback
  return new NormalizedApiError({
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    category: 'SERVER',
    status: 500,
    code: 'INTERNAL_ERROR',
    localizedMessage: {
      en: 'An unexpected problem occurred. Please check your connection and try again.',
      hi: 'एक अप्रत्याशित समस्या उत्पन्न हुई। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।',
      mr: 'एक अनपेक्षित समस्या उद्भवली. कृपया तुमचे कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.',
    },
    safeToRetry: false,
  });
}
