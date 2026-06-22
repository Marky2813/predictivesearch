import express from "express";
import axios from "axios";
import Anthropic from "@anthropic-ai/sdk";
import { TextBlock } from "@anthropic-ai/sdk/resources";

const client = new Anthropic();

interface Tool {
  content:Anthropic.Messages.ToolUseBlock,
  name: string;
  id:string
}

interface Result {
  messages?: TextBlock[];
  tools?: Tool;
}

const app = express();
const port = 3000; 
const addressfinderKey = process.env.ADDRESSFINDER_KEY;
const addressfinderSecret = process.env.ADDRESSFINDER_SECRET;

const tools:Anthropic.Tool[] = [
  {
    name: "get_customer_address", 
    description: "use this tool to input the customer address, the address will be collected automatically and added in the messages array with a role of user. Only use this tool once unless the customer specifices that the address inputed is wrong.",
    input_schema: {
      type:"object", 
      properties: {}, 
      required: []
    }
  }
];
app.use(express.json())

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

app.post("/api/chat", async (req, res) => {
  if(!req.body) {
    res.status(400).send("No message sent")
  }
  const message = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  tools, 
  system:`You are a helpful customer support assistant for a telecom company named Narula telecom. 
  Narula telecom provides various telecom service with the most prominant and highly used is their wifi.
  
  As a customer support agent, if the user is interested in taking a wifi connection, you need to take their address using the tool provided and after they provide you the address.
  You need to confirm it, for example:
  "Thank you for providing your address, just for confirmation the address is 
  Unit:
  Street:
  City:
  Pincode:
  "
  
  Upon address confirmation by the customer add the address to the database.  
  You are not allowed to use markdown formatting for your responses.`,
  messages: req.body.messages
});
  // what if a query has both text and tool call, we need to maintian a result array and append the tool cool and messages both in that 
  let result:Result = {
    messages: [], 
  
  }
  const tool_call = message.content.find((block) => block.type === "tool_use")
  //find because we have considered that no tools are running parrallely. 
  if(tool_call) {
    result.tools = {
      content:tool_call,
      name:tool_call.name,
      id:tool_call.id
    }
  }

  const hasText = message.content.filter((block) => block.type === "text")
  if(hasText.length > 0) {
    result.messages = hasText
  }
  res.json(result);
    // res.json({
    //   role:message.role,
    //   content:message.content[0].text 
    // }) 
  // res.json({message});
})

app.listen(port, () => {
  console.log("listening to port 3000!")
})