import axios, { AxiosError } from 'axios';

// Constants for FatSecret API
const clientId = '7cfe71407ce6406bb416b78e02b2a006';
const clientSecret = 'b44c763599e34ca88299c22a00d3f15a';
const tokenUrl = 'https://oauth.fatsecret.com/connect/token';
const apiUrl = 'https://platform.fatsecret.com/rest/server.api';

// Declare access token
let accessToken: string = '';

// Function to get the access token
async function getAccessToken(): Promise<string> {
  if (accessToken) return accessToken; // Return the token if it's already set

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'basic');

  try {
    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    accessToken = response.data.access_token;
    return accessToken;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // Handle Axios errors
      console.error('Error fetching access token:', error.response?.data || error.message);
    } else {
      // Handle other types of errors
      console.error('Unknown error fetching access token:', error);
    }
    throw new Error('Failed to fetch access token');
  }
}

// Function to search for foods using FatSecret API
export default async function searchFoods(query: string): Promise<any> {
    try {
      const token = await getAccessToken(); // Ensure we have a valid token
  
      // Use the basic endpoint for food search
      const apiUrl = 'https://platform.fatsecret.com/rest/server.api'; 
  
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          method: 'foods.search', // Specify the method for the older API
          search_expression: query, // The search query (e.g., 'banana')
          format: 'json', // Optional, request JSON format
        },
      });
  
      return response.data; // Return the list of foods
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Handle Axios errors
        console.error('Error searching for foods:', error.response?.data || error.message);
      } else {
        // Handle other types of errors
        console.error('Unknown error searching for foods:', error);
      }
      throw new Error('Failed to search for foods');
    }
  }
  

// Example usage: search for foods
(async () => {
  try {
    const foods = await searchFoods('chicken');
    console.log('Search results:', foods);
  } catch (error) {
    console.error('Error:', error);
  }
})();

