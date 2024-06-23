export class Server {
    constructor(workspaceID, userID, token) {
        this.workspaceID = workspaceID;
        this.userID = userID;
        this.token = token;
    }

    async postData(action = {}, handler, object, errorHandler) {
        action.workspaceID = this.workspaceID;
        action.userID = this.userID;

        // if the length of the token is < 100, it's not a real jwt token but rather a guest token
        const API_URL = this.token?.length < 100 ? process.env.REACT_APP_API_URL.replace("mobileapi","guest-mobileapi") : process.env.REACT_APP_API_URL;

        const url = this.token ? API_URL : "http://localhost:8080/app/scoop";

        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(action),
        });

        if (!response.ok) {
            // handle HTTP errors
            if (errorHandler) {
                errorHandler(response);
                return;
            }
            console.log("Error!", response.status);
        }

        const responseClone = response.clone(); // Clone the response
    
        try {
            // Attempt to parse the cloned response as JSON
            const result = await responseClone.json();
            handler(result, object); // Handle JSON response
        } catch (error) {
            // If JSON parsing fails, read the original response as text (this happens in the case of URLS pointing to S3)
            let textResponse = await response.text(); // Read the response as text
            textResponse = textResponse.replace(/ /g, ""); // Remove spaces from the response
            handler(textResponse, object); // Handle text/plain response
        }
    }

    async sheetPostData(action = {}, handler, object) {

        action.workspaceID = this.workspaceID;
        action.userID = this.userID;

        const url = this.token ? "https://pig8gecvvk.execute-api.us-west-2.amazonaws.com/corsair/sheetserverdev": "http://localhost:8080/app/scoop";
        console.log("making sheetPostData call: ", JSON.stringify(action))

        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(action),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        handler(result ?? response, object);
    }

    catch(error) {
        console.error("Error in postData:", error);
        // Handle the error here, e.g., show an error message to the user
    }

    // special case when we get a presigned URL, and not JSON, back
    async postDataURL(action = {}) {
        action.workspaceID = this.workspaceID;
        action.userID = this.userID;

        // if the length of the token is < 100, it's not a real jwt token but rather a guest token
        const API_URL = this.token?.length < 100 ? process.env.REACT_APP_API_URL.replace("mobileapi","guest-mobileapi") : process.env.REACT_APP_API_URL;

        const url = this.token ? API_URL : "http://localhost:8080/app/scoop";

        try {
            const response = await fetch(url, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.token}`,
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify(action),
            });

            if (!response.ok) {
                console.log(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.text();
            return result; // return the result directly
        } catch (error) {
            console.error("Error in postDataURL:", error);
            throw error; // rethrow the error to be handled by the caller
        }
    }
}
