export type Role = "member" | "moderator" | "owner";

export const currentSession = {
    userId: "u1",
    // change this to test: "member" | "moderator" | "owner"
    roleInClub: "member" as Role,
};