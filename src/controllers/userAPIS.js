import { getUserCollection } from "../models/userModel.js";
import { ObjectId } from "mongodb";

export const createUser = async (req, res) => {
  try {
    const user = req.body;
    const userCollection = getUserCollection();
    user.role = "user";
    user.createAt = new Date();
    const email = user.email;
    const userExists = await userCollection.findOne({ email });

    if (userExists) {
      return res.send({ message: "user exists" });
    }

    const result = await userCollection.insertOne(user);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const searchText = req.query.searchText;
    const query = {};
    if (searchText) {
      query.$or = [
        {displayName: {$regex: searchText, $options: "i"}},
        {email: {$regex: searchText, $options: "i"}}
      ]
    }
    const userCollection = getUserCollection();
    const cursor = userCollection.find(query).sort({ createAt: -1 }).limit(5);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
 

export const updateProfile = async (req, res) => {
  try{
    const id = req.params.id;
    const roleInfo = req.body;
     const userCollection = getUserCollection();
    const query = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        role: roleInfo.role,
      }
    }
    const result = await userCollection.updateOne(query, updateDoc);
    res.send(result);
  } catch(error){
    res.status(500).json({ error: "Failed to update user profile" });
  }
}

export const getNewUsers = async (req, res) => {
  try{

  } catch(error){
    res.status(500).json({ error: "Failed to fetch new users" });
  }
}

export const getRoleUsers = async (req, res) => {
  try{
    const email = req.params.email;
    const userCollection = getUserCollection();
    const query = { email };
    const user = await userCollection.findOne(query);
    res.send({ role: user?.role || "user" });
  } catch(error){ 
    res.status(500).json({ error: "Failed to fetch users by role" });
  }
}