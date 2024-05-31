const lotOwnerOps = require("../db/lotOwnerOps");
const paginate = require("../middleware/pagination");
const { fb } = require("../db/firebaseConfig");

exports.viewLots = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const pages = await paginate.paginate(req.query.page);
      const profile = await lotOwnerOps.dashboard(
        req.user.id,
        pages.start,
        pages.limit
      );
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
exports.getProfile = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const profile = await lotOwnerOps.getProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
exports.updateProfile = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const post = req.body;
      const update = await lotOwnerOps.updateProfile(req.user.id, post);
      if (update === 1) {
        res.status(200).json({ message: "Success" });
      } else {
        res.status(204).json({ message: "User not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
exports.addLot = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const post = req.body;
      if (
        !post.AddressL1 ||
        !post.City ||
        !post.Country ||
        !post.LotName ||
        !post.TotalCapacity ||
        post.zones.length > 10
      ) {
        res.status(400).json({ message: "Enter all required fields." });
        return;
      }
      if (post.zones && Array.isArray(post.zones)) {
        post.zones = post.zones.map((zone) => parseInt(zone));
      }
      if (!post.zones || post.zones.length < 1) {
        post.zones.length = 1;
      }
      if (!post.PostalCode) {
        post.PostalCode = "";
      }
      if (!post.AddressL2) {
        post.AddressL2 = "";
      }
      const update = await lotOwnerOps.addLot(req.user.id, post);
      if (update === 1) {
        res.status(200).json({ message: "Success" });
      } else {
        res
          .status(204)
          .json({ message: "User not found. Please contact support." });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
exports.support = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const subject = req.body.subject;
      const id = req.user.id + ": " + subject;
      const body = req.body.body;

      if (!subject || !body) {
        res.status(400).json({ message: "Enter all required fields." });
        return;
      }
      if (subject.length > 65) {
        res
          .status(400)
          .json({ message: "Subject must be maximum 60 characters long." });
        return;
      }

      if (body.length > 510) {
        res
          .status(400)
          .json({ message: "Body must be maximum 500 characters long." });
        return;
      }
      const response = await fb
        .collection("Lot-Support")
        .doc(id)
        .set({ subject, body, status: "PENDING" });
      res.send(response);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
exports.updateLotStatus = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const post = req.body;
      const update = await lotOwnerOps.updateLotStatus(req.user.id, post);
      if (update === 1) {
        res.status(200).json({ message: "Success" });
      } else {
        res.status(204).json({ message: "Lot not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.getAnalytics = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const lotID = req.params.lotID;
      const analytics = await lotOwnerOps.getAnalytics(lotID, req.user.id);
      res.json({ analytics });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.getLots = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const lots = await lotOwnerOps.getLots(req.user.id);
      res.json({ lots });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.getRates = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const { lotID } = req.params;
      const lots = await lotOwnerOps.getRates(req.user.id, lotID);
      res.json({ lots });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.setRates = async (req, res) => {
  if (req.user.role === "LOTOWNER") {
    try {
      const Rates = req.body;
      const lots = await lotOwnerOps.setRates(req.user.id, Rates);
      res.json({ lots });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: error });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
