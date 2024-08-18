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


const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		const productCollection = client.db("productDB").collection("products");

		app.get("/", (req, res) => {
			res.send("Hello World!");
		});

		// counting total product
		

		// products query
		app.get("/products", async (req, res) => {
			try {
				const {
					page,
					limit,
					price_lte,
					category,
					brand,
					sort,
					search,
				} = req.query;
				
				const query = {};
				if (search) {
					query.name = { $regex: new RegExp(search, "i") };
				}
				if (category) {
					query.category = { $regex: new RegExp(category, "i") };
				}
				if (brand) {
					query.brand = { $regex: new RegExp(brand, "i") };
				}
				if (price_lte) {
					query.price = { $lte: parseInt(price_lte*1000) };
				}

				const sortOptions = {};
				if (sort === "priceAsc") {
					sortOptions.price = 1;
				} else if (sort === "priceDsc") {
					sortOptions.price = -1;
				} else if (sort === "createdAt") {
					sortOptions.createdAt = -1;
				}
				
				const products = await productCollection
					.find(query).sort(sortOptions)
					.skip(parseInt(page) * parseInt(limit))
					.limit(parseInt(limit))
					.toArray();
				console.log(query)
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

		app.get("/totalproducts", async (req, res) => {
			try {
				const { price_lte, category, brand, search } = req.query;

				// Build the filter query object
				const query = {};

				
				if (search) {
					query.name = { $regex: new RegExp(search, "i") };
				}
				if (category) {
					query.category = { $regex: new RegExp(category, "i") };
				}
				if (brand) {
					query.brand = { $regex: new RegExp(brand, "i") };
				}
				if (price_lte) {
					query.price = { $lte: parseInt(price_lte * 1000) };
				}

				// Count the number of documents that match the filter
				const count = await productCollection.countDocuments(query);
				res.send({ count });
			} catch (error) {
				console.error("Error fetching total product count:", error);
				res.status(500).send("Error fetching total product count");
			}
		});

		app.post("/product", async (req, res) => {
			const newProduct = req.body;
			const result = await productCollection.insertOne(newProduct);
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

