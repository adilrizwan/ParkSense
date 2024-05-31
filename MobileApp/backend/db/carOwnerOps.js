const sql = require("mssql");
const { pool } = require("./sqlConfig");
const paginate = require("../middleware/pagination");
const carOwnerOps = require('./carOwnerOps'); 


exports.viewVehicles = async (ID, offset, pageSize) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("ID", sql.Int, ID)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize)
      .query(`EXEC ViewVehicles @ID, @offset, @pageSize`);
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
      MyVehicles: query.recordsets[1],
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
      .query(`SELECT * from CarOwner where ID = @ID`);
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
      .input("FirstName", sql.VarChar, post.FirstName)
      .input("LastName", sql.VarChar, post.LastName)
      .input("Gender", sql.VarChar, post.Gender)
      .input("DOB", sql.Date, post.DOB)
      .input("City", sql.VarChar, post.City)
      .input("Country", sql.VarChar, post.Country)
      .input("PhoneNo", sql.VarChar, post.PhoneNo)
      .input("AvatarID", sql.TinyInt, post.AvatarID)
      .query(
        `EXEC UpdateCarOwnerProfile @ID, @FirstName, @LastName, @Gender, @DOB, @City, @Country, @PhoneNo, @AvatarID`
      );
    // .query(`IF EXISTS (SELECT 1 FROM CarOwner WHERE ID = @ID)
    //       BEGIN
    //           UPDATE CarOwner SET
    //               FirstName = @FirstName,
    //               LastName = @LastName,
    //               Gender = @Gender,
    //               DOB = @DOB,
    //               City = @City,
    //               Country = @Country,
    //               PhoneNo = @PhoneNo
    //           WHERE ID = @ID;
    //           SELECT 1;
    //       END
    //       ELSE
    //       BEGIN
    //           SELECT 0;
    //       END`);
    console.log(result.recordset);
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
exports.addCar = async (ID, post) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS;
    const request = query.request();
    const result = await request
      .input("ID", sql.Int, ID)
      .input("RegistrationNumber", sql.VarChar, post.RegNo.toUpperCase())
      .input("Make", sql.VarChar, post.Make)
      .input("Model", sql.VarChar, post.Model)
      .input("RegYear", sql.Int, post.RegYear)
      .input("Color", sql.VarChar, post.Color)
      .input("Type", sql.VarChar, post.Type)
      .input("RegisteredCountry", sql.VarChar, post.RegisteredCountry)
      .input("RegisteredCity", sql.VarChar, post.RegisteredCity)
      .query(
        `EXEC AddCar @ID, @RegistrationNumber, @Make, @Model, @RegYear, @Color, @Type, @RegisteredCountry, @RegisteredCity`
      );
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
exports.deleteCar = async (OwnerID, RegNo) => {
  try {
    // let pool = await mssql.connect(config);
    let poolS = await pool;
    let query = await poolS;
    const request = query.request();
    const result = await request
      .input("OwnerID", sql.Int, OwnerID)
      .input("RegNo", sql.VarChar, RegNo)
      // .input("Status", sql.VarChar, post.Status)
      .query(`EXEC DeleteCar @OwnerID, @RegNo`);
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

exports.startSession = async (carRegNo, lotID, inTime, dayIn, userId) => {
  try {
    let poolS = await pool;

    const ongoingSessionQuery = await poolS
      .request()
      .input("CarRegNo", sql.VarChar(10), carRegNo)
      .query(`SELECT * FROM ParkingSession WHERE CarRegNo = @CarRegNo AND OutTime IS NULL`);

    if (ongoingSessionQuery.recordset.length > 0) {
      throw new Error("Cannot start a new parking session. An ongoing session already exists for this car.");
    }
    const userCoins = await carOwnerOps.getUserCoins(userId);
    console.log(userCoins.Coins)
    if (userCoins.Coins < 0) {
      throw new Error("Insufficient coins.");
    }
    
    const query = await poolS
      .request()
      .input("CarRegNo", sql.VarChar(10), carRegNo)
      .input("LotID", sql.Int, lotID)
      .input("InTime", sql.DateTime, inTime)
      .input("DayIn", sql.Int, dayIn)
      .query(`INSERT INTO ParkingSession (CarRegNo, LotID, InTime, DayIn) VALUES (@CarRegNo, @LotID, @InTime, @DayIn); UPDATE Lot SET SpaceAvailable = SpaceAvailable - 1 
      WHERE LotID = @LotID AND SpaceAvailable > 0;`);
    
    return query;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.endSession = async (carRegNo, outTime, dayOut) => {
  try {
    let poolS = await pool;
    let queryInTime = await poolS
      .request()
      .input("CarRegNo", sql.VarChar(10), carRegNo)
      .query(`SELECT InTime FROM ParkingSession WHERE CarRegNo = @CarRegNo AND OutTime IS NULL`);
    const inTime = queryInTime.recordset[0].InTime;
    
    const durationInMs = outTime.getTime() - new Date(inTime).getTime();
    const durationInHours = durationInMs / (1000 * 60 * 60);
    
    let queryHourlyRate = await poolS
      .request()
      .input("CarRegNo", sql.VarChar(10), carRegNo)
      .query(`SELECT * FROM HourlyRate WHERE LotID IN (SELECT LotID FROM ParkingSession WHERE CarRegNo = @CarRegNo)`);
    const hourlyRate = queryHourlyRate.recordset[0]; 

    let charge = 0;
    for (let i = 0; i < 24; i++) {
      charge += hourlyRate[`Hour${i < 10 ? '0' + i : i}`] * (i < durationInHours ? 1 : durationInHours / i);
    }

    let queryCarOwner = await poolS
      .request()
      .input("CarRegNo", sql.VarChar(10), carRegNo)
      .query(`SELECT OwnerID FROM Car WHERE RegistrationNumber = @CarRegNo`);
    
    const ownerId = queryCarOwner.recordset[0].OwnerID;

    let queryUserCoins = await poolS
      .request()
      .input("UserID", sql.Int, ownerId)
      .query(`SELECT Coins FROM CarOwner WHERE ID = @UserID`);

    const currentCoins = queryUserCoins.recordset[0].Coins;

    // if (currentCoins < charge) {
    //   throw new Error("Insufficient coins.");
    // }

    const newCoins = currentCoins - charge;

    await poolS
      .request()
      .input("UserID", sql.Int, ownerId)
      .input("NewCoins", sql.Decimal(10, 2), newCoins)
      .query(`UPDATE CarOwner SET Coins = @NewCoins WHERE ID = @UserID`);

    let queryUpdate = await poolS
      .request()
      .input("CarRegNo", sql.VarChar(10), carRegNo)
      .input("OutTime", sql.DateTime, outTime)
      .input("DayOut", sql.Int, dayOut)
      .input("Charge", sql.Decimal(10, 2), charge)
      .query(`UPDATE ParkingSession 
              SET OutTime = @OutTime, DayOut = @DayOut, Charge = @Charge 
              WHERE CarRegNo = @CarRegNo AND OutTime IS NULL; UPDATE Lot SET SpaceAvailable = SpaceAvailable + 1 
              WHERE LotID = @LotID;`);

    return { rowsAffected: queryUpdate.rowsAffected[0], charge };
  } catch (error) {
    console.log(error);
    throw error;
  }
};



exports.getCurrentSessions = async (userID) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("UserID", sql.Int, userID)
      .query(`SELECT ps.*, c.RegistrationNumber, c.Make, c.Model, l.LotName
              FROM ParkingSession ps
              INNER JOIN Car c ON ps.CarRegNo = c.RegistrationNumber
              INNER JOIN Lot l ON ps.LotID = l.LotID
              WHERE c.OwnerID = @UserID AND ps.OutTime IS NULL`);
    return query.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


exports.getUserPastSessions = async (userID) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("UserID", sql.Int, userID)
      .query(`SELECT ps.*, c.RegistrationNumber, c.Make, c.Model, l.LotName
              FROM ParkingSession ps
              INNER JOIN Car c ON ps.CarRegNo = c.RegistrationNumber
              INNER JOIN Lot l ON ps.LotID = l.LotID
              WHERE c.OwnerID = @UserID AND ps.OutTime IS NOT NULL`);
    return query.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getAllSessions = async (userID) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("UserID", sql.Int, userID)
      .query(`SELECT ps.*, c.RegistrationNumber, c.Make, c.Model, l.LotName
              FROM ParkingSession ps
              INNER JOIN Car c ON ps.CarRegNo = c.RegistrationNumber
              INNER JOIN Lot l ON ps.LotID = l.LotID
              WHERE c.OwnerID = @UserID`);
    return query.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getRecentParkingLots = async (userID, limit) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("UserID", sql.Int, userID)
      .input("Limit", sql.Int, limit)
      .query(`SELECT DISTINCT TOP (@Limit) LotID, InTime
      FROM ParkingSession 
      WHERE CarRegNo IN (SELECT RegistrationNumber FROM Car WHERE OwnerID = @UserID)
      ORDER BY InTime DESC
      `);
    return query.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getFrequentParkingLots = async (userID, limit) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("UserID", sql.Int, userID)
      .input("Limit", sql.Int, limit)
      .query(`SELECT TOP (@Limit) LotID, COUNT(*) AS Visits
              FROM ParkingSession
              WHERE CarRegNo IN (SELECT RegistrationNumber FROM Car WHERE OwnerID = @UserID)
              GROUP BY LotID
              ORDER BY Visits DESC`);
    return query.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getLotInfo = async () => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .query(`SELECT 
                Lot.LotID,
                Lot.LotName,
                CONCAT(Lot.AddressL1, ', ', Lot.AddressL2, ', ', Lot.City, ', ', Lot.Country) AS Location,
                Lot.TotalZones AS TotalZones,
                SUM(LotZone.capacity) AS TotalLotCapacity,
                SUM(LotZone.capacity - ISNULL(LotZone.available, 0)) AS TotalLotOccupied,
                SUM(ISNULL(LotZone.available, 0)) AS TotalLotAvailability,
                (
                  SELECT 
                    CONCAT('[', 
                      STRING_AGG(
                        CONCAT('{"ZoneID": ', LotZone.ZoneID, ', "Capacity": ', LotZone.capacity, ', "Available": ', ISNULL(LotZone.available, 0), '}'),
                        ', '
                      ), 
                      ']'
                    )
                  FROM 
                    LotZone 
                  WHERE 
                    LotZone.LotID = Lot.LotID
                ) AS ZoneDetails
              FROM 
                Lot
              LEFT JOIN 
                LotZone ON Lot.LotID = LotZone.LotID
              GROUP BY 
                Lot.LotID, Lot.LotName, Lot.AddressL1, Lot.AddressL2, Lot.City, Lot.Country, Lot.TotalZones`);
    return query.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


exports.getUserCoins = async (userId) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("UserID", sql.Int, userId)
      .query(`SELECT Coins FROM CarOwner WHERE ID = @UserID`);
    return query.recordset[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getUserTransactionHistory = async (userId) => {
  try {
    let poolS = await pool;
    let query = await poolS
      .request()
      .input("UserID", sql.Int, userId)
      .query(`
      SELECT MESA.Amount,
      MESA.Date,
      MESA.Type,
      Kiosk.Name AS Name FROM 
      (SELECT 
         Amount AS Amount, 
         TopupDate AS Date, 
         'Topup' AS Type,
     KioskID AS ID
       FROM 
         KioskTopups 
       WHERE 
         CarOwnerID = @UserID ) AS MESA

     left join Kiosk on MESA.ID = Kiosk.KioskID

     union all 

     Select  MESAS.Amount,
   MESAS.Date,
   MESAS.Type,
   Lot.LotName as Name From
       (SELECT 
         -Charge AS Amount, 
         OutTime AS Date, 
         'Charge' AS Type ,
     LotID AS ID
       FROM 
         ParkingSession 
       WHERE 
         CarRegNo IN (SELECT RegistrationNumber FROM Car WHERE OwnerID = @UserID)
   ) as MESAS
   left join 
   Lot on Lot.LotID = MESAS.ID
       ORDER BY 
         Date DESC 
      `);
    return query.recordset;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

