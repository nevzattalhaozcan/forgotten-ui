// Like status cache to avoid redundant API calls
interface LikeStatus {
    userLiked: boolean;
    likesCount: number;
    lastChecked: number; // timestamp
}

interface LikeBatchRequest {
    postIds: (string | number)[];
    resolve: (results: Map<string, LikeStatus>) => void;
    reject: (error: Error) => void;
}

class LikeCache {
    private cache = new Map<string, LikeStatus>();
    private pendingBatch: LikeBatchRequest | null = null;
    private batchTimeout: ReturnType<typeof setTimeout> | null = null;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    private readonly BATCH_DELAY = 100; // 100ms to collect requests

    // Get like status for a single post, with batching
    async getLikeStatus(postId: string | number): Promise<LikeStatus> {
        const key = String(postId);
        const cached = this.cache.get(key);
        
        // Return cached value if still valid
        if (cached && Date.now() - cached.lastChecked < this.CACHE_DURATION) {
            return cached;
        }

        // Add to batch request
        return new Promise<LikeStatus>((resolve, reject) => {
            if (!this.pendingBatch) {
                this.pendingBatch = {
                    postIds: [postId],
                    resolve: (results) => {
                        const result = results.get(key);
                        if (result) {
                            resolve(result);
                        } else {
                            reject(new Error(`No result for post ${postId}`));
                        }
                    },
                    reject
                };

                // Set timeout to execute batch
                this.batchTimeout = setTimeout(() => this.executeBatch(), this.BATCH_DELAY);
            } else {
                // Add to existing batch
                this.pendingBatch.postIds.push(postId);
                
                // Replace resolve/reject to handle multiple requests
                const originalResolve = this.pendingBatch.resolve;
                const originalReject = this.pendingBatch.reject;
                
                this.pendingBatch.resolve = (results) => {
                    originalResolve(results);
                    const result = results.get(key);
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error(`No result for post ${postId}`));
                    }
                };
                
                this.pendingBatch.reject = (error) => {
                    originalReject(error);
                    reject(error);
                };
            }
        });
    }

    // Execute the batched request
    private async executeBatch(): Promise<void> {
        if (!this.pendingBatch) return;

        const batch = this.pendingBatch;
        this.pendingBatch = null;
        
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }

        try {
            const results = await this.fetchLikeStatusBatch(batch.postIds);
            
            // Update cache
            results.forEach((status, postId) => {
                this.cache.set(postId, {
                    ...status,
                    lastChecked: Date.now()
                });
            });

            batch.resolve(results);
        } catch (error) {
            batch.reject(error instanceof Error ? error : new Error('Failed to fetch like status'));
        }
    }

    // Simulated batch fetch - you can replace this with actual batch API when available
    private async fetchLikeStatusBatch(postIds: (string | number)[]): Promise<Map<string, LikeStatus>> {
        const { getPostLikes } = await import('./posts');
        const getCurrentUserId = () => localStorage.getItem("userId");
        
        const results = new Map<string, LikeStatus>();
        
        // For now, we'll fetch them in parallel (still better than sequential)
        const promises = postIds.map(async (postId) => {
            try {
                const likes = await getPostLikes(postId);
                const currentUserId = getCurrentUserId();
                const userLiked = currentUserId ? 
                    likes.some(like => String(like.user.id) === String(currentUserId)) : 
                    false;
                
                return {
                    postId: String(postId),
                    status: {
                        userLiked,
                        likesCount: likes.length,
                        lastChecked: Date.now()
                    }
                };
            } catch (error) {
                console.error(`Failed to fetch likes for post ${postId}:`, error);
                return {
                    postId: String(postId),
                    status: {
                        userLiked: false,
                        likesCount: 0,
                        lastChecked: Date.now()
                    }
                };
            }
        });

        const responses = await Promise.all(promises);
        responses.forEach(({ postId, status }) => {
            results.set(postId, status);
        });

        return results;
    }

    // Update cache when user likes/unlikes a post
    updateLikeStatus(postId: string | number, userLiked: boolean, likesCount: number): void {
        const key = String(postId);
        this.cache.set(key, {
            userLiked,
            likesCount,
            lastChecked: Date.now()
        });
    }

    // Clear cache for a specific post
    invalidate(postId: string | number): void {
        this.cache.delete(String(postId));
    }

    // Clear entire cache
    clear(): void {
        this.cache.clear();
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
        this.pendingBatch = null;
    }

    // Get cached status without making API call
    getCached(postId: string | number): LikeStatus | null {
        const key = String(postId);
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.lastChecked < this.CACHE_DURATION) {
            return cached;
        }
        
        return null;
    }
}

// Singleton instance
export const likeCache = new LikeCache();