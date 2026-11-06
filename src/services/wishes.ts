import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export interface SubmitWishResult {
  success: boolean;
  docId?: string;
  error?: string;
}

/**
 * Submit a wish to Cloud Firestore collection 'wishes'
 * @param message The user's message (max 1000 characters)
 * @param includeTimestamp Whether to include serverTimestamp() (Option B) or message only (Option A)
 */
export async function submitWish(
  message: string,
  includeTimestamp: boolean = false
): Promise<SubmitWishResult> {
  const trimmed = message.trim();

  // 1. Validate not empty
  if (!trimmed) {
    return {
      success: false,
      error: 'Please write a message before sending.',
    };
  }

  // 2. Validate length
  if (trimmed.length > 1000) {
    return {
      success: false,
      error: 'Message exceeds the 1000 character limit.',
    };
  }

  if (!isFirebaseConfigured() || !db) {
    return {
      success: false,
      error:
        'Firebase is not yet configured with an API key. Please add your web configuration to continue.',
    };
  }

  try {
    const wishesRef = collection(db, 'wishes');

    // Document payload
    // Note: If security rules only allow 'message', payload must not include 'createdAt'
    const payload = includeTimestamp
      ? {
          message: trimmed,
          createdAt: serverTimestamp(),
        }
      : {
          message: trimmed,
        };

    const docRef = await addDoc(wishesRef, payload);

    return {
      success: true,
      docId: docRef.id,
    };
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    console.error('Error submitting wish to Firestore:', err);

    if (errorObj?.code === 'permission-denied') {
      return {
        success: false,
        error:
          'Submission rejected by Firestore security rules. If your rules strictly require only the `message` field, ensure no other fields are sent.',
      };
    }

    return {
      success: false,
      error:
        errorObj?.message ||
        'Unable to send wish right now. Please check your internet connection and try again.',
    };
  }
}

/**
 * Submit Bannu's private birthday wish to Cloud Firestore collection 'p_wishes'
 * @param message The user's birthday wish
 */
export async function submitBirthdayWish(message: string): Promise<SubmitWishResult> {
  const trimmed = message.trim();

  // Validate non-empty
  if (!trimmed) {
    return {
      success: false,
      error: 'Please write your wish before proceeding ❤️',
    };
  }

  if (trimmed.length > 2000) {
    return {
      success: false,
      error: 'Birthday wish exceeds character limit.',
    };
  }

  if (!isFirebaseConfigured() || !db) {
    return {
      success: false,
      error: 'Firebase is not initialized with a valid configuration.',
    };
  }

  try {
    // Strictly collection 'p_wishes' (NEVER 'wishes')
    const pWishesRef = collection(db, 'p_wishes');

    // Strictly field 'message' only
    const docRef = await addDoc(pWishesRef, {
      message: trimmed,
    });

    return {
      success: true,
      docId: docRef.id,
    };
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    console.error('Error submitting birthday wish to p_wishes:', err);

    if (errorObj?.code === 'permission-denied') {
      return {
        success: false,
        error:
          'Firestore security rule rejected creation in "p_wishes". Please ensure allow create is granted in Firestore rules.',
      };
    }

    return {
      success: false,
      error: errorObj?.message || 'Unable to submit birthday wish right now.',
    };
  }
}

/**
 * Test helper to verify public read restrictions on 'wishes' collection
 * Should be rejected by Firestore security rules if rules are configured properly.
 */
export async function verifyPublicReadRejected(): Promise<{
  rejected: boolean;
  reason?: string;
}> {
  if (!db) return { rejected: true, reason: 'Firestore not initialized' };

  try {
    const q = query(collection(db, 'wishes'), limit(1));
    await getDocs(q);
    // If it succeeded, reads are NOT restricted!
    return {
      rejected: false,
      reason: 'Public read succeeded! Security rules allow public read on wishes.',
    };
  } catch (err: unknown) {
    const errorObj = err as { code?: string };
    if (errorObj?.code === 'permission-denied') {
      return {
        rejected: true,
        reason: 'Public read properly rejected with permission-denied.',
      };
    }
    return {
      rejected: true,
      reason: `Read rejected with: ${errorObj?.code || 'error'}`,
    };
  }
}
