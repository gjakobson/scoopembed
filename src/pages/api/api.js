export const useApi = (isDev, token, userID, workspaceID, otherURL) => {
    const API_ENDPOINT = "https://pig8gecvvk.execute-api.us-west-2.amazonaws.com/corsair/sheetserver";
    let useAPIURL = token?.length < 100 ? API_ENDPOINT.replace("sheetserver", "guest-sheetserver") : API_ENDPOINT;

    if (isDev) {
        useAPIURL = useAPIURL.replace("mobileapi", "mobileapidev");
        useAPIURL = useAPIURL.replace("sheetserver", "sheetserverdev");
    }

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

        console.log("🚀 API Request:");
        console.log("🔹 URL:", url);
        console.log("🔹 Headers:", {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        });
        console.log("🔹 Body:", JSON.stringify(action, null, 2));

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

            console.log("📩 Received Response:");
            console.log("🔹 Status:", response.status);

            const responseText = await response.text();
            console.log("🔹 Raw Response Body:", responseText);

            if (!response.ok) {
                console.error("❌ Network error:", response.status, response.statusText);
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }

            const jsonResponse = JSON.parse(responseText);
            console.log("✅ Parsed JSON Response:", jsonResponse);
            return jsonResponse;
        } catch (error) {
            console.error("⚠️ Fetch Error:", error.message);
            return null; // Or throw the error if you need to handle it elsewhere
        }
    };

    return { postData };
};
