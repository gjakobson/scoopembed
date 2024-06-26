// useApi.js

export const useApi = (otherURL) => {


  const userID = "61cb586e-307a-4dd5-99be-044c8aba5ab3"
  const workspaceID = "W283";
  const token = "eyJraWQiOiI3dVwvZmEwRWZmU2NzWHAyQmRNK1RmY2lENk9yR2lNdDBRaDdpNTR0cktQbz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI0NmMyZWE2OS02Y2JkLTQyYjYtYTRiNC1jOTE4NDM5NTgzNDYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYmlydGhkYXRlIjoiMTA5NTM3OTE5OCIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy13ZXN0LTIuYW1hem9uYXdzLmNvbVwvdXMtd2VzdC0yXzRSeWx0cXlKNyIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6IjYxY2I1ODZlLTMwN2EtNGRkNS05OWJlLTA0NGM4YWJhNWFiMyIsIm9yaWdpbl9qdGkiOiJmYTdhODEyNi0wMjNhLTRmMDQtODFhZi03OWY4N2Q0OTg0YjkiLCJhdWQiOiI3NmF0cjYycm40aXVrOHVoajhyOGd0MzltcyIsImV2ZW50X2lkIjoiNzI4MzU4M2QtZDM3NS00ZGFiLTlmMmUtMjVhZWU1NDdhMTc1IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTk0MjU4MjEsInBob25lX251bWJlciI6IisxNzAyODQ1NDQ4NSIsImV4cCI6MTcxOTUxMjIyMSwiaWF0IjoxNzE5NDI1ODIxLCJqdGkiOiI4MjA4ZDI1MC04ODY3LTQ2YjgtYmIxNC1lZWI0MGU4NTI5YjEiLCJlbWFpbCI6ImdhYmVAc2Nvb3AucmVwb3J0In0.d5RAExh9YuIBewnfG5Tn_PbNYC3r0MlDBEIEu_o_ZxpQYPScxYyDfNJ5yJq-8ZsH7RUIZNujbFKVWa8ygVH0VvQgynXmbLSb-lKfvvArNykjwkS_go47h7dOrupvkdWBxXbXokzgpG2CIoQ_bfiCXMheOm-MmD2UyrzJpa0wlR8UyaZq0QgSb4vcCMajMBqUrvhKv1c6PDv8crFDASGA5vw0WR6kXPbGtRVzvQrURN1U66SzmftEJPgkWbyRjzVzDvvnA5xH5vkDANuxK55orU03mzI6Fq2v6JmQM3KEiMG1Cpim7firDxjYn__yvh8RpnQdC8y7IB_xHdhlmmu1tQ"


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
