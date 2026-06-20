import express from "express";
import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const message = await client.messages.create({
  model: "claude-haiku-4-5",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content: "yo bro, how are you?"
    }
  ]
});
console.log(message);

const app = express();
const port = 3000; 
const addressfinderKey = process.env.ADDRESSFINDER_KEY;
const addressfinderSecret = process.env.ADDRESSFINDER_SECRET;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})

app.get("/api/address/search", async (req, res) => {
  const query = String(req.query.query || "").trim();

  if (!query) {
    res.json({ suggestions: [] });
    return;
  }

  try {
    console.log("Address search query:", query);

    const response = await axios.get("https://api.addressfinder.io/api/au/address/autocomplete", {
      params: {
        key: addressfinderKey,
        q: query,
        format: "json",
        source: "GNAF,PAF",
        max: 10,
      },
      headers:
          {
            Authorization: addressfinderSecret,
          }
    });

    const completions = response.data?.completions || [];
    const suggestions = completions.map((item: { id?: string; full_address?: string; a?: string }) => {
      return {
        id: item.id,
        label: item.full_address || item.a,
      };
    }).filter((item: { id?: string; label?: string }) => item.id && item.label);

    res.json({ suggestions });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Addressfinder autocomplete failed:", error.response?.status, error.response?.data);
    } else {
      console.error("Addressfinder autocomplete failed:", error);
    }

    res.status(500).json({ suggestions: [] });
  }
})

app.get("/api/address/metadata", async (req, res) => {
  const id = String(req.query.id || "").trim();

  if (!id) {
    res.status(400).json({ error: "Address id is required" });
    return;
  }

  try {
    const response = await axios.get("https://api.addressfinder.io/api/au/address/metadata", {
      params: {
        key: addressfinderKey,
        id,
        format: "json",
        source: "GNAF",
        gps: 1,
      },
      headers: {
        Authorization: addressfinderSecret,
      },
    });

    res.json({ address: response.data });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Addressfinder metadata failed:", error.response?.status, error.response?.data);
    } else {
      console.error("Addressfinder metadata failed:", error);
    }

    res.status(500).json({ error: "Unable to fetch address metadata" });
  }
})

app.listen(port, () => {
  console.log("listening to port 3000!")
})