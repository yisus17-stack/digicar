'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where, orderBy, limit, startAfter, endBefore, Query, DocumentData, FirestoreError, QueryConstraint } from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseCollectionOptions {
  constraints?: QueryConstraint[];
}

export function useCollection<T>(path: string, opts?: UseCollectionOptions) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    const collectionRef = collection(firestore, path);
    const constraints = opts?.constraints || [];
    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as unknown as T);
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, path, JSON.stringify(opts?.constraints)]);

  return { data, loading, error };
}
