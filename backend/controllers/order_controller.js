// controllers/order_controller.js
import Order from "../models/order_model.js";
import Shop from "../models/shop_model.js";
import { broadcastToNearbyRiders } from "../services/deliveryBroadcastService.js";

// ── Place Order ──
export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

        if (!cartItems || cartItems.length === 0)
            return res.status(400).json({ message: "Cart is empty" });
        if (!deliveryAddress?.text || !deliveryAddress?.latitude || !deliveryAddress?.longitude)
            return res.status(400).json({ message: "Send complete deliveryAddress" });
        if (!paymentMethod)
            return res.status(400).json({ message: "Payment method required" });

        const groupItemByShop = {};
        cartItems.forEach(item => {
            // ✅ Shop object ho ya string — dono handle karo
            const shopId = item.shop?._id || item.shop;
            const shopKey = shopId?.toString();
            if (!groupItemByShop[shopKey]) groupItemByShop[shopKey] = [];
            groupItemByShop[shopKey].push(item);
        });

        console.log("🛒 Grouped by shop:", Object.keys(groupItemByShop));

        const shopOrders = await Promise.all(
            Object.keys(groupItemByShop).map(async (shopId) => {
                const shop = await Shop.findById(shopId).populate("owner");
                if (!shop) throw new Error(`Shop not found: ${shopId}`);
                const items = groupItemByShop[shopId];
                const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
                return {
                    shop: shop._id, owner: shop.owner._id,
                    subtotal, status: "pending",
                    shopOrderItems: items.map(i => ({
                        name: i.name, item: i.id, price: i.price, quantity: i.quantity
                    }))
                };
            })
        );

        const newOrder = await Order.create({
            user: req.userId, paymentMethod,
            deliveryAddress, totalAmount, shopOrders
        });

        return res.status(201).json(newOrder);
    } catch (error) {
        console.error("Place order error:", error);
        return res.status(500).json({ message: error.message || "Place order error" });
    }
};

// ── Get User Orders ──
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .populate("shopOrders.shop", "name image city")
            .sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch {
        return res.status(500).json({ message: "Error fetching orders" });
    }
};

// ── Get Owner Orders ──
export const getOwnerOrders = async (req, res) => {
    try {
        const shops = await Shop.find({ owner: req.userId });
        const shopIds = shops.map(s => s._id);
        if (shopIds.length === 0) return res.status(200).json([]);

        const orders = await Order.find({ "shopOrders.shop": { $in: shopIds } })
            .populate("user", "fullname phone")
            .populate("shopOrders.shop", "name image city")
            .sort({ createdAt: -1 });

        const filteredOrders = orders.map(order => {
            const myShopOrders = order.shopOrders.filter(
                so => shopIds.map(id => id.toString()).includes(so.shop?._id?.toString())
            );
            const myTotal = myShopOrders.reduce((sum, so) =>
                sum + (so.shopOrderItems?.reduce((s, i) => s + i.price * i.quantity, 0) || 0), 0
            );
            return { ...order.toObject(), shopOrders: myShopOrders, totalAmount: myTotal };
        });

        return res.status(200).json(filteredOrders);
    } catch {
        return res.status(500).json({ message: "Error fetching owner orders" });
    }
};

// ── Update ShopOrder Status ──
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, shopId } = req.body;

        console.log("🔄 Status update request:", { orderId, status, shopId });

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const shopOrder = order.shopOrders.find(
            so => so.shop.toString() === shopId.toString()
        );
        if (!shopOrder) return res.status(404).json({ message: "Shop order not found" });

        shopOrder.status = status;
        await order.save();

        console.log("✅ Order status updated to:", status);

        if (status === "preparing") {
            console.log("📡 Triggering broadcast...");
            broadcastToNearbyRiders(orderId, shopId, order.deliveryAddress)
                .then(result => console.log("📡 Broadcast result:", result))
                .catch(err => console.error("❌ Broadcast failed:", err));
        }

        return res.status(200).json(order);
    } catch (error) {
        console.error("updateOrderStatus error:", error);
        return res.status(500).json({ message: "Error updating order" });
    }
};