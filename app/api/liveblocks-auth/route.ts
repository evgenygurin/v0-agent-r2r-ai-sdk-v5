import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

/**
 * Liveblocks Authentication Endpoint
 *
 * This endpoint authenticates users and provides access tokens for Liveblocks rooms.
 *
 * Security:
 * - In production, implement proper user authentication (JWT, session, etc.)
 * - Validate user permissions before granting room access
 * - Use environment variable for secret key
 *
 * @see https://liveblocks.io/docs/authentication
 */

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    // Get user info from your authentication system
    // For demo purposes, we'll use a simple session/cookie check
    // In production, replace this with your actual auth logic

    const { room } = await request.json();

    // TODO: Replace with your actual authentication logic
    // Example: const session = await getSession(request)
    // if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    // For demo, generate a random user ID
    // In production, use the actual authenticated user ID
    const userId = `user-${Math.random().toString(36).substring(7)}`;
    const userName = `User ${userId.substring(5, 9)}`;

    // Prepare Liveblocks session with user info
    const session = liveblocks.prepareSession(userId, {
      userInfo: {
        name: userName,
        // Add more user metadata as needed
        // email: user.email,
        // avatar: user.avatar,
      },
    });

    // Grant access to the requested room
    // In production, add permission checks here
    if (room) {
      session.allow(room, session.FULL_ACCESS);
    }

    // Authorize and return token
    const { status, body } = await session.authorize();

    return new Response(body, { status });

  } catch (error) {
    console.error("[Liveblocks Auth] Error:", error);
    return Response.json(
      {
        error: "Authentication failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * Example integration with NextAuth.js
 *
 * import { getServerSession } from "next-auth"
 * import { authOptions } from "@/lib/auth"
 *
 * export async function POST(request: NextRequest) {
 *   const session = await getServerSession(authOptions)
 *
 *   if (!session?.user) {
 *     return Response.json({ error: "Unauthorized" }, { status: 401 })
 *   }
 *
 *   const { room } = await request.json()
 *
 *   const liveblocksSession = liveblocks.prepareSession(
 *     session.user.id,
 *     {
 *       userInfo: {
 *         name: session.user.name,
 *         email: session.user.email,
 *         avatar: session.user.image,
 *       }
 *     }
 *   )
 *
 *   // Check if user has access to this room
 *   const hasAccess = await checkRoomAccess(session.user.id, room)
 *   if (!hasAccess) {
 *     return Response.json({ error: "Forbidden" }, { status: 403 })
 *   }
 *
 *   liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS)
 *
 *   const { status, body } = await liveblocksSession.authorize()
 *   return new Response(body, { status })
 * }
 */
