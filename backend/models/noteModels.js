const Note = require("../schema/Note");

const findAll = async () => {
  return await Note.findAll({
    attributes: ["id", "judul", "isi", "tanggal_dibuat"],
    order: [["tanggal_dibuat", "DESC"]],
  });
};

const create = async (data) => {
  return await Note.create(data);
};

const findById = async (id) => {
  return await Note.findByPk(id, {
    attributes: ["id", "judul", "isi", "tanggal_dibuat"],
  });
};

const update = async (id, data) => {
  await Note.update(data, { where: { id } });
  return await findById(id);
};

const deleteById = async (id) => {
  return await Note.destroy({ where: { id } });
};

module.exports = { findAll, create, findById, update, deleteById };
