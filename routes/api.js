/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var ObjectId = require("mongodb").ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
  app
    .route("/api/issues/:project")

    .get(function(req, res) {
      var project = req.params.project;
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          // Get the documents collection
          const collection = db.collection(project);
          let query = req.query || {};
          collection.find(query).execute(data => {
            res.json(data);
          });
        }
      );
    })

    .post(function(req, res) {
      var project = req.params.project;
      // issue_title, issue_text, created_by, and optional assigned_to and status_text.
      let {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body;
      let created_on = new Date().getTime();
      let updated_on = created_on;
      let open = true;
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          // Get the documents collection
          const collection = db.collection(project);
          collection
            .insertOne({
              issue_title,
              issue_text,
              created_by,
              assigned_to,
              status_text,
              open,
              created_on,
              updated_on
            })
            .then(data => {
              // MongoClient.close();
              res.json(data);
            });
        }
      );
    })

    .put(function(req, res) {
      var project = req.params.project;
      //     1. 如果参数正常，更新doc，并返回 'successfully updated'；
      //     2. 如果未找到对应的doc，返回 'could not update '+_id.
      //     3. 如果没有发送更新的内容，返回 'no updated field sent'.
      let {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body;
      if (!_id) {
        return res.send("_id could not be empty");
      }
      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text
      ) {
        return res.send("no updated field sent");
      }
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          // Get the documents collection
          const collection = db.collection(project);
          let updated_on = new Date().getTime();
          let updData = {
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
            updated_on
          };
          collection
            .findOneAndUpdate({ _id }, { $set: updData })
            .then(data => {
              // MongoClient.close();
              if (!data) {
                return res.send("could not update " + _id);
              }
              res.send("successfully updated");
            })
            .catch(e => {
              console.log(e);
            });
        }
      );
    })

    .delete(function(req, res) {
      var project = req.params.project;
      let _id = req.body._id;
      if (!_id) {
        res.send("_id error");
      }
      MongoClient.connect(
        CONNECTION_STRING,
        function(err, db) {
          // Get the documents collection
          const collection = db.collection(project);
          collection
            .findOneAndDelete({ _id })
            .then(data => {
              if (!data) {
                return res.send("_id error");
              }
              res.json({ success: "deleted " + _id });
            })
            .catch(e => {
              return res.json({ fail: "could not delete " + _id });
            });
        }
      );
    });
};
