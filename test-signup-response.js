// Test script to verify our response handling
console.log('Testing signup response handling...');

// Simulate production response (demo server format)
const productionResponse = {
  success: true,
  token: "demo-token",
  user: {
    id: "demo",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User"
  }
};

console.log('Production response:', productionResponse);

// Test if our frontend logic would work
function testResponseHandling(data) {
  console.log('Testing response handling for:', data);

  let safeResponse;

  if (data.data) {
    console.log('Using nested format handling');
    safeResponse = {
      ...data,
      data: {
        user: data.data.user,
        token: data.data.token
      }
    };
  } else {
    console.log('Using direct format handling');
    safeResponse = {
      ...data,
      user: data.user
    };
  }

  console.log('Safe response:', safeResponse);
  console.log('Success check:', safeResponse.success);

  return safeResponse;
}

const result = testResponseHandling(productionResponse);
console.log('Final result success:', result.success);