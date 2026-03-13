// The base URL of your Hostinger backend
// Replace this with your actual domain, e.g., "https://knowva.xyz"
export const API_BASE_URL = "https://knowva.elevaitelabs.in";

export const API_ENDPOINTS = {
    AUTH: `${API_BASE_URL}/knowva_api/auth.php`,
    TOOLS: `${API_BASE_URL}/knowva_api/tools.php`,
    REVIEWS: `${API_BASE_URL}/knowva_api/reviews.php`,
    SAVED_TOOLS: `${API_BASE_URL}/knowva_api/saved_tools.php`,
    COMMUNITY: `${API_BASE_URL}/knowva_api/forum.php`,
    UPVOTES: `${API_BASE_URL}/knowva_api/upvotes.php`,
    TRENDING: `${API_BASE_URL}/knowva_api/trending.php`,
    // Add other endpoints as you expand your API
};
