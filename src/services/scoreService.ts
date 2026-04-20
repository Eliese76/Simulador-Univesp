import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { LeaderboardEntry } from '../types';

const SCORES_COLLECTION = 'scores';

export const saveScore = async (score: number, correctCount: number, totalQuestions: number) => {
  if (!auth.currentUser) return null;

  const user = auth.currentUser;
  
  try {
    const docRef = await addDoc(collection(db, SCORES_COLLECTION), {
      userId: user.uid,
      userName: user.displayName || 'Anônimo',
      userEmail: user.email,
      score,
      correctCount,
      totalQuestions,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving score:", error);
    throw error;
  }
};

export const getLeaderboard = async () => {
  try {
    const q = query(
      collection(db, SCORES_COLLECTION),
      orderBy('score', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate()
      } as LeaderboardEntry);
    });
    
    return entries;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

export const getUserBestScore = async () => {
    if (!auth.currentUser) return null;
    
    try {
        const q = query(
            collection(db, SCORES_COLLECTION),
            where('userId', '==', auth.currentUser.uid),
            orderBy('score', 'desc'),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data();
        }
        return null;
    } catch (error) {
        console.error("Error fetching user best score:", error);
        return null;
    }
}
