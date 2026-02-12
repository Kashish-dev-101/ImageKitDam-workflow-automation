import express from "express";
import ImageKit from "imagekit";
import CORS from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = 8000;

// Initialize ImageKit
var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const allowedOrigins = process.env.ALLOWED_ORIGIN.split(",").map((s) =>
  s.trim()
);

// Function to trim the reesponse and build the saerch query

// map ImageKit file to the minimal shape your UI expects
function mapItem(files) {
  const results = [];

  for (let file of files) {
    results.push({
      fileId: file.fileId,
      name: file.name,
      url: file.url,
      thumbUrl: file.thumbnailUrl || file.url,
      size: file.size || 0,
      createdAt: file.createdAt,
      folder: file.filePath ? file.filePath.replace(`/${file.name}`, "") : "/",
      type: file.mime || file.fileType,
      status: file.customMetadata?.Status || "Pending",
      uploader: file.customMetadata?.Uploader || "",
    });
  }

  return results;
}

// // build the Lucene-like search string for ImageKit listFiles
// function buildSearchQuery({
//   status = "pending",
//   folder = "",
//   type = "",
//   search = "",
// }) {
//   const parts = [`status = "${status}"`];
//   if (folder) parts.push(`folder = "${folder}"`);
//   if (type) parts.push(`fileType = "${type}"`);
//   if (search) parts.push(`(name ~ "${search}" OR tags IN ["${search}"])`);
//   const q = parts.join(" AND ");
//   console.log("[searchQuery]", q);
//   return q;
// }

function buildSearchQuery(searchInput) {
  return `path = "/${searchInput}/"`;
  //   return `("customMetadata.Status" = "${status}")`;
}

// Middle to parse raw JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to handle CORS
app.use(
  CORS({
    origin: allowedOrigins, // Allow these origins
    methods: ["GET", "POST"], // Allow only GET and POST methods
  })
);

app.get("/ik-auth", (req, res) => {
  const authenticationParameters = imagekit.getAuthenticationParameters();
  console.log(authenticationParameters);
  res.json(authenticationParameters);
});

// Health check to confirm you're on the right server/port
app.get("/", (req, res) => {
  res.send("API is up. Try GET /api/search");
});

app.get("/api/search", async (req, res) => {
  console.log("request received");
  console.log("Requested URL:", req.url);
  console.log("Method:", req.method);
  console.log("Route params:", req.params);
  console.log("Query params:", req.query);
  console.log("Headers:", req.headers);
  try {
    // const {
    //   status = "pending",
    //   search = "",
    //   folder = "",
    //   type = "",
    // } = req.query;
    // const status = req.query.status || "pending";
    const folder = req.query.folder || "/";
    const searchQuery = buildSearchQuery(folder);
    // const searchQuery = buildSearchQuery({ folder, type, search });
    console.log(searchQuery);
    const files = await imagekit.listFiles({
      limit: 10,
      searchQuery: searchQuery,
    });
    console.log(files);
    console.log("First file:", files[0]);
    const fileData = mapItem(files);
    console.log(fileData);
    // respond with whatever ImageKit gave
    return res.status(200).json({
      ok: true,
      fileData,
    });
  } catch (err) {
    console.error("Error in fetching data", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch files",
      error: err?.message || "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
