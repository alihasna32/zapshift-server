import { ObjectId } from "mongodb";
import { ridersCollection } from "../models/riderModel.js";
import { getUserCollection } from "../models/userModel.js";
import { getParcelCollection } from "../models/parcelModel.js";

export const createRiders = async (req, res) => {
  try {
    const rider = req.body;
    const riderCollection = ridersCollection();
    rider.status = "pending";
    rider.createAt = new Date();

    const result = await riderCollection.insertOne(rider);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "server error" });
  }
};

export const getRiders = async (req, res) => {
  try {
    const  {status, district, workStatus} = req.query;
    const query = {}
    if(status){
        query.status = status;
    }
    if(district){
        query.district = district;
    }
    if(workStatus){
        query.workStatus = workStatus;
    }
    const riderCollection = ridersCollection();
    const cursor = riderCollection.find(query);

    const result = await cursor.toArray();
    res.send(result)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch riders" });
  }
};


export const updateRiders = async (req, res) => {
  try{
    const status = req.body.status;
    const id = req.params.id;
    const riderCollection = ridersCollection();
    const query = {_id: new ObjectId(id)}
    const updatedDoc = {
      $set: {
        status: status,
        workStatus: 'available'
      }
    }

    const result = await riderCollection.updateOne(query, updatedDoc);
    if(status === 'approved'){
      const email = req.body.email;
      const userQuery = {email};
      const userCollection = getUserCollection();
      const updateUser = {
        $set: {
          role: 'rider'
        }
      }
      const userResult = await userCollection.updateOne(userQuery, updateUser);
    }
    res.send(result)
  } catch{
    res.status(500).json({ error: "Failed to update rider status" });
  }
}

export const deleteRiders = async (req, res) => {
  try{
    const id = req.params.id;
    const riderCollection = ridersCollection();
    const query = {_id: new ObjectId(id)}
    const result = await riderCollection.deleteOne(query);
    res.send(result)
  } catch{
    res.status(500).json({ error: "Failed to delete rider" });
  }
}

export const getDeliveryPerDay = async (req, res) => {
  try{
    const email = req.query.email;
    const pipeline = [
      {
        $match: {
          riderEmail: email,
          deliveryStatus: "parcel_delivered"
        },
      },
      
        {
          $lookup: {
            from: "trackings",
            localField: "trackingId",
            foreignField: "trackingId",
            as: "parcel_tracking",
          }
        },
        {
          $unwind: "$parcel_trackings"
        },
        {
          $match: {
            "parcel_trackings.status":"parcel_delivered"
          }
        },
        {
          $addFields: {
            deliveryDay: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$parcel_trackings.createdAt"
              }
            }
          }
        },
        {
          $group: {
            id: "$deliveryDay",
            deliveryCount: {$sum: 1}
          }
        }
    ]
    
    const parcelsCollection = getParcelCollection();
    const result = await parcelsCollection.aggregate(pipeline).toArray();
    res.send(result);
  } catch{
    res.status(500).json({ error: "Failed to get delivery per day" });
  }
}