// useApi.js

export const useApi = (otherURL) => {


  const userID = "61cb586e-307a-4dd5-99be-044c8aba5ab3"
  const workspaceID = "W283";
  const token = "eyJraWQiOiI3dVwvZmEwRWZmU2NzWHAyQmRNK1RmY2lENk9yR2lNdDBRaDdpNTR0cktQbz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0NmMyZWE2OS02Y2JkLTQyYjYtYTRiNC1jOTE4NDM5NTgzNDYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYmlydGhkYXRlIjoiMTA5NTM3OTE5OCIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yXzRSeWx0cXlKNyIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6IjYxY2I1ODZlLTMwN2EtNGRkNS05OWJlLTA0NGM4YWJhNWFiMyIsIm9yaWdpbl9qdGkiOiJkY2ZjNTljYi00NDljLTQ2NDItYWI0MC0yNGQxYWQ4MzMxNzgiLCJhdWQiOiI3NmF0cjYycm40aXVrOHVoajhyOGd0MzltcyIsImV2ZW50X2lkIjoiOGQ2YmFkYjctMGY0OS00NmQ1LTlmMTUtOTBlMGRiNzc5NDgwIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTc2NDU1NDQsInBob25lX251bWJlciI6IisxNzAyODQ1NDQ4NSIsImV4cCI6MTcxOTM0MDg1NywiaWF0IjoxNzE5MjU0NDU3LCJqdGkiOiIzMDIxNmMwNS05ODMyLTQxNzMtYWVlOC1kZWVjMzkxZDYyNDciLCJlbWFpbCI6ImdhYmVAc2Nvb3AucmVwb3J0In0.MQbjirbRWCSplUch5pwIOhx7mI2vhnL64gylHUWvWARM247yKcQptvkvtYWb77ZI4zvXjtuInvNdI4s0-kLwc4KSnCW02NfwS3j3LzCVRleaxvlGS_2lqB2jso4mkhJHAbZTialuIj6lwZnW8CJ3flcEyawrGfYTBicTOkxLP_d32GF2sl5SotHi99X3y2arWeNx4q0-woj7mdIfjUSX2cNvJVKuPNEs903zliRCc7kV0sRYD1L7qBR-pxpLGjUl1sqR0aaEN4xcPuqkZw_gy7mHo1voPD16Wh2nIqjpBZnWq6ZF0I8rw0snHQMnByh-uu5Kgmg1JDAvY4gxnGtOuA"


  const apiURL = "https://pig8gecvvk.execute-api.us-west-2.amazonaws.com/corsair/mobileapidev"
  const isGuestMode = false;
  


  const useAPIURL = isGuestMode ? apiURL.replace("mobile","guest-mobile") : apiURL;


  const postData = async (action) => {
    if (Array.isArray(action)) {
      action.forEach(a => {
        a.workspaceID = workspaceID;
        a.userID = userID;
      })
    } else {
      action.workspaceID = workspaceID;
      action.userID = userID;
    }
    const url = typeof otherURL === 'undefined' ? useAPIURL : otherURL;
    try {
      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(action),
      });
      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        if (response?.message === 'Unauthorized') {
          console.log('*****Unauthorized');
          // navigate(ROUTES.LOGOUT)
        }
        // Not OK - throw an error
        throw new Error('Network response was not ok', response);

      }

      // Try parsing the response into JSON
      return await response.json();
    } catch (error) {
      console.log(error);
      // navigate(ROUTES.LOGOUT)
      // Log any errors that occur during the fetch() or parsing
      // throw error;
    }
  };
  return { postData };
};
