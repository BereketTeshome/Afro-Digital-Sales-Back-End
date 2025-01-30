import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const mongoURI = process.env.MONGO_URI; // Get MongoDB URI from .env

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Define a Schema
const DataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: true },
});

// Create a Model
const DataModel = mongoose.model("Data", DataSchema);

// 🔹 Fetch Data
const fetchDataFromMongoDB = async () => {
  try {
    return await DataModel.find();
  } catch (error) {
    console.error("❌ Error fetching data from MongoDB:", error);
    return [];
  }
};

// 🔹 Add Data
const addDataToMongoDB = async (data) => {
  try {
    const newData = new DataModel(data);
    return await newData.save();
  } catch (error) {
    console.error("❌ Error adding data to MongoDB:", error);
    return null;
  }
};

// 🔹 Update Data
const updateDataInMongoDB = async (id, newData) => {
  try {
    return await DataModel.findByIdAndUpdate(id, newData, { new: true });
  } catch (error) {
    console.error("❌ Error updating data in MongoDB:", error);
    return null;
  }
};

// 🔹 Delete Data
const deleteDataFromMongoDB = async (id) => {
  try {
    return await DataModel.findByIdAndDelete(id);
  } catch (error) {
    console.error("❌ Error deleting data from MongoDB:", error);
    return null;
  }
};

// Export functions to be used in other files
export {
  connectDB,
  fetchDataFromMongoDB,
  addDataToMongoDB,
  updateDataInMongoDB,
  deleteDataFromMongoDB,
};
