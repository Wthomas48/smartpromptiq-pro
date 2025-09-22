// API Response Handling for Authentication
// Ensures all auth responses have safe data structures

// In your auth API calls:
export const handleAuthResponse = (response) => {
  const userData = response?.user || {};

  return {
    ...response,
    user: {
      ...userData,
      roles: Array.isArray(userData.roles) ? userData.roles : [],
      permissions: Array.isArray(userData.permissions) ? userData.permissions : [],
      role: userData.role || null
    }
  };
};

// In signin/signup functions:
export const signin = async (credentials) => {
  try {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    return handleAuthResponse(data);
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    return handleAuthResponse(data);
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return handleAuthResponse(data);
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};