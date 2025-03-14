export default function handler(req, res) {
    if (req.method === "POST") {
        console.log("📝 Client Log Received:", req.body);

        // Optionally log to a file or external service if needed
    }
    res.status(200).json({ success: true });
}
