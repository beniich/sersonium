// Stub TypeScript declarations pour firebase/app, firebase/firestore, firebase/auth
// Ces packages sont présents dans node_modules/firebase/* mais leurs sous-packages
// @firebase/* ne sont pas disponibles au niveau flat node_modules.

// ──────────────────────────────────────────────
// firebase/app
// ──────────────────────────────────────────────
declare module 'firebase/app' {
  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
    [key: string]: any;
  }
  export interface FirebaseApp {
    name: string;
    options: FirebaseOptions;
    automaticDataCollectionEnabled: boolean;
  }
  export function initializeApp(options: FirebaseOptions, name?: string): FirebaseApp;
  export function getApp(name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function deleteApp(app: FirebaseApp): Promise<void>;
}

// ──────────────────────────────────────────────
// firebase/firestore
// ──────────────────────────────────────────────
declare module 'firebase/firestore' {
  import type { FirebaseApp } from 'firebase/app';

  export interface Firestore { [key: string]: any; }
  export interface DocumentReference<T = any> { id: string; path: string; [key: string]: any; }
  export interface CollectionReference<T = any> { id: string; path: string; [key: string]: any; }
  export interface DocumentSnapshot<T = any> {
    id: string;
    exists(): boolean;
    data(): T | undefined;
    [key: string]: any;
  }
  export interface QuerySnapshot<T = any> {
    docs: DocumentSnapshot<T>[];
    empty: boolean;
    size: number;
    forEach(callback: (doc: DocumentSnapshot<T>) => void): void;
    [key: string]: any;
  }
  export interface Query<T = any> { [key: string]: any; }
  export interface QueryConstraint { [key: string]: any; }
  export interface FieldValue { [key: string]: any; }
  export interface Timestamp { seconds: number; nanoseconds: number; toDate(): Date; }
  export type Unsubscribe = () => void;

  export function getFirestore(app?: FirebaseApp, databaseId?: string): Firestore;
  export function collection(firestore: Firestore, path: string, ...pathSegments: string[]): CollectionReference;
  export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference;
  export function doc(ref: CollectionReference, ...pathSegments: string[]): DocumentReference;
  export function addDoc<T>(reference: CollectionReference<T>, data: T): Promise<DocumentReference<T>>;
  export function setDoc<T>(reference: DocumentReference<T>, data: T, options?: any): Promise<void>;
  export function updateDoc(reference: DocumentReference, data: Record<string, any>): Promise<void>;
  export function deleteDoc(reference: DocumentReference): Promise<void>;
  export function getDoc<T>(reference: DocumentReference<T>): Promise<DocumentSnapshot<T>>;
  export function getDocs<T>(query: Query<T> | CollectionReference<T>): Promise<QuerySnapshot<T>>;
  export function onSnapshot<T>(reference: DocumentReference<T> | Query<T> | CollectionReference<T>, observer: (snapshot: any) => void, onError?: (error: any) => void): Unsubscribe;
  export function query<T>(reference: CollectionReference<T> | Query<T>, ...queryConstraints: QueryConstraint[]): Query<T>;
  export function where(fieldPath: string, opStr: string, value: any): QueryConstraint;
  export function orderBy(fieldPath: string, directionStr?: 'asc' | 'desc'): QueryConstraint;
  export function limit(limit: number): QueryConstraint;
  export function limitToLast(limit: number): QueryConstraint;
  export function startAfter(...fieldValues: any[]): QueryConstraint;
  export function endBefore(...fieldValues: any[]): QueryConstraint;
  export function serverTimestamp(): FieldValue;
  export function arrayUnion(...elements: any[]): FieldValue;
  export function arrayRemove(...elements: any[]): FieldValue;
  export function increment(n: number): FieldValue;
  export function deleteField(): FieldValue;
  export function Timestamp(seconds: number, nanoseconds: number): Timestamp;
  export function writeBatch(firestore: Firestore): any;
  export function runTransaction<T>(firestore: Firestore, updateFunction: (transaction: any) => Promise<T>): Promise<T>;
  export function connectFirestoreEmulator(firestore: Firestore, host: string, port: number): void;
  export function enableIndexedDbPersistence(firestore: Firestore): Promise<void>;
}

// ──────────────────────────────────────────────
// firebase/auth
// ──────────────────────────────────────────────
declare module 'firebase/auth' {
  import type { FirebaseApp } from 'firebase/app';

  export interface Auth { [key: string]: any; signOut(): Promise<void>; }
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
    getIdToken(forceRefresh?: boolean): Promise<string>;
    [key: string]: any;
  }
  export interface UserCredential { user: User; [key: string]: any; }
  export interface AuthProvider { [key: string]: any; }
  export interface OAuthCredential { accessToken?: string; [key: string]: any; }
  export type Unsubscribe = () => void;

  export class GoogleAuthProvider implements AuthProvider {
    static PROVIDER_ID: string;
    static credentialFromResult(userCredential: UserCredential): OAuthCredential | null;
    static credentialFromError(error: any): OAuthCredential | null;
    addScope(scope: string): GoogleAuthProvider;
    setCustomParameters(params: Record<string, string>): GoogleAuthProvider;
  }

  export function getAuth(app?: FirebaseApp): Auth;
  export function signInWithPopup(auth: Auth, provider: AuthProvider): Promise<UserCredential>;
  export function signInWithRedirect(auth: Auth, provider: AuthProvider): Promise<never>;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: (user: User | null) => void, error?: (error: any) => void): Unsubscribe;
  export function getRedirectResult(auth: Auth): Promise<UserCredential | null>;
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>;
  export function updateProfile(user: User, profile: { displayName?: string; photoURL?: string }): Promise<void>;
  export function connectAuthEmulator(auth: Auth, url: string): void;
}
