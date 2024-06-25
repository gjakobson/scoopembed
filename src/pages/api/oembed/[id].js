// pages/api/oembed/[id].js

export default function handler(req, res) {
    const { id } = req.query; // Ensure you're correctly extracting 'id'
    if (!id) {
      return res.status(400).json({ error: "ID parameter is required" });
    }
  
    res.status(200).json({
      type: "rich",
      version: "1.0",
      provider_name: "Scoop Analytics",
      provider_url: "https://scoopanalytics.com",
      title: "Scoop Analytics Embedding",
      description: "Beautiful, easy data visualization and storytelling",
      html: `<iframe src="https://embed.scoopanalytics.com/asset/${id}" frameborder="0" scrolling="no" height="575" width="400" style="width:100%;" title="Interactive or visual content"></iframe>`,
      width: 800,
      height: 300
    });
  }
  