const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const Tag = require('../models/Tag');

const { notes } = require('../db/seed/notes');
const { folders } = require('../db/seed/folders');
const { tags } = require('../db/seed/tags');


mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags),
      Folder.createIndexes(),
      Tag.createIndexes()
    ]);
  })  
  .then(([FolderRes, TagRes, NoteRes]) => {
    console.info(`Inserted ${NoteRes.length} Notes`);
    console.info(`Inserted ${FolderRes.length} Folders`);
    console.info(`Inserted ${TagRes.length} Tags`);
  })
  .catch(err => {
    console.error(err);
  })
  .finally(() => mongoose.disconnect());