export const useApi = (isDev, token, userID, workspaceID, otherURL) => {
    const API_ENDPOINT = "https://pig8gecvvk.execute-api.us-west-2.amazonaws.com/corsair/sheetserver";
    let useAPIURL = token?.length < 100 ? API_ENDPOINT.replace("sheetserver", "guest-sheetserver") : API_ENDPOINT;

    if (isDev) {
        useAPIURL = useAPIURL.replace("mobileapi", "mobileapidev");
        useAPIURL = useAPIURL.replace("sheetserver", "sheetserverdev");
    }

    const logToServer = (message, data = {}) => {
        console.log(message, data); // Still logs to browser console
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

        logToServer("🚀 API Request:");
        logToServer("🔹 URL:", url);
        logToServer("🔹 Headers:", {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        });
        logToServer("🔹 Body:", JSON.stringify(action, null, 2));

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

            logToServer("📩 Received Response:");
            logToServer("🔹 Status:", response.status);

            const responseText = await response.text();
            logToServer("🔹 Raw Response Body:", responseText);

            if (!response.ok) {
                console.error("❌ Network error:", response.status, response.statusText);
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }

            const jsonResponse = JSON.parse(responseText);
            logToServer("✅ Parsed JSON Response:", jsonResponse);
            return jsonResponse;
        } catch (error) {
            console.error("⚠️ Fetch Error:", error.message);
            return null; // Or throw the error if you need to handle it elsewhere
        }
    };

    return { postData };
};
