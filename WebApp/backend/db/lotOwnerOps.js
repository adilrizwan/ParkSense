const sql = require("mssql");
const { pool } = require("./sqlConfig");
const paginate = require("../middleware/pagination");

exports.dashboard = async (ID, offset, pageSize) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("ID", sql.Int, ID)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize)
      .query(`EXEC ViewMyLots @ID, @offset, @pageSize`);
    const fetched = await paginate.resultCount(
      offset,
      query.recordsets[1].length,
      query.recordsets[0].TOTAL
    );
    return {
      Results:
        "Showing " +
        fetched +
        " of " +
        query.recordsets[0][0].TOTAL +
        " results",
      MyLots: query.recordsets[1],
    };
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
exports.getProfile = async (ID) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("ID", sql.Int, ID)
      .query(`SELECT * from LotOwner where ID = @ID`);
    return query.recordset[0];
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
exports.updateProfile = async (ID, post) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS;
    const request = query.request();
    const result = await request
      .input("ID", sql.Int, ID)
      .input("Name", sql.VarChar, post.Name.toUpperCase())
      .input("PhoneNo", sql.VarChar, post.PhoneNo)
      .query(`IF EXISTS (SELECT 1 FROM LotOwner WHERE ID = @ID)
            BEGIN
                UPDATE LotOwner SET 
                    Name = @Name,  
                    PhoneNo = @PhoneNo 
                WHERE ID = @ID;
                SELECT 1;
            END
            ELSE
            BEGIN
                SELECT 0;
            END`);
    if (result.recordset[0][""] === 0) {
      return 0;
    } else if (result.recordset[0][""] === 1) {
      return 1;
    } else {
      res.status(400).json({ "DB ERROR": error });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};
exports.addLot = async (ID, post) => {
  try {
    let poolS = await pool;
    let query = await poolS;
    const request = query.request();
    const result = await request
      .input("OwnerID", sql.Int, ID)
      .input("TotalZones", sql.Int, post.zones.length)
      .input("PostalCode", sql.VarChar, post.PostalCode)
      .input("AddressL1", sql.VarChar, post.AddressL1)
      .input("AddressL2", sql.VarChar, post.AddressL2)
      .input("City", sql.VarChar, post.City)
      .input("Country", sql.VarChar, post.Country)
      .input("LotName", sql.VarChar, post.LotName)
      .input("TotalCapacity", sql.Int, post.TotalCapacity)
      .query(
        `EXEC AddLot @OwnerID, @TotalZones, @PostalCode, @AddressL1, @AddressL2, @City, @Country, @LotName, @TotalCapacity`
      );

    const lotID = result.recordset[0].LotID;
    if (lotID === 0) {
      return 0;
    } else {
      await addLotZones(lotID, post.zones);
      return 1;
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};

async function addLotZones(LotID, zones) {
  try {
    let poolS = await pool;
    let query = await poolS;

    for (let i = 0; i < zones.length; i++) {
      const request = query.request();

      const result = await request
        .input("LotID", sql.Int, LotID)
        .input("ZoneID", sql.Int, i + 1)
        .input("capacity", sql.Int, zones[i])
        .query(`EXEC AddLotZone @LotID, @ZoneID, @capacity`);
    }
    return "Success";
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
}

exports.updateLotStatus = async (OwnerID, post) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS;
    const request = query.request();
    const result = await request
      .input("LotOwnerID", sql.Int, OwnerID)
      .input("LotID", sql.Int, post.LotID)
      .input("Status", sql.VarChar, post.Status)
      .query(`EXEC UpdateLotStatus @LotOwnerID, @LotID, @Status`);
    if (result.recordset[0][""] === 0) {
      return 0;
    } else if (result.recordset[0][""] === 1) {
      return 1;
    } else {
      res.status(400).json({ "DB ERROR": error });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ "DB ERROR": error });
  }
};

exports.getAnalytics = async (lotID, ownerID) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("LotID", sql.Int, lotID)
      .input("OwnerID", sql.Int, ownerID)
      .query(`
        SELECT 
               COUNT(*) AS carsParked,
               COUNT(CASE WHEN ps.OutTime IS NULL THEN 1 END) AS ongoingSessions,
               AVG(CAST(ps.Rating AS DECIMAL(10, 2))) AS avgRating,
               AVG(CAST(DATEDIFF(MINUTE, ps.InTime, ISNULL(ps.OutTime, GETDATE())) AS FLOAT) / 60) AS avgHours,
               SUM(ps.Charge) AS totalEarnings,
               COUNT(DISTINCT ps.CarID) AS returningCustomers,
               l.SpaceAvailable AS spacesAvailable,
               l.TotalCapacity AS totalCapacity
        FROM ParkingSession ps
        JOIN Lot l ON ps.LotID = l.LotID
        WHERE l.LotOwnerID = @OwnerID AND l.LotID = @LotID
        GROUP BY l.SpaceAvailable, l.TotalCapacity;

        SELECT DATEPART(HOUR, InTime) AS hour, COUNT(*) AS count
        FROM ParkingSession
        WHERE LotID = @LotID
        GROUP BY DATEPART(HOUR, InTime)
        ORDER BY hour;

        SELECT c.Type AS type, COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS percentage
        FROM ParkingSession ps
        JOIN Car c ON ps.CarID = c.CarID
        WHERE ps.LotID = @LotID
        GROUP BY c.Type;

        SELECT CONVERT(DATE, ps.InTime) AS date, SUM(ps.Charge) AS revenue
        FROM ParkingSession ps
        WHERE ps.LotID = @LotID
        GROUP BY CONVERT(DATE, ps.InTime)
        ORDER BY date;

        SELECT l.LotID, l.LotName, SUM(ps.Charge) AS revenue
        FROM ParkingSession ps
        JOIN Lot l ON ps.LotID = l.LotID
        WHERE l.LotOwnerID = @OwnerID
        GROUP BY l.LotID, l.LotName
        HAVING SUM(ps.Charge) > 0
        ORDER BY l.LotID;

        SELECT SUM(ps.Charge) AS currentDayRevenue
        FROM ParkingSession ps
        WHERE ps.LotID = @LotID 
        AND CONVERT(DATE, ps.InTime) = CONVERT(DATE, GETDATE())
        AND ps.OutTime IS NOT NULL
        AND CONVERT(DATE, ps.OutTime) = CONVERT(DATE, GETDATE());
      `);

    const result = {
      carsParked: query.recordsets[0][0].carsParked,
      ongoingSessions: query.recordsets[0][0].ongoingSessions,
      avgRating: query.recordsets[0][0].avgRating,
      avgHours: query.recordsets[0][0].avgHours,
      totalEarnings: query.recordsets[0][0].totalEarnings,
      totalSessions: query.recordsets[0][0].totalSessions,
      avgSessionDuration: query.recordsets[0][0].avgSessionDuration,
      returningCustomers: query.recordsets[0][0].returningCustomers,
      availableSpaces: `${query.recordsets[0][0].spacesAvailable} / ${query.recordsets[0][0].totalCapacity}`,
      peakHours: query.recordsets[1],
      carTypeCounts: query.recordsets[2],
      revenueOverTime: query.recordsets[3],
      revenueComparison: query.recordsets[4],
      currentDayRevenue: query.recordsets[5][0]?.currentDayRevenue || 0,
    };

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};









exports.getLots = async (ownerID) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("OwnerID", sql.Int, ownerID)
      .query(`
        SELECT LotID, LotName
        FROM Lot
        WHERE LotOwnerID = @OwnerID
      `);

    return query.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
