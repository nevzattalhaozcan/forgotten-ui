import { listClubs, getUserClubs, type ClubApi } from "./clubs";
import { listClubEvents, listPublicEvents, type EventApi } from "./events";
import { listPosts, listPublicPosts, listPopularPosts, type PostApi } from "./posts";

export async function getPublicHomeData() {
  try {
    // Get popular/public posts and events directly from dedicated endpoints
    const [popularPosts, publicPosts, publicEvents] = await Promise.allSettled([
      listPopularPosts(),
      listPublicPosts(), 
      listPublicEvents()
    ]);

    // Combine popular and public posts, prioritize popular ones
    const allPosts: PostApi[] = [
      ...(popularPosts.status === 'fulfilled' ? popularPosts.value : []),
      ...(publicPosts.status === 'fulfilled' ? publicPosts.value : [])
    ];

    // Remove duplicates (in case a post appears in both popular and public)
    const uniquePosts = allPosts.filter((post, index, self) => 
      self.findIndex(p => String(p.id) === String(post.id)) === index
    );

    // Get popular announcements (sort by engagement or recency)
    const announcements = uniquePosts
      .filter(p => p.type === "announcement")
      .sort((a, b) => {
        // Sort by created date (most recent first) as proxy for popularity
        return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      })
      .slice(0, 10); // Top 10 most recent announcements

    // Get public events
    const events = publicEvents.status === 'fulfilled' ? publicEvents.value : [];
    
    // Try to get public clubs for context
    let publicClubs: ClubApi[] = [];
    try {
      const clubs = await listClubs();
      publicClubs = clubs.filter(c => !c.is_private);
    } catch {
      // If clubs API fails, continue without club data
      publicClubs = [];
    }
    
    return { announcements, events, clubs: publicClubs };
  } catch (error) {
    console.error('Failed to fetch public home data:', error);
    // Return empty data instead of throwing
    return { announcements: [], events: [], clubs: [] };
  }
}

// Enhanced function that tries authenticated first, falls back to public
export async function getHomeData() {
  try {
    // Try authenticated request first
    const posts = await listPosts();
    const announcements = posts.filter(p => p.type === "announcement");
    
    // Get user's clubs (clubs they are members of) - this is now much more efficient
    const userClubs = await getUserClubs();
    
    // If user has no clubs, fetch public events instead
    let events: EventApi[] = [];
    if (userClubs.length === 0) {
      // User isn't a member of any clubs, get public events
      try {
        events = await listPublicEvents();
      } catch (error) {
        console.warn('Failed to fetch public events:', error);
        events = [];
      }
    } else {
      // Fetch events only from clubs the user is a member of
      const eventPromises = userClubs.map(async (club) => {
        try {
          return await listClubEvents(club.id);
        } catch (error) {
          // If we get a 403 or any error, skip this club's events
          console.warn(`Failed to fetch events for club ${club.id}:`, error);
          return [];
        }
      });
      
      const eventArrays = await Promise.all(eventPromises);
      events = eventArrays.flat();
    }
    
    // Get all clubs for context (for announcements that might reference other clubs)
    let allClubs: ClubApi[] = [];
    try {
      allClubs = await listClubs();
    } catch (error) {
      // If we can't get all clubs, at least use the user's clubs
      console.warn('Failed to fetch all clubs, using user clubs only:', error);
      allClubs = userClubs;
    }
    
    return { announcements, events, clubs: allClubs };
  } catch (error: unknown) {
    // If 401 (unauthorized), fall back to public content
    const errorObj = error as { status?: number; message?: string };
    if (errorObj?.status === 401 || errorObj?.message?.includes('401')) {
      return getPublicHomeData();
    }
    
    // For other errors, still try public content as fallback
    console.warn('Authenticated request failed, trying public content:', error);
    return getPublicHomeData();
  }
}
