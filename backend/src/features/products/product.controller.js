import { productService } from "./product.service.js";
import {
  cleanupUploadedFile,
  removeUploadedFileByUrl,
} from "../../middlewares/upload.middleware.js";

export const productController = {
  async getAll(req, res) {
    try {
      const activeOnly = req.query.active === "true" || req.query.activeOnly === "true";
      const category = req.query.category || null;

      const products = await productService.getAllProducts({ activeOnly, category });
      res.status(200).json(products);
    } catch (error) {
      console.error("ERROR BACKEND (GET PRODUCTS):", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const payload = {
        ...req.body,
        ...(req.uploadedFileUrl ? { imageUrl: req.uploadedFileUrl } : {}),
      };
      const created = await productService.createProduct(payload);
      res.status(201).json({
        message: "Producto creado correctamente",
        product: created,
      });
    } catch (error) {
      cleanupUploadedFile(req.file);
      console.error("ERROR BACKEND (CREATE PRODUCT):", error);
      res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const previousProduct = req.uploadedFileUrl
        ? await productService.getProductById(req.params.id).catch(() => null)
        : null;
      const payload = {
        ...req.body,
        ...(req.uploadedFileUrl ? { imageUrl: req.uploadedFileUrl } : {}),
      };
      const updated = await productService.updateProduct(req.params.id, payload);
      if (
        req.uploadedFileUrl &&
        previousProduct?.image_url &&
        previousProduct.image_url !== req.uploadedFileUrl
      ) {
        await removeUploadedFileByUrl(previousProduct.image_url);
      }
      res.status(200).json({
        message: "Producto actualizado correctamente",
        product: updated,
      });
    } catch (error) {
      cleanupUploadedFile(req.file);
      console.error("ERROR BACKEND (UPDATE PRODUCT):", error);
      res.status(400).json({ error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const isActive = req.body.is_active !== undefined
        ? req.body.is_active
        : (req.body.isActive !== undefined ? req.body.isActive : (req.body.status !== "Inactivo"));

      const updated = await productService.updateProductStatus(id, Boolean(isActive));
      res.status(200).json({
        message: "Estado del producto actualizado en PostgreSQL",
        product: updated,
      });
    } catch (error) {
      console.error("ERROR BACKEND (UPDATE PRODUCT STATUS):", error);
      res.status(400).json({ error: error.message });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await productService.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
