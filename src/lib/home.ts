import { listClubs, type ClubApi } from "./clubs";
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
    
    const clubs = await listClubs();
    const eventArrays = await Promise.all(clubs.map(c => listClubEvents(c.id)));
    const events: EventApi[] = eventArrays.flat();
    
    return { announcements, events, clubs };
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
