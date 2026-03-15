import User from '../models/user_models.js'


export const getCurrentUser = async (req, res) => {
    try {

        console.log("req.userId:", req.userId);  // 🔥 debug

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized"
            });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            status: true,
            user
        });

    } catch (error) {
        console.error("Get Current User error:", error);
        res.status(500).json({
            status: false,
            message: "Server error"
        });
    }
};
