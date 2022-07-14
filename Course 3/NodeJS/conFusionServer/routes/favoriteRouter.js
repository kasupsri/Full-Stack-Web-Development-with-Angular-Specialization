const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorites = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          var dishIds = [];
          //Check if the request body is an array and populate the array
          if (Array.isArray(req.body)) {
            for (var i = req.body.length - 1; i >= 0; i--) {
              dishIds.push(req.body[i]._id);
            }
          }

          if (favorite != null) {
            //Favorites exists
            for (var i = 0; i < dishIds.length; i++) {
              if (favorite.dishes.indexOf(dishIds[i]) < 0) {
                //If the dish does not exist in the current list of favorites
                favorite.dishes.push(dishIds[i]);
              }
            }

            favorite.save().then(
              (favorite) => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              },
              (err) => next(err)
            );
          } else {
            //We have create a favorite entry for this user
            for (i = 0; i < req.body.length; i++)
              if (favorite.dishes.indexOf(req.body[i]._id) < 0)
                favorite.dishes.push(req.body[i]);
            favorite
              .save()
              .then((favorite) => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              })
              .catch((err) => {
                return next(err);
              });
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({ user: req.user._id })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

//favorites/dishid
favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ exists: false, favorites: favorites });
          } else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: false, favorites: favorites });
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          var dishId = req.params.dishId;

          if (favorite != null) {
            //Favorites exists
            if (favorite.dishes.indexOf(dishId) < 0) {
              //If the dish does not exist in the current list of favorites
              favorite.dishes.push(dishId);
            }

            favorite.save().then(
              (favorite) => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              },
              (err) => next(err)
            );
          } else {
            //We have create a favorite entry for this user
            if (favorite.dishes.indexOf(req.params.dishId) < 0) {
              favorite.dishes.push(req.body);
              favorite
                .save()
                .then((favorite) => {
                  Favorites.findById(favorite._id)
                    .populate("user")
                    .populate("dishes")
                    .then((favorite) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(favorite);
                    });
                })
                .catch((err) => {
                  return next(err);
                });
            }
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/:dishId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          var dishId = req.params.dishId;

          if (favorite != null) {
            //Favorites exists

            for (var i = favorite.dishes.length - 1; i >= 0; i--) {
              //Delete all occurences of the dishId
              if (favorite.dishes[i].equals(dishId)) {
                favorite.dishes.splice(i, 1);
              }
            }

            favorite.save().then(
              (favorite) => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              },
              (err) => next(err)
            );
          } else {
            //Assignment did not specify if we have to create a Favorite object in this scenario
            err = new Error("No Favorites is found for this user");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
