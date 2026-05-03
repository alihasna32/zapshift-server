import { getUserCollection } from "../models/userModel.js";

export const verifyAdmin = async (req, res, next) => {
    const email = req.decoded_email; 
    const query = {email};
    const userCollection = getUserCollection();
    const user = await userCollection.findOne(query);
    if(!user || user.role !== "admin"){
        return res.status(403).send({message: "forbidden access"});
    }
    next();
}