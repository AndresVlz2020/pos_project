import { sessionService } from "./session.service.js";

export const sessionController = {
  async getCurrent(req, res, next) {
    try {
      const data = await sessionService.getCurrent(req.user);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async heartbeat(req, res, next) {
    try {
      const data = await sessionService.heartbeat(req.user);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async end(req, res, next) {
    try {
      const data = await sessionService.end(req.user);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getActiveStaff(req, res, next) {
    try {
      const rows = await sessionService.getActiveStaff();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const filterUserId = req.query.userId || null;
      const rows = await sessionService.getHistory(req.user, filterUserId);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },
};
