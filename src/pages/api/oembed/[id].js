// pages/api/oembed/[id].js

export default function handler(req, res) {
    const { id } = req.query;  // Get the id from the query string
    const format = req.query.format;  // Optional: handle different formats if necessary
  
    // Construct the oEmbed response using the provided `id`
    if (format === 'json') {
      res.status(200).json({
        type: "rich",
        version: "1.0",
        provider_name: "Scoop Analytics",
        provider_url: "https://scoopanalytics.com",
        description: "Beautiful, easy data visualization and storytelling",
        html: `<iframe src="https://embed.scoopanalytics.com/asset/${id}" frameborder="0" scrolling="no" height="575" width="700" style="width:100%;" title="Scoop visual content"></iframe>`,
        width: 700,
        height: 575
      });
    } else {
      res.status(400).json({ error: "Unsupported format" });
    }
  }
  