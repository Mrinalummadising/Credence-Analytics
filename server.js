const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.resolve(__dirname, "pictures.db");

let db = null;

app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // Create the picture table if it doesn't exist
    const createPictureTableQuery = `
      CREATE TABLE IF NOT EXISTS picture (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image_url TEXT NOT NULL,
        summary TEXT NOT NULL
      );
    `;
    await db.run(createPictureTableQuery);

    // Array of picture data to be inserted
    const pictures = [
        {
            name: "Harry Potter and the Order of the Phoenix",
            img: "https://bit.ly/2IcnSwz",
            summary:
              "Harry Potter and Dumbledore's warning about the return of Lord Voldemort is not heeded by the wizard authorities who, in turn, look to undermine Dumbledore's authority at Hogwarts and discredit Harry.",
          },
          {
            name: "The Lord of the Rings: The Fellowship of the Ring",
            img: "https://bit.ly/2tC1Lcg",
            summary:
              "A young hobbit, Frodo, who has found the One Ring that belongs to the Dark Lord Sauron, begins his journey with eight companions to Mount Doom, the only place where it can be destroyed.",
          },
          {
            name: "Avengers: Endgame",
            img: "https://bit.ly/2Pzczlb",
            summary:
              "Adrift in space with no food or water, Tony Stark sends a message to Pepper Potts as his oxygen supply starts to dwindle. Meanwhile, the remaining Avengers -- Thor, Black Widow, Captain America, and Bruce Banner -- must figure out a way to bring back their vanquished allies for an epic showdown with Thanos -- the evil demigod who decimated the planet and the universe.",
          },
    ];

    // Insert the picture data into the table
    const insertPictureQuery = `
      INSERT INTO picture (name, image_url, summary)
      VALUES (?, ?, ?);
    `;
    for (const picture of pictures) {
      await db.run(insertPictureQuery, [picture.name, picture.img, picture.summary]);
    }

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// CRUD Operations for Pictures

// Create a Picture
app.post("/pictures/", async (request, response) => {
  try {
    const { name, imageUrl, summary } = request.body;
    const addPictureQuery = `
      INSERT INTO picture (name, image_url, summary)
      VALUES (?, ?, ?);
    `;
    await db.run(addPictureQuery, [name, imageUrl, summary]);
    response.send("Picture Successfully Added");
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// Read All Pictures
app.get("/pictures/", async (request, response) => {
  try {
    const getPicturesQuery = `
      SELECT * FROM picture ORDER BY id;
    `;
    const pictures = await db.all(getPicturesQuery);
    response.send(pictures);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// Read a Picture by ID
app.get("/pictures/:pictureId/", async (request, response) => {
  try {
    const { pictureId } = request.params;
    const getPictureQuery = `
      SELECT * FROM picture WHERE id = ?;
    `;
    const picture = await db.get(getPictureQuery, [pictureId]);
    if (!picture) {
      response.status(404).send({ error: "Picture not found" });
    } else {
      response.send(picture);
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// Update a Picture
app.put("/pictures/:pictureId/", async (request, response) => {
  try {
    const { pictureId } = request.params;
    const { name, imageUrl, summary } = request.body;
    const updatePictureQuery = `
      UPDATE picture
      SET name = ?, image_url = ?, summary = ?
      WHERE id = ?;
    `;
    await db.run(updatePictureQuery, [name, imageUrl, summary, pictureId]);
    response.send("Picture Updated Successfully");
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// Delete a Picture
app.delete("/pictures/:pictureId/", async (request, response) => {
  try {
    const { pictureId } = request.params;
    const deletePictureQuery = `
      DELETE FROM picture
      WHERE id = ?;
    `;
    await db.run(deletePictureQuery, [pictureId]);
    response.send("Picture Deleted Successfully");
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});
