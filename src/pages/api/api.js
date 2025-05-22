export const useApi = (isDev, token, userID, workspaceID, otherURL) => {
    const API_ENDPOINT = "https://pig8gecvvk.execute-api.us-west-2.amazonaws.com/corsair/sheetserver";
    let useAPIURL = token?.length < 100 ? API_ENDPOINT.replace("sheetserver", "guest-sheetserver") : API_ENDPOINT;

    if (isDev) {
        useAPIURL = useAPIURL.replace("mobileapi", "mobileapidev");
        useAPIURL = useAPIURL.replace("sheetserver", "sheetserverdev");
    }

    // Function to send logs to Vercel API
    const logToServer = (message, data = {}) => {
        //console.log(message, data); // Logs to browser console
        fetch("/api/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, data, timestamp: new Date().toISOString() }),
        }).catch((err) => console.error("Log API error:", err));
    };

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
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        };

        const requestBody = JSON.stringify(action, null, 2);
        logToServer("🚀 API Request Initiated", { url, headers, body: requestBody });

        const startTime = performance.now(); // Start timing

        try {
            const response = await fetch(url, {
                method: "POST",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                headers,
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: requestBody,
            });

            const endTime = performance.now(); // End timing
            const duration = (endTime - startTime).toFixed(2); // Calculate duration

            const rawResponseBody = await response.text(); // Get raw response

            logToServer("📩 API Response Received", {
                status: response.status,
                statusText: response.statusText,
                responseHeaders: Object.fromEntries(response.headers.entries()), // Convert headers to object
                rawResponseBody,
                duration: `${duration} ms`,
            });

            if (!response.ok) {
                console.error("❌ Network error:", response.status, response.statusText);
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }

            let jsonResponse;
            try {
                jsonResponse = JSON.parse(rawResponseBody);
            } catch (err) {
                logToServer("⚠️ JSON Parsing Failed", { rawResponseBody, error: err.message });
                throw new Error("JSON Parsing Failed: " + err.message);
            }

            logToServer("✅ Parsed JSON Response", jsonResponse);
            return jsonResponse;
        } catch (error) {
            console.error("⚠️ Fetch Error:", error.message);
            logToServer("❌ API Request Failed", { error: error.message });
            return null; // Or throw the error if needed
        }
    };

    return { postData };
};
