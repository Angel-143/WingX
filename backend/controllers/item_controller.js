import Shop from "../models/shop_model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import Item from "../models/item_model.js"

export const addItem = async (req, res) => {

console.log("BODY:", req.body)
console.log("FILE:", req.file)

try {

const {
name,
category,
foodType,
price,
isSubscription,
mealsPerWeek,
mealsPerMonth,
validityDays
} = req.body

let image

if (req.file) {
image = await uploadOnCloudinary(req.file.path)
}

if (!image) {
return res.status(400).json({ message: "Image is required" })
}

const shop = await Shop.findOne({ owner: req.userId })

if (!shop) {
return res.status(404).json({ message: "Shop not found" })
}

const item = await Item.create({

name,
category,
foodType,
price,
image,
shop: shop._id,

// subscription fields
isSubscription: isSubscription === "true",
mealsPerWeek: mealsPerWeek || 0,
mealsPerMonth: mealsPerMonth || 0,
validityDays: validityDays || 0

})
// SAHI
shop.items.push(item._id)
await shop.save()           // ← save bhi missing tha!
await shop.populate("items owner")



res.status(201).json({
message: "Item added successfully",
item
})

} catch (error) {

console.error("Add Item error:", error)

res.status(500).json({
message: "Server error"
})

}

}

export const editItem = async (req, res) => {
    try {
        const {
            name,
            category,
            foodType,
            price,
            isSubscription,
            mealsPerWeek,
            mealsPerMonth,
            validityDays
        } = req.body 

        const itemId = req.params.id

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        const item = await Item.findById(itemId).populate("shop")
        if (!item) {
            return res.status(404).json({ message: "Item not found" })
        }

        if (item.shop.owner.toString() !== req.userId) {
            return res.status(403).json({ message: "Forbidden" })
        }

        item.name = name ?? item.name
        item.category = category ?? item.category
        item.foodType = foodType ?? item.foodType
        item.price = price ?? item.price
        item.image = image ?? item.image

        item.isSubscription = isSubscription ?? item.isSubscription
        item.mealsPerWeek = mealsPerWeek ?? item.mealsPerWeek
        item.mealsPerMonth = mealsPerMonth ?? item.mealsPerMonth
        item.validityDays = validityDays ?? item.validityDays

        await item.save()
        await item.populate("shop")

        res.status(200).json({ item })

    } catch (error) {
        console.error("Edit Item error:", error)
        res.status(500).json({ message: "Server error" })
    }
}


export const getItems = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" })
        }

        const items = await Item.find({ shop: shop._id })
        res.status(200).json({ items })

    } catch (error) {
        console.error("Get Items error:", error)
        res.status(500).json({ message: "Server error" })
    }
}


export const getSubscriptionItems = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" })
        }

        const items = await Item.find({
            shop: shop._id,
            isSubscription: true
        })

        res.status(200).json({ items })

    } catch (error) {
        console.error("Get Subscription Items error:", error)
        res.status(500).json({ message: "Server error" })
    }
}




export const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id

    const item = await Item.findById(itemId).populate("shop")
    if (!item) {
      return res.status(404).json({ message: "Item not found" })
    }

    // Owner check
    if (item.shop.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" })
    }

    // Shop ke items array se bhi hata do
    await Shop.findByIdAndUpdate(item.shop._id, {
      $pull: { items: itemId }
    })

    await Item.findByIdAndDelete(itemId)

    res.status(200).json({ message: "Item deleted successfully" })

  } catch (error) {
    console.error("Delete Item error:", error)
    res.status(500).json({ message: "Server error" })
  }
}



// Shop ke items by shop ID
export const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate('items');

        if (!shops || shops.length === 0) {
            return res.status(404).json({ message: "No shops found in this city" });
        }

        return res.status(200).json({ shops: shops });
    } catch (error) {
        console.error("Get Items By City error:", error);
        res.status(500).json({ message: "Server error" });
    }
}