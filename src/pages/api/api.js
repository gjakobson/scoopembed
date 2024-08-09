// api.js

export const useApi = (token, otherURL) => {
    const userID = "61cb586e-307a-4dd5-99be-044c8aba5ab3"
    const workspaceID = "W283";

    // if the length of the token is < 100, it's not a real jwt token but rather a guest token
    const API_ENDPOINT = "https://pig8gecvvk.execute-api.us-west-2.amazonaws.com/corsair/sheetserver"
    const useAPIURL = token?.length < 100 ? API_ENDPOINT.replace("sheetserver", "guest-sheetserver") : API_ENDPOINT;

    const postData = async (action) => {
        if (Array.isArray(action)) {
            action.forEach(a => {
                a.workspaceID = workspaceID;
                a.userID = userID;
            });
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
    return {postData};
};
