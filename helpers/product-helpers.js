var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectID

module.exports={

    addProduct:(product,callback)=>{
        
        db.get().collection('product').insertOne(product).then((data)=>{
            
            callback(data.ops[0]._id)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(prodId)}).then((response)=>{
                //console.log(response);
                resolve(response)
            })
        })

    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Category:proDetails.Category,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Stock:proDetails.Stock
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    deleteUser:(removeId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).removeOne({_id:objectId(removeId)}).then((response)=>{
                //console.log(response);
                resolve(response)
            })
        })

    },
    getEquipmentProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let equipment = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category: "equipment"}).toArray()
            resolve(equipment)
        })
    },
    getAccessoriesProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let accessories = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category: "accessories"}).toArray()
            resolve(accessories)
        })
    }
}