import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  getDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Prompt, Comment } from '../types';
import initialPrompts from '../data/prompts.json';
import { sha256 } from '../utils/security';

let isListeningPrompts = false;
let isListeningComments = false;

export function initPromptsSync(onUpdate: (prompts: Prompt[]) => void) {
  if (isListeningPrompts) return () => {};
  isListeningPrompts = true;

  const promptsCol = collection(db, 'prompts');

  const unsubscribe = onSnapshot(
    promptsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        // Initial auto-seed if cloud database is fresh
        try {
          const seeds = initialPrompts as Prompt[];
          for (const p of seeds) {
            await setDoc(doc(db, 'prompts', p.id), p);
          }
        } catch (err) {
          console.warn('Auto-seed notice:', err);
        }
        return;
      }

      const list: Prompt[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Prompt);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'prompts');
    }
  );

  return unsubscribe;
}

export function initCommentsSync(onUpdate: (comments: Comment[]) => void) {
  if (isListeningComments) return () => {};
  isListeningComments = true;

  const commentsCol = collection(db, 'comments');

  const unsubscribe = onSnapshot(
    commentsCol,
    (snapshot) => {
      const list: Comment[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Comment);
      });
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    }
  );

  return unsubscribe;
}

export async function savePromptToCloud(prompt: Prompt) {
  try {
    await setDoc(doc(db, 'prompts', prompt.id), prompt);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `prompts/${prompt.id}`);
  }
}

export async function deletePromptFromCloud(promptId: string) {
  try {
    await deleteDoc(doc(db, 'prompts', promptId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `prompts/${promptId}`);
  }
}

export async function saveCommentToCloud(comment: Comment) {
  try {
    await setDoc(doc(db, 'comments', comment.id), comment);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `comments/${comment.id}`);
  }
}

export async function deleteCommentFromCloud(commentId: string) {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `comments/${commentId}`);
  }
}

export function subscribeToUserFavorites(userId: string, onUpdate: (favIds: string[]) => void) {
  const path = `users/${userId}/favorites`;
  const favsCol = collection(db, 'users', userId, 'favorites');

  return onSnapshot(
    favsCol,
    (snapshot) => {
      const favPromptIds: string[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.promptId) favPromptIds.push(data.promptId);
      });
      onUpdate(favPromptIds);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function toggleFavoriteInCloud(userId: string, promptId: string, isFav: boolean) {
  const favDoc = doc(db, 'users', userId, 'favorites', promptId);
  try {
    if (isFav) {
      await deleteDoc(favDoc);
    } else {
      await setDoc(favDoc, {
        userId,
        promptId,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/favorites/${promptId}`);
  }
}

export const ADMIN_SECURITY_KEY_HASH = 'a6734d12bdf2a621d228310b02bc046cd965a197353c51d2574d082a9b03b6cb';

export async function verifyAdminKeyInFirestore(inputKey: string): Promise<boolean> {
  try {
    const inputHash = await sha256(inputKey);
    const configDocRef = doc(db, 'config', 'admin');
    const snap = await getDoc(configDocRef);

    if (!snap.exists()) {
      // Seed SHA-256 hash in the database, avoiding plaintext credential storage
      await setDoc(configDocRef, {
        adminHash: ADMIN_SECURITY_KEY_HASH,
        updatedAt: new Date().toISOString()
      });
      return inputHash === ADMIN_SECURITY_KEY_HASH;
    }

    const data = snap.data();
    const storedHash = data?.adminHash;

    if (!storedHash) {
      await setDoc(configDocRef, {
        adminHash: ADMIN_SECURITY_KEY_HASH,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return inputHash === ADMIN_SECURITY_KEY_HASH;
    }

    return inputHash === storedHash;
  } catch (error) {
    console.error('Error verifying admin key in Firestore:', error);
    const inputHash = await sha256(inputKey);
    return inputHash === ADMIN_SECURITY_KEY_HASH;
  }
}

