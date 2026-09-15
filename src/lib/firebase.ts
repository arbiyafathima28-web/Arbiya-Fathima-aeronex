import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with specific databaseId (CRITICAL per guidelines)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Operation Types for Hardened Error Handling
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on application boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration (client is offline).");
    }
    return false;
  }
}

// Sign in with Google Popup
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (user) {
      // Sync user profile in Firestore safely
      const userRef = doc(db, "users", user.uid);
      try {
        const existingSnap = await getDoc(userRef);
        const existingData = existingSnap.exists() ? existingSnap.data() : null;
        const userProfilePayload = {
          userId: user.uid,
          email: user.email || "",
          displayName: user.displayName || "Economist Researcher",
          photoURL: (user.photoURL || "").slice(0, 900),
          preferredMethod: existingData?.preferredMethod || "fisher",
          role: existingData?.role || "Econometric Research Fellow",
          createdAt: existingData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, userProfilePayload, { merge: true });
      } catch (err) {
        console.warn("User profile sync deferred:", err);
      }
    }
    return user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
}

// User-authored Simulation Scenario Persistence
export interface SavedSimulationDoc {
  id: string;
  userId: string;
  title: string;
  fuelShockPercent: number;
  capRule: string;
  festivalSurge: number;
  capacityShock: number;
  cpiBasisPointsImpact: number;
  nationalSurplusShiftCr: number;
  createdAt: string;
}

export async function saveUserSimulation(
  userId: string,
  data: Omit<SavedSimulationDoc, "userId">
): Promise<void> {
  const docPath = `users/${userId}/simulations/${data.id}`;
  try {
    const docRef = doc(db, "users", userId, "simulations", data.id);
    await setDoc(docRef, { ...data, userId });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function getUserSimulations(userId: string): Promise<SavedSimulationDoc[]> {
  const colPath = `users/${userId}/simulations`;
  try {
    const colRef = collection(db, "users", userId, "simulations");
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => d.data() as SavedSimulationDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, colPath);
  }
}

export async function deleteUserSimulation(userId: string, simulationId: string): Promise<void> {
  const docPath = `users/${userId}/simulations/${simulationId}`;
  try {
    const docRef = doc(db, "users", userId, "simulations", simulationId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

// User-authored Saved Reports Persistence
export interface SavedReportDoc {
  id: string;
  userId: string;
  title: string;
  analysisType: string;
  content: string;
  createdAt: string;
}

export async function saveUserReport(
  userId: string,
  data: Omit<SavedReportDoc, "userId">
): Promise<void> {
  const docPath = `users/${userId}/savedReports/${data.id}`;
  try {
    const docRef = doc(db, "users", userId, "savedReports", data.id);
    await setDoc(docRef, { ...data, userId });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

export async function getUserReports(userId: string): Promise<SavedReportDoc[]> {
  const colPath = `users/${userId}/savedReports`;
  try {
    const colRef = collection(db, "users", userId, "savedReports");
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((d) => d.data() as SavedReportDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, colPath);
  }
}

export async function deleteUserReport(userId: string, reportId: string): Promise<void> {
  const docPath = `users/${userId}/savedReports/${reportId}`;
  try {
    const docRef = doc(db, "users", userId, "savedReports", reportId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

// Real-time listener for user saved items
export function subscribeToUserSimulations(
  userId: string,
  onData: (sims: SavedSimulationDoc[]) => void,
  onError?: (err: Error) => void
) {
  const colPath = `users/${userId}/simulations`;
  const colRef = collection(db, "users", userId, "simulations");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as SavedSimulationDoc);
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, colPath);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export function subscribeToUserReports(
  userId: string,
  onData: (reports: SavedReportDoc[]) => void,
  onError?: (err: Error) => void
) {
  const colPath = `users/${userId}/savedReports`;
  const colRef = collection(db, "users", userId, "savedReports");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as SavedReportDoc);
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, colPath);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}
