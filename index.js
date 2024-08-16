const express = require("express")
require("dotenv").config()
const cors = require("cors")

const app = express()
const port = process.env.PORT || 5000;

// middlewares

app.use(express.json())
app.use(cors())
app.use((req, res, next) => {
	res.header({ "Access-Control-Allow-Origin": "*" });
	next();
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.PASSWORD}@cluster0.d9ozz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		const productCollection = client
			.db("productDB")
			.collection("products");


		app.get("/", (req, res) => {
			res.send("Hello World!");
		});

		app.get("/products", async (req, res) => {

			try {
				const products = await productCollection.find().toArray();
				res.send(products);
			} catch (error) {
				console.error(
					"Error fetching data from product collection:",
					error
				);
				res.status(500).send(
					"Error fetching data from product collection"
				);
			}
		});

		app.post("/product", async (req, res) => {
			const newProduct = req.body;
			const result = await productCollection.insertOne(
				newProduct
			);
			res.send(result);
		});
		
		app.delete("/product/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await productCollection.deleteOne(query);
			res.send(result);
		});

		app.listen(port, () => {
			console.log(`Example app listening on port ${port}`);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

