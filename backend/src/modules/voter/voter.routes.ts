import { Router } from "express";
import multer from "multer";
import { VoterController } from "./voter.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
    createVoterSchema,
    updateVoterSchema,
    searchVoterSchema,
} from "./voter.schema.js";

const router = Router();

// Multer config for CSV upload (in-memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (_req, file, cb) => {
        if (
            file.mimetype === "text/csv" ||
            file.originalname.endsWith(".csv")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"));
        }
    },
});

// All routes require authentication
router.use(authenticate);

// ─── Export / Import (must be before :id routes) ──────────────────────
router.get(
    "/export/csv",
    authorize("SUPER_ADMIN"),
    VoterController.exportCsv
);

router.post(
    "/import/csv",
    authorize("SUPER_ADMIN"),
    upload.single("file"),
    VoterController.importCsv
);

// ─── Search / List ────────────────────────────────────────────────────
router.get(
    "/",
    validate(searchVoterSchema, "query"),
    VoterController.search
);

// ─── CRUD ─────────────────────────────────────────────────────────────
router.post(
    "/",
    authorize("SUPER_ADMIN"),
    validate(createVoterSchema),
    VoterController.create
);

router.get("/:id", VoterController.getById);

router.put(
    "/:id",
    authorize("SUPER_ADMIN"),
    validate(updateVoterSchema),
    VoterController.update
);

router.delete(
    "/:id",
    authorize("SUPER_ADMIN"),
    VoterController.delete
);

export default router;
