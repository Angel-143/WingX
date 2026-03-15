import { upload } from "../middleware/multer.js";
import Shop from "../models/shop_model.js";
import uploadOnCloudinary  from "../utils/cloudinary.js";



export const createShop = async (req, res) => {
     console.log(req.body)
    console.log(req.file)
    try {
        const { name, city, state, address } = req.body
        let image;
        if (req.file) {
            
            image = await uploadOnCloudinary(req.file.path)
        } 
        const shop = await Shop.create({
            name,
            city,   
            state,
            address,
            image,
            owner: req.userId
        })
        await shop.populate("owner")
        
        res.status(201).json({shop})
    } catch (error) {
        console.error("Create Shop error:", error)
        res.status(500).json({ message: "Server error" })
    }
}



export const editShop = async (req, res) => {
   
    try {
        const { name, city, state, address } = req.body 
        const shopId = req.params.id
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const shop = await Shop.findById(shopId)
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" })
        }
        if (shop.owner.toString() !== req.userId) {
            return res.status(403).json({ message: "Forbidden" })
        }
        shop.name = name || shop.name
        shop.city = city || shop.city
        shop.state = state || shop.state
        shop.address = address || shop.address
        shop.image = image || shop.image
        await shop.save()
        await shop.populate("owner")
        res.status(200).json({shop})
    } catch (error) {
        console.error("Edit Shop error:", error)
        res.status(500).json({ message: "Server error" })
    }
}

export const getShops = async (req, res) => {
    try {
        const shops = await Shop.find().populate("owner").populate("items")
        res.status(200).json({shops})
    } catch (error) {
        console.error("Get Shops error:", error)
        res.status(500).json({ message: "Server error" })
    }
}


export const getMyShop = async (req, res) => {

  try {

    const shop = await Shop.findOne({ owner: req.userId }).populate("owner").populate("items")

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.status(200).json({ shop });

    

  } catch (error) {

    console.error("Get My Shop error:", error);
    res.status(500).json({ message: "Server error" });

  }

};


export const getShopByCity=async (req,res) =>{
    try{
        const {city}=req.params
        const shops=await Shop.find(
            {
                city:{$regex:new RegExp(`^${city}$`,"i")}
            }
        ).populate('items')
        if(!Shop){
            return res.status(404).json({ message: "Shop not found" });


        }
        return res.status(200).json({ shops: shops })
    }catch(error){
        console.error("Get My Shop error:", error);
    res.status(500).json({ message: "Server error" });

    }

}