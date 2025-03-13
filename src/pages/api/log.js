export default function handler(req, res) {
    if (req.method === "POST") {
        console.log("📝 Client Log Received:", req.body);
    }
    res.status(200).json({ success: true });
}
