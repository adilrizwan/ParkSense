const adminOps = require("../db/adminOps");
const paginate = require("../middleware/pagination");

exports.getProfile = async (req, res) => {
  if (req.user.role === "ADMIN") {
    try {
      const profile = await adminOps.getProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
// exports.credit = async (req, res) => {
//   if (req.user.role === "ADMIN") {
//     try {
//       const details = req.body;
//       if (details.amount < 1) {
//         res.status(200).json({ message: "Invalid amount" });
//         return;
//       }
//       const credit = await adminOps.credit(details.ID, details.Amount);
//       if (credit === 1) {
//         res.status(200).json({ message: "Success" });
//       } else {
//         res.status(204).json({ message: "User does not exist" });
//       }
//     } catch (error) {
//       console.log(error);
//       res.status(400).json({ message: error });
//     }
//   } else {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };
exports.updateProfile = async (req, res) => {
  if (req.user.role === "ADMIN") {
    try {
      const changes = req.body;
      const update = await adminOps.updateProfile(req.user.id, changes);
      if (update === 1) {
        res.status(200).json({ message: "Success" });
      } else {
        res.status(204).json({ message: "Post not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.search = async (req, res) => {
  try {
    if (req.user.role === "ADMIN") {
      const page = req.query.page;
      const param = req.query;
      const table = param.role;
      delete param.role;
      if (typeof page !== "undefined") {
        delete param.page;
      }
      const columns = Object.keys(param);
      const values = Object.values(param);
      if (typeof columns[0] === "undefined") {
        columns[0] = "NULL";
        values[0] = "NULL";
      }
      const pages = await paginate.paginate(page);
      const data = await adminOps.search(
        table,
        columns[0],
        values[0],
        pages.start,
        pages.limit
      );
      res.send(data);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error });
  }
};
// exports.searchUserforCredit = async (req, res) => {
//   if (req.user.role === "ADMIN") {
//     try {
//       const { email } = req.body;
//       const profile = await adminOps.searchUserforCredit(email);
//       res.json(profile);
//     } catch (error) {
//       console.log(error);
//       res.status(400).json({ message: error });
//     }
//   } else {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };
