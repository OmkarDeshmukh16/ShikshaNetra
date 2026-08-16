const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
// const bodyParser = require("body-parser")
const app = express()
const Routes = require("./routes/route.js")
const path = require("path");
const PORT = process.env.PORT || 5000

dotenv.config();

// app.use(bodyParser.json({ limit: '10mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

// Capture raw body for Razorpay webhook signature verification
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => { req.rawBody = buf; }
}))
app.use(cors())
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(async () => {
        console.log("Connected to MongoDB");

        // Clean up stale unique indexes that cause duplicate key errors on null values
        try {
            const adminCollection = mongoose.connection.collection('admins');
            const indexes = await adminCollection.indexes();
            const staleIndexes = ['udiseNumber_1', 'recognitionNumber_1'];
            for (const idxName of staleIndexes) {
                if (indexes.find(i => i.name === idxName)) {
                    await adminCollection.dropIndex(idxName);
                    console.log(`Dropped stale index: ${idxName}`);
                }
            }
        } catch (err) {
            console.log('Index cleanup note:', err.message);
        }
    })
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

app.use('/', Routes);

// Global Error Handler for Payload Too Large or Body Parsing Errors
app.use((err, req, res, next) => {
    if (err && (err.type === 'entity.too.large' || err.status === 413)) {
        return res.status(413).json({ message: "Payload size is too large for the hosting server. Please upload a file under 3.5MB." });
    }
    next(err);
});

// Serve React frontend (must be AFTER API routes)
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`)
})