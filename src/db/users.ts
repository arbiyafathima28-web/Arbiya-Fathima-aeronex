import { db } from "./index.ts";
import { users, fareObservations, userSavedRoutes } from "./schema.ts";
import { eq, desc } from "drizzle-orm";

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || "Econometric Researcher",
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || "Econometric Researcher",
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database user query failed:", error);
    throw new Error("Database user query failed. Please try again later.", { cause: error });
  }
}

export async function recordFareObservation(data: {
  route: string;
  flightNo: string;
  airline: string;
  fare: number;
  advanceDays: number;
  dynamicMultiplier: number;
  taxAmount?: number;
  source: string;
}) {
  try {
    const result = await db.insert(fareObservations).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("Failed to record fare observation in Cloud SQL:", error);
    throw new Error("Failed to record fare observation. Please try again later.", { cause: error });
  }
}

export async function getRecentFareObservations(limitCount = 20) {
  try {
    return await db.select().from(fareObservations).orderBy(desc(fareObservations.observedAt)).limit(limitCount);
  } catch (error) {
    console.error("Failed to query fare observations from Cloud SQL:", error);
    throw new Error("Failed to query fare observations from Cloud SQL.", { cause: error });
  }
}

export async function saveUserRoute(userId: number, routeId: string, notes?: string) {
  try {
    const result = await db.insert(userSavedRoutes).values({
      userId,
      routeId,
      notes,
    }).returning();
    return result[0];
  } catch (error) {
    console.error("Failed to save user route in Cloud SQL:", error);
    throw new Error("Failed to save user route.", { cause: error });
  }
}

export async function getUserSavedRoutes(userId: number) {
  try {
    return await db.select().from(userSavedRoutes).where(eq(userSavedRoutes.userId, userId));
  } catch (error) {
    console.error("Failed to fetch saved user routes:", error);
    throw new Error("Failed to fetch saved routes.", { cause: error });
  }
}
